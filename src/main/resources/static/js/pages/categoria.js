import { criarCardLeilao } from '../components/auctionCard.js';
import { adiarExecucao, filtrarLeiloes, ordenarLeiloes } from '../components/auctionFilters.js';
import { sincronizarCampoMarca } from '../components/catalogConfig.js';
import { limparElemento } from '../components/dom.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { renderizarEstado } from '../components/statusMessage.js';
import { obterLeiloes, definirFavorito } from '../services/auctionService.js';
import { normalizarColecao } from '../services/api.js';
import { traduzir } from '../services/i18n.js';
import { obterEstadosFisicos, obterRaridades } from '../services/productService.js';
import { preencherSelectComOpcoes } from '../components/selectOptions.js';

const form = document.getElementById('category-filter-form');
const grid = document.getElementById('category-grid');
const title = document.getElementById('category-title');
const description = document.getElementById('category-description');
const summary = document.getElementById('category-result-summary');
const brandField = document.getElementById('filter-brand-field');
const brandInput = document.getElementById('filter-brand');
const conditionSelect = document.getElementById('filter-condition');
const raritySelect = document.getElementById('filter-rarity');
const category = new URLSearchParams(window.location.search).get('categoria') || 'Todos';
let auctions = [];

function obterFiltros() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        sort: data.get('sort'),
        brand: data.get('brand'),
        condition: data.get('condition'),
        rarity: data.get('rarity'),
        category: category === 'Todos' ? 'all' : category
    };
}

function renderizarResultados() {
    const filters = obterFiltros();
    const filtered = ordenarLeiloes(filtrarLeiloes(auctions, filters), filters.sort);
    limparElemento(grid);
    summary.textContent = traduzir('Itens encontrados: {count}', { count: filtered.length });
    if (!filtered.length) {
        renderizarEstado(grid, 'empty', traduzir('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
        return;
    }
    filtered.forEach((auction) => grid.appendChild(criarCardLeilao(auction, { showFavorite: true })));
}

async function alternarFavorito(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await definirFavorito(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderizarResultados();
    } catch (error) {
        summary.textContent = obterMensagemErroUsuario(error, traduzir('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.'));
    } finally {
        button.disabled = false;
    }
}

async function carregarOpcoesFiltros() {
    const [estados, raridades] = await Promise.all([obterEstadosFisicos(), obterRaridades()]);
    preencherSelectComOpcoes(conditionSelect, estados, { placeholder: traduzir('Todos os estados') });
    preencherSelectComOpcoes(raritySelect, raridades, { placeholder: traduzir('Todas as raridades') });
}

async function carregarCategoria() {
    const translatedCategory = category === 'Todos' ? traduzir('Todas as categorias') : traduzir(category);
    title.textContent = category === 'Todos' ? traduzir('Catálogo de Leilões') : traduzir('Catálogo de {category}', { category: translatedCategory });
    description.textContent = category === 'Todos'
        ? traduzir('Explore os itens disponíveis em todas as categorias.')
        : traduzir('Explore os itens disponíveis em {category}.', { category: translatedCategory });
    sincronizarCampoMarca(category, brandField, brandInput);
    renderizarEstado(grid, 'loading', traduzir('Carregando itens...'));
    try {
        await carregarOpcoesFiltros();
        auctions = normalizarColecao(await obterLeiloes());
        renderizarResultados();
    } catch (error) {
        renderizarEstado(grid, 'error', obterMensagemErroUsuario(error, traduzir('Não conseguimos carregar os itens desta categoria agora. Tente novamente em instantes.')));
    }
}

form.addEventListener('input', adiarExecucao(renderizarResultados));
form.addEventListener('change', renderizarResultados);
form.addEventListener('reset', () => window.setTimeout(renderizarResultados));
grid.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) alternarFavorito(favoriteButton);
});
carregarCategoria();
