import { criarElemento } from './dom.js';
import { criarIcone } from './icons.js';
import { fecharDialogo, criarBotaoFecharDialogo, inicializarDialogo, abrirDialogo } from './modal.js';
import { definirMensagemAoVivo } from './statusMessage.js';
import { obterMensagemErroUsuario } from './userError.js';
import { enviarAvaliacao } from '../services/feedbackService.js';
import { traduzir } from '../services/i18n.js';

function criarGrupoAvaliacao() {
    const fieldset = criarElemento('fieldset', { className: 'rating-fieldset' });
    fieldset.appendChild(criarElemento('legend', { text: traduzir('Sua avaliação') }));
    const group = criarElemento('div', { className: 'rating-options' });
    for (let rating = 1; rating <= 5; rating += 1) {
        const inputId = `feedback-rating-${rating}`;
        const label = criarElemento('label', { className: 'rating-option', attrs: { for: inputId }, dataset: { ratingValue: String(rating) } });
        const input = criarElemento('input', {
            attrs: { id: inputId, type: 'radio', name: 'rating', value: rating, required: 'required', 'aria-label': traduzir('{rating} de 5 estrelas', { rating }) }
        });
        const icon = criarIcone('star', { size: 28 });
        label.append(input, icon);
        group.appendChild(label);
    }
    group.addEventListener('change', (event) => {
        const selected = event.target.closest('input[name="rating"]');
        if (selected) atualizarVisualAvaliacao(group, selected.value);
    });
    fieldset.appendChild(group);
    return fieldset;
}

function atualizarVisualAvaliacao(group, selectedRating = 0) {
    group.querySelectorAll('.rating-option').forEach((option) => {
        const isActive = Number(option.dataset.ratingValue) <= Number(selectedRating);
        option.classList.toggle('rating-option--active', isActive);
    });
}

function criarFormularioAvaliacao() {
    const form = criarElemento('form', { className: 'feedback-form' });
    const commentsLabel = criarElemento('label', { text: traduzir('Comentários do feedback'), attrs: { for: 'feedback-comments' } });
    const comments = criarElemento('textarea', {
        attrs: { id: 'feedback-comments', name: 'comments', maxlength: 200, rows: 5, placeholder: traduzir('Descreva a sua experiência...') }
    });
    const status = criarElemento('p', { className: 'form-status', attrs: { role: 'status', 'aria-live': 'polite' } });
    const actions = criarElemento('div', { className: 'dialog-actions' });
    actions.append(
        criarElemento('button', { className: 'btn-secondary', text: traduzir('Cancelar'), attrs: { type: 'button' }, dataset: { dialogClose: 'true' } }),
        criarElemento('button', { className: 'btn-primary', text: traduzir('Enviar'), attrs: { type: 'submit' } })
    );
    form.append(criarGrupoAvaliacao(), commentsLabel, comments, status, actions);
    return form;
}


async function enviarFormularioAvaliacao(event, dialog) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('[type="submit"]');
    const data = new FormData(form);
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir('Enviando avaliação...'));
    try {
        await enviarAvaliacao({
            rating: Number(data.get('rating')),
            comments: data.get('comments')
        });
        definirMensagemAoVivo(status, traduzir('Obrigado pelo seu feedback!'));
        form.reset();
        atualizarVisualAvaliacao(form.querySelector('.rating-options'));
        window.setTimeout(() => fecharDialogo(dialog), 600);
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos enviar sua avaliação agora. Tente novamente em instantes.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

export function inicializarModalAvaliacao() {
    const dialog = criarElemento('dialog', {
        className: 'midas-dialog feedback-dialog', attrs: { 'aria-labelledby': 'feedback-title' }
    });
    dialog.append(
        criarBotaoFecharDialogo(traduzir('Fechar')),
        criarElemento('h2', { text: traduzir('Dê-nos o seu feedback'), attrs: { id: 'feedback-title' } }),
        criarElemento('p', { text: traduzir('Avalie como é sua experiência na nossa plataforma.') })
    );
    const form = criarFormularioAvaliacao();
    dialog.appendChild(form);
    document.body.appendChild(dialog);
    inicializarDialogo(dialog);
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-open-feedback]');
        if (trigger) abrirDialogo(dialog, trigger);
    });
    form.addEventListener('submit', (event) => enviarFormularioAvaliacao(event, dialog));
}
