import { criarCardLeilao } from '../components/auctionCard.js';
import { adicionarElementosFilhos, limparElemento, criarElemento } from '../components/dom.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { renderizarEstado } from '../components/statusMessage.js';
import { obterLeiloes, definirFavorito } from '../services/auctionService.js';
import { normalizarColecao } from '../services/api.js';
import { traduzir } from '../services/i18n.js';
import { verificarLeilaoEncerrado } from '../components/auctionStatus.js';

const featuredGrid = document.getElementById('featured-grid');
const endingGrid = document.getElementById('ending-grid');
const categoriesGrid = document.getElementById('categories-grid');
const previousButton = document.querySelector('.carousel-control.prev');
const nextButton = document.querySelector('.carousel-control.next');
const homeStatus = document.getElementById('home-status');
let auctions = [];

function renderizarListaLeiloes(container, items, emptyMessage) {
    limparElemento(container);
    if (!items.length) {
        renderizarEstado(container, 'empty', traduzir(emptyMessage));
        return;
    }
    items.forEach((auction) => container.appendChild(criarCardLeilao(auction, { showFavorite: true })));
}

function obterLeiloesDestaque(items) {
    return [...items]
        .filter((item) => !verificarLeilaoEncerrado(item.status))
        .sort((a, b) => Number(b.currentBid || b.startingBid || 0) - Number(a.currentBid || a.startingBid || 0))
        .slice(0, 3);
}

function obterLeiloesProximosEncerramento(items) {
    return [...items]
        .filter((item) => !verificarLeilaoEncerrado(item.status) && item.endsAt)
        .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
        .slice(0, 8);
}

function obterContagemCategorias(items) {
    return items.reduce((map, item) => {
        const category = item.category || 'Outros';
        map.set(category, (map.get(category) || 0) + 1);
        return map;
    }, new Map());
}

function renderizarCategorias(items) {
    limparElemento(categoriesGrid);
    const categories = [...obterContagemCategorias(items).entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!categories.length) {
        renderizarEstado(categoriesGrid, 'empty', traduzir('As categorias aparecerão quando houver itens disponíveis.'));
        return;
    }
    categories.forEach(([category, count]) => {
        const card = criarElemento('article', { className: 'category-card' });
        adicionarElementosFilhos(card, [
            criarElemento('h3', { text: traduzir(category) }),
            criarElemento('p', { text: traduzir('Itens disponíveis: {count}', { count }) }),
            criarElemento('a', {
                text: traduzir('Navegar na categoria'),
                attrs: { href: `html/categoria.html?categoria=${encodeURIComponent(category)}` }
            })
        ]);
        categoriesGrid.appendChild(card);
    });
}

function atualizarControlesCarrossel() {
    const maxScrollLeft = Math.max(0, endingGrid.scrollWidth - endingGrid.clientWidth);
    previousButton.disabled = endingGrid.scrollLeft <= 1;
    nextButton.disabled = endingGrid.scrollLeft >= maxScrollLeft - 1;
}

function renderizarPaginaInicial() {
    renderizarListaLeiloes(featuredGrid, obterLeiloesDestaque(auctions), 'Nenhum leilão em destaque no momento.');
    renderizarListaLeiloes(endingGrid, obterLeiloesProximosEncerramento(auctions), 'Nenhum leilão próximo do encerramento.');
    renderizarCategorias(auctions);
    atualizarControlesCarrossel();
}

function rolarCarrossel(direction) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endingGrid.scrollBy({ left: direction * 320, behavior: reducedMotion ? 'auto' : 'smooth' });
}

async function alternarFavorito(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await definirFavorito(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderizarPaginaInicial();
        homeStatus.className = 'success-state';
        homeStatus.textContent = traduzir(auction.isFavorite ? 'Leilão adicionado aos favoritos.' : 'Leilão removido dos favoritos.');
    } catch (error) {
        homeStatus.className = 'error-state';
        homeStatus.textContent = obterMensagemErroUsuario(error, traduzir('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.'));
        button.disabled = false;
    }
}

async function carregarPaginaInicial() {
    renderizarEstado(featuredGrid, 'loading', traduzir('Carregando leilões em destaque...'));
    renderizarEstado(endingGrid, 'loading', traduzir('Carregando leilões próximos do encerramento...'));
    renderizarEstado(categoriesGrid, 'loading', traduzir('Carregando categorias...'));
    try {
        auctions = normalizarColecao(await obterLeiloes());
        renderizarPaginaInicial();
    } catch (error) {
        const message = obterMensagemErroUsuario(error, traduzir('Não conseguimos carregar os leilões agora. Tente novamente em instantes.'));
        renderizarEstado(featuredGrid, 'error', message);
        renderizarEstado(endingGrid, 'error', message);
        renderizarEstado(categoriesGrid, 'error', message);
    }
}

featuredGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="favorite"]');
    if (button) alternarFavorito(button);
});
endingGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="favorite"]');
    if (button) alternarFavorito(button);
});
previousButton.addEventListener('click', () => rolarCarrossel(-1));
nextButton.addEventListener('click', () => rolarCarrossel(1));
endingGrid.addEventListener('scroll', atualizarControlesCarrossel);
window.addEventListener('resize', atualizarControlesCarrossel);
carregarPaginaInicial();
