import { adicionarElementosFilhos, limparElemento, criarElemento } from '../components/dom.js';
import { criarIcone } from '../components/icons.js';
import { renderizarEstado } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { normalizarColecao } from '../services/api.js';
import { obterAvaliacoesEmDestaque } from '../services/feedbackService.js';
import { traduzir } from '../services/i18n.js';

const grid = document.getElementById('testimonials-grid');

function criarAvaliacao(rating) {
    const ratingElement = criarElemento('p', {
        className: 'rating',
        attrs: { 'aria-label': traduzir('Avaliação: {rating} de 5 estrelas', { rating }) }
    });
    const stars = criarElemento('span', { className: 'rating-stars', attrs: { 'aria-hidden': 'true' } });
    for (let index = 1; index <= 5; index += 1) {
        stars.appendChild(criarIcone('star', { size: 19, filled: index <= rating }));
    }
    ratingElement.appendChild(stars);
    return ratingElement;
}

function criarDepoimento(feedback) {
    const article = criarElemento('article', { className: 'testimonial-card' });
    const header = criarElemento('div', { className: 'testimonial-header' });
    const userInfo = criarElemento('div', { className: 'user-info' });
    const avatar = criarElemento('div', { className: 'user-avatar-placeholder', attrs: { 'aria-hidden': 'true' } });
    const userText = criarElemento('div');
    userText.append(
        criarElemento('h3', { className: 'user-name', text: feedback.anonymous ? traduzir('Usuário anônimo') : feedback.userName || traduzir('Usuário Midas') }),
        criarElemento('span', { className: 'user-role', text: feedback.role || traduzir('Usuário da plataforma') })
    );
    userInfo.append(avatar, userText);
    const rating = Math.max(1, Math.min(5, Number(feedback.rating || 5)));
    adicionarElementosFilhos(header, [userInfo, criarAvaliacao(rating)]);
    adicionarElementosFilhos(article, [header, criarElemento('p', { className: 'testimonial-text', text: feedback.comments || traduzir('Avaliação sem comentário.') })]);
    return article;
}

async function carregarDepoimentos() {
    renderizarEstado(grid, 'loading', traduzir('Carregando avaliações...'));
    try {
        const feedbacks = normalizarColecao(await obterAvaliacoesEmDestaque()).slice(0, 4);
        limparElemento(grid);
        if (!feedbacks.length) {
            renderizarEstado(grid, 'empty', traduzir('Ainda não há avaliações publicadas. Você pode enviar a primeira pelo botão “Avaliar plataforma”.'));
            return;
        }
        feedbacks.forEach((feedback) => grid.appendChild(criarDepoimento(feedback)));
    } catch (error) {
        renderizarEstado(grid, 'error', obterMensagemErroUsuario(error, traduzir('Não conseguimos carregar as avaliações agora. Tente novamente em instantes.')));
    }
}

carregarDepoimentos();
