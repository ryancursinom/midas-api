import { exigirAutenticacao } from '../components/privatePageGuard.js';
import { criarCardLeilao } from '../components/auctionCard.js';
import { adiarExecucao, filtrarLeiloes, ordenarLeiloes } from '../components/auctionFilters.js';
import { sincronizarCampoMarca } from '../components/catalogConfig.js';
import { limparElemento } from '../components/dom.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { renderizarEstado } from '../components/statusMessage.js';
import { obterLeiloesCriados, obterLeiloesFavoritos, obterLeiloesComMeusLances, definirFavorito } from '../services/auctionService.js';
import { normalizarColecao } from '../services/api.js';
import { traduzir } from '../services/i18n.js';
import { verificarLeilaoEncerrado } from '../components/auctionStatus.js';
import { obterCategorias, obterEstadosFisicos, obterRaridades } from '../services/productService.js';
import { preencherSelectComOpcoes } from '../components/selectOptions.js';


if (!exigirAutenticacao()) throw new Error('Redirecionando para o login.');
const form = document.getElementById('my-auctions-filter-form');
const grid = document.getElementById('my-auctions-grid');
const count = document.getElementById('my-auctions-count');
const title = document.getElementById('my-auctions-title');
const description = document.getElementById('my-auctions-description');
const createButton = document.getElementById('my-create-auction');
const categorySelect = document.getElementById('my-category');
const conditionSelect = document.getElementById('my-condition');
const raritySelect = document.getElementById('my-rarity');
const brandField = document.getElementById('my-brand-field');
const brandInput = document.getElementById('my-brand');
const requestedTab = new URLSearchParams(window.location.search).get('aba') || 'favoritos';
let auctions = [];

const tabConfig = {
    favoritos: {
        tabId: 'tab-favorites', title: 'Leilões Favoritados',
        description: 'Aqui você acompanha todos os itens que marcou como favoritos.', loader: obterLeiloesFavoritos
    },
    criados: {
        tabId: 'tab-created', title: 'Meus Leilões',
        description: 'Aqui você acompanha os leilões que publicou, abertos ou encerrados.', loader: obterLeiloesCriados
    },
    lances: {
        tabId: 'tab-bids', title: 'Leilões com Seus Lances',
        description: 'Aqui você acompanha os leilões em que já participou com algum lance.', loader: obterLeiloesComMeusLances
    }
};

const currentTab = tabConfig[requestedTab] ? requestedTab : 'favoritos';

function obterConfiguracaoAtiva() {
    return tabConfig[currentTab] || tabConfig.favoritos;
}

function marcarAbaAtiva() {
    const config = obterConfiguracaoAtiva();
    document.getElementById(config.tabId).setAttribute('aria-current', 'page');
    title.textContent = traduzir(config.title);
    description.textContent = traduzir(config.description);
    createButton.hidden = currentTab !== 'criados';
}

function obterFiltros() {
    const data = new FormData(form);
    return {
        minPrice: data.get('minPrice'), maxPrice: data.get('maxPrice'), ending: data.get('ending'),
        brand: data.get('brand'), category: data.get('category'),
        condition: data.get('condition'), rarity: data.get('rarity')
    };
}

function obterOpcoesCard(auction) {
    if (currentTab === 'favoritos') return { showFavorite: true };
    if (currentTab === 'criados') {
        return {
            showEdit: ['AGUARDANDO', 'ATIVO', 'ACTIVE', 'OPEN'].includes(String(auction.status).toUpperCase()) && Number(auction.bidCount || 0) === 0, actionLabel: traduzir('Ver Lances'),
            actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`
        };
    }
    if (verificarLeilaoEncerrado(auction.status) && auction.canCheckout) {
        return {
            actionLabel: traduzir('Finalizar compra'),
            actionHref: `checkout.html?auctionId=${encodeURIComponent(auction.id)}`
        };
    }
    return {
        actionLabel: traduzir(verificarLeilaoEncerrado(auction.status) ? 'Ver resultado' : 'Ver leilão'),
        actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`
    };
}

function renderizarResultados() {
    const filtered = ordenarLeiloes(filtrarLeiloes(auctions, obterFiltros()), 'ending');
    limparElemento(grid);
    count.textContent = traduzir('Itens nesta aba: {count}', { count: filtered.length });
    if (!filtered.length) {
        renderizarEstado(grid, 'empty', traduzir('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
        return;
    }
    filtered.forEach((auction) => grid.appendChild(criarCardLeilao(auction, obterOpcoesCard(auction))));
}

async function alternarFavorito(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await definirFavorito(auction.id, false);
        auctions = auctions.filter((item) => String(item.id) !== String(auction.id));
        renderizarResultados();
    } catch (error) {
        count.textContent = obterMensagemErroUsuario(error, traduzir('Não conseguimos remover este favorito agora. Tente novamente em instantes.'));
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

async function carregarLeiloes() {
    const config = obterConfiguracaoAtiva();
    marcarAbaAtiva();
    renderizarEstado(grid, 'loading', traduzir('Carregando seus leilões...'));
    try {
        auctions = normalizarColecao(await config.loader());
        renderizarResultados();
    } catch (error) {
        renderizarEstado(grid, 'error', obterMensagemErroUsuario(error, traduzir('Não conseguimos carregar seus leilões agora. Tente novamente em instantes.')));
        count.textContent = '';
    }
}

    form.addEventListener('input', adiarExecucao(renderizarResultados));
    form.addEventListener('change', (event) => {
        if (event.target === categorySelect) sincronizarCampoMarca(categorySelect.value, brandField, brandInput);
        renderizarResultados();
    });
    form.addEventListener('reset', () => window.setTimeout(() => {
        sincronizarCampoMarca(categorySelect.value, brandField, brandInput); renderizarResultados();
    }));
    grid.addEventListener('click', (event) => {
        const favoriteButton = event.target.closest('[data-action="favorite"]');
        if (favoriteButton) alternarFavorito(favoriteButton);
    });
    async function inicializarMeusLeiloes() {
        try {
            await carregarOpcoesFiltros();
        } catch (error) {
            count.textContent = obterMensagemErroUsuario(
                error,
                traduzir('Não conseguimos carregar as opções dos filtros agora.')
            );
        }
        sincronizarCampoMarca(categorySelect.value, brandField, brandInput);
        await carregarLeiloes();
    }

    inicializarMeusLeiloes();
