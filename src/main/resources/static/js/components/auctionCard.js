import { adicionarElementosFilhos, criarElemento, formatarMoeda } from './dom.js';
import { criarIcone } from './icons.js';
import { traduzir } from '../services/i18n.js';
import { aplicarFallbackImagem } from './image.js';
import { obterClasseStatusLeilao, obterRotuloStatusLeilao, verificarLeilaoAtivo, verificarLeilaoEncerrado } from './auctionStatus.js';

function formatarTempoRestante(auction) {
    if (verificarLeilaoEncerrado(auction.status)) return traduzir('Encerrado');
    if (auction.timeRemaining) return auction.timeRemaining;
    if (!auction.endsAt) return traduzir('Em andamento');
    const remainingMs = new Date(auction.endsAt).getTime() - Date.now();
    if (remainingMs <= 0) return traduzir('Encerrando');
    const totalHours = Math.ceil(remainingMs / 3600000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return days > 0 ? traduzir('{days}d {hours}h', { days, hours }) : traduzir('{hours}h', { hours });
}

function criarBotaoFavorito(auction) {
    const favorite = Boolean(auction.isFavorite);
    const button = criarElemento('button', {
        className: favorite ? 'card-wishlist card-wishlist--active' : 'card-wishlist',
        attrs: {
            type: 'button',
            'aria-label': traduzir(favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'),
            'aria-pressed': String(favorite),
            title: traduzir(favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos')
        },
        dataset: { action: 'favorite', auctionId: auction.id }
    });
    button.appendChild(criarIcone('heart', { filled: favorite }));
    return button;
}

function criarLinkEdicao(auction, rootPath) {
    const link = criarElemento('a', {
        className: 'card-edit',
        attrs: {
            href: `${rootPath}/html/criar-leilao.html?id=${encodeURIComponent(auction.id)}`,
            'aria-label': traduzir('Editar {title}', { title: auction.title })
        }
    });
    link.appendChild(criarIcone('pencil'));
    return link;
}

function criarMidia(auction, rootPath, options) {
    const media = criarElemento('div', { className: 'card-media' });
    const fallbackSrc = `${rootPath}/assets/img/item-default.svg`;
    const image = criarElemento('img', {
        className: 'card-image',
        attrs: {
            src: auction.imageUrl || fallbackSrc,
            alt: auction.imageAlt || traduzir('Imagem de {title}', { title: auction.title }),
            loading: 'lazy', decoding: 'async'
        }
    });
    aplicarFallbackImagem(image, fallbackSrc);
    const status = criarElemento('span', {
        className: `card-badge card-badge--${obterClasseStatusLeilao(auction.status)}`,
        text: traduzir(obterRotuloStatusLeilao(auction.status))
    });
    const timer = criarElemento('span', { className: 'card-timer', text: formatarTempoRestante(auction) });
    adicionarElementosFilhos(media, [image, status, timer]);
    if (options.showFavorite) media.appendChild(criarBotaoFavorito(auction));
    if (options.showEdit) media.appendChild(criarLinkEdicao(auction, rootPath));
    return media;
}

function criarAcaoCard(auction, rootPath, options) {
    const label = options.actionLabel || (verificarLeilaoEncerrado(auction.status) ? traduzir('Ver Detalhes') : traduzir('Ver leilão'));
    const href = options.actionHref || `${rootPath}/html/detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`;
    return criarElemento('a', { className: 'btn-bid', text: label, attrs: { href } });
}

function criarInformacoesPreco(auction) {
    const wrapper = criarElemento('div');
    const label = criarElemento('span', {
        className: 'bid-label', text: traduzir(verificarLeilaoEncerrado(auction.status) ? 'Lance Final' : 'Lance Atual')
    });
    const price = criarElemento('strong', {
        className: 'bid-value', text: formatarMoeda(auction.currentBid ?? auction.startingBid ?? 0)
    });
    wrapper.append(label, price);
    return wrapper;
}

function criarAvisoCompraImediata(auction) {
    if (!auction.buyNowPrice || !verificarLeilaoAtivo(auction.status)) return null;
    return criarElemento('p', {
        className: 'card-buy-now-hint',
        text: traduzir('Compra imediata disponível por {price}', { price: formatarMoeda(auction.buyNowPrice) })
    });
}

function criarConteudo(auction, rootPath, options) {
    const content = criarElemento('div', { className: 'card-content' });
    const category = criarElemento('span', { className: 'card-category', text: traduzir(auction.category || 'Sem categoria') });
    const title = criarElemento('h3', { className: 'card-title', text: auction.title || traduzir('Item sem nome') });
    const condition = criarElemento('p', { className: 'card-status', text: traduzir(auction.condition || 'Estado não informado') });
    const priceRow = criarElemento('div', { className: 'card-bid-info' });
    priceRow.append(criarInformacoesPreco(auction), criarAcaoCard(auction, rootPath, options));
    const footer = criarElemento('div', { className: 'card-footer' });
    footer.appendChild(criarElemento('span', { text: traduzir('Lances: {count}', { count: auction.bidCount || 0 }) }));
    adicionarElementosFilhos(content, [category, title, condition, criarAvisoCompraImediata(auction), priceRow, footer]);
    return content;
}

export function criarCardLeilao(auction, options = {}) {
    const rootPath = document.body.dataset.root || '..';
    const article = criarElemento('article', { className: 'auction-card', dataset: { auctionId: auction.id } });
    adicionarElementosFilhos(article, [criarMidia(auction, rootPath, options), criarConteudo(auction, rootPath, options)]);
    return article;
}
