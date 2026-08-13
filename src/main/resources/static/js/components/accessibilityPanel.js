import { criarElemento } from './dom.js';
import { criarIcone } from './icons.js';
import { obterConfiguracoes, restaurarConfiguracoes, salvarConfiguracoes } from '../services/settingsService.js';
import { fecharDialogo, criarBotaoFecharDialogo, inicializarDialogo, abrirDialogo } from './modal.js';
import { traduzir } from '../services/i18n.js';

function criarCampoSelecao(id, label, options, value) {
    const wrapper = criarElemento('div', { className: 'settings-field' });
    const labelElement = criarElemento('label', { text: traduzir(label), attrs: { for: id } });
    const select = criarElemento('select', { attrs: { id, name: id } });
    options.forEach(([optionValue, text]) => {
        const option = criarElemento('option', { text: traduzir(text), attrs: { value: optionValue } });
        option.selected = optionValue === value;
        select.appendChild(option);
    });
    wrapper.append(labelElement, select);
    return wrapper;
}

function criarCaixaSelecao(id, label, checked) {
    const wrapper = criarElemento('label', { className: 'checkbox-row', attrs: { for: id } });
    const input = criarElemento('input', { attrs: { id, name: id, type: 'checkbox' } });
    input.checked = checked;
    wrapper.append(input, criarElemento('span', { text: traduzir(label) }));
    return wrapper;
}

function criarFormularioPainel(settings) {
    const form = criarElemento('form', { className: 'accessibility-form' });
    form.append(
        criarCampoSelecao('a11y-theme', 'Tema', [['dark', 'Escuro'], ['light', 'Claro']], settings.theme),
        criarCampoSelecao('a11y-contrast', 'Contraste', [['normal', 'Normal'], ['high', 'Alto contraste']], settings.contrast),
        criarCampoSelecao('a11y-font', 'Tamanho da fonte', [['small', 'Pequena'], ['medium', 'Média'], ['large', 'Grande'], ['xlarge', 'Muito grande']], settings.fontSize),
        criarCampoSelecao('a11y-colors', 'Ajuste de cores', [['none', 'Padrão'], ['protanopia', 'Protanopia'], ['deuteranopia', 'Deuteranopia'], ['tritanopia', 'Tritanopia']], settings.colorVision),
        criarCaixaSelecao('a11y-motion', 'Reduzir animações', settings.reduceMotion)
    );
    const actions = criarElemento('div', { className: 'dialog-actions' });
    actions.append(
        criarElemento('button', { className: 'btn-secondary', text: traduzir('Cancelar'), attrs: { type: 'button' }, dataset: { dialogClose: 'true' } }),
        criarElemento('button', { className: 'btn-secondary', text: traduzir('Restaurar padrão'), attrs: { type: 'button' }, dataset: { resetA11y: 'true' } }),
        criarElemento('button', { className: 'btn-primary', text: traduzir('Aplicar'), attrs: { type: 'submit' } })
    );
    form.appendChild(actions);
    return form;
}

function lerFormulario(form) {
    return {
        theme: form.elements['a11y-theme'].value,
        contrast: form.elements['a11y-contrast'].value,
        fontSize: form.elements['a11y-font'].value,
        colorVision: form.elements['a11y-colors'].value,
        reduceMotion: form.elements['a11y-motion'].checked,
        language: obterConfiguracoes().language
    };
}


export function inicializarPainelAcessibilidade() {
    const button = criarElemento('button', {
        className: 'accessibility-fab', attrs: { type: 'button', 'aria-label': traduzir('Abrir painel de acessibilidade') }
    });
    button.appendChild(criarIcone('accessibility', { size: 30 }));
    const dialog = criarElemento('dialog', {
        className: 'midas-dialog accessibility-dialog', attrs: { 'aria-labelledby': 'a11y-title' }
    });
    const title = criarElemento('h2', { text: traduzir('Acessibilidade'), attrs: { id: 'a11y-title' } });
    const description = criarElemento('p', {
        text: traduzir('Personalize a visualização. As preferências ficam salvas neste navegador.')
    });
    const form = criarFormularioPainel(obterConfiguracoes());
    dialog.append(criarBotaoFecharDialogo(traduzir('Fechar')), title, description, form);
    document.body.append(button, dialog);
    inicializarDialogo(dialog);

    button.addEventListener('click', () => abrirDialogo(dialog, button));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        salvarConfiguracoes(lerFormulario(form));
        fecharDialogo(dialog);
    });
    form.querySelector('[data-reset-a11y]').addEventListener('click', () => {
        restaurarConfiguracoes();
        fecharDialogo(dialog);
        window.location.reload();
    });
}
