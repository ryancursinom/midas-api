import { criarCardLeilao } from '../components/auctionCard.js';
import { adiarExecucao, filtrarLeiloes, ordenarLeiloes } from '../components/auctionFilters.js';
import { sincronizarCampoMarca } from '../components/catalogConfig.js';
import { adicionarElementosFilhos, limparElemento, criarElemento } from '../components/dom.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { renderizarEstado } from '../components/statusMessage.js';
import { obterLeiloes, definirFavorito } from '../services/auctionService.js';
import { normalizarColecao } from '../services/api.js';
import { traduzir } from '../services/i18n.js';
import { obterCategorias, obterEstadosFisicos, obterRaridades } from '../services/productService.js';
import { preencherSelectComOpcoes } from '../components/selectOptions.js';

const form = document.getElementById('catalog-search-form');
const content = document.getElementById('catalog-content');
const status = document.getElementById('catalog-status');
const categorySelect = document.getElementById('catalog-category');
const conditionSelect = document.getElementById('catalog-condition');
const raritySelect = document.getElementById('catalog-rarity');
const brandField = document.getElementById('catalog-brand-field');
const brandInput = document.getElementById('catalog-brand');
let auctions = [];

function obterFiltros() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        sort: data.get('sort'),
        category: data.get('category'),
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        brand: data.get('brand'),
        condition: data.get('condition'),
        rarity: data.get('rarity')
    };
}

function agruparPorCategoria(items) {
    return items.reduce((groups, auction) => {
        const category = auction.category || 'Outros';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(auction);
        return groups;
    }, new Map());
}

function criarCabecalhoCategoria(category, count) {
    const header = criarElemento('header', { className: 'catalog-category-header' });
    const titleGroup = criarElemento('div', { className: 'catalog-category-title' });
    titleGroup.append(
        criarElemento('h2', { text: traduzir(category) }),
        criarElemento('span', {
            className: 'catalog-category-count',
            text: traduzir('Itens encontrados: {count}', { count })
        })
    );
    header.appendChild(titleGroup);
    return header;
}

function criarAcaoCategoria(category) {
    const wrapper = criarElemento('div', { className: 'catalog-category-action' });
    const link = criarElemento('a', {
        className: 'btn-secondary catalog-category-link',
        text: traduzir('Acessar categoria de {category}', { category: traduzir(category) }),
        attrs: { href: `categoria.html?categoria=${encodeURIComponent(category)}` }
    });
    wrapper.appendChild(link);
    return wrapper;
}

function criarBlocoCategoria(category, items) {
    const section = criarElemento('section', { className: 'catalog-category-block' });
    const grid = criarElemento('div', { className: 'auctions-grid' });
    items.forEach((auction) => grid.appendChild(criarCardLeilao(auction, { showFavorite: true })));
    adicionarElementosFilhos(section, [
        criarCabecalhoCategoria(category, items.length),
        grid,
        criarAcaoCategoria(category)
    ]);
    return section;
}

function renderizarCatalogo() {
    const filters = obterFiltros();
    const filtered = ordenarLeiloes(filtrarLeiloes(auctions, filters), filters.sort);
    limparElemento(content);
    status.textContent = '';

    if (!filtered.length) {
        renderizarEstado(content, 'empty', traduzir('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
        return;
    }

    agruparPorCategoria(filtered).forEach((items, category) => {
        content.appendChild(criarBlocoCategoria(category, items));
    });
}

async function alternarFavorito(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;

    button.disabled = true;
    try {
        await definirFavorito(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderizarCatalogo();
        status.textContent = traduzir(auction.isFavorite
            ? 'Leilão adicionado aos favoritos.'
            : 'Leilão removido dos favoritos.');
    } catch (error) {
        status.textContent = obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.')
        );
    } finally {
        button.disabled = false;
    }
}

async function carregarOpcoesFiltros() {
    const [categorias, estados, raridades] = await Promise.all([
        obterCategorias(),
        obterEstadosFisicos(),
        obterRaridades()
    ]);

    preencherSelectComOpcoes(categorySelect, categorias, {
        placeholder: traduzir('Todas as categorias')
    });
    preencherSelectComOpcoes(conditionSelect, estados, {
        placeholder: traduzir('Todos os estados')
    });
    preencherSelectComOpcoes(raritySelect, raridades, {
        placeholder: traduzir('Todas as raridades')
    });
}

async function carregarCatalogo() {
    renderizarEstado(content, 'loading', traduzir('Carregando catálogo...'));
    try {
        auctions = normalizarColecao(await obterLeiloes());
        renderizarCatalogo();
    } catch (error) {
        renderizarEstado(content, 'error', obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos carregar o catálogo agora. Tente novamente em instantes.')
        ));
        status.textContent = '';
    }
}

form.addEventListener('input', adiarExecucao(renderizarCatalogo));
form.addEventListener('change', (event) => {
    if (event.target === categorySelect) sincronizarCampoMarca(categorySelect.value, brandField, brandInput);
    renderizarCatalogo();
});
form.addEventListener('reset', () => window.setTimeout(() => {
    sincronizarCampoMarca(categorySelect.value, brandField, brandInput);
    renderizarCatalogo();
}));
content.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) alternarFavorito(favoriteButton);
});

async function inicializarCatalogo() {
    try {
        await carregarOpcoesFiltros();
    } catch (error) {
        status.textContent = obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos carregar as opções dos filtros agora.')
        );
    }
    sincronizarCampoMarca(categorySelect.value, brandField, brandInput);
    await carregarCatalogo();
}

inicializarCatalogo();
