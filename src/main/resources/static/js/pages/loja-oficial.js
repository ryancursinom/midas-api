import { criarElemento, formatarMoeda } from '../components/dom.js';
import { criarIcone } from '../components/icons.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { adicionarAoCarrinho } from '../services/cartService.js';
import { traduzir } from '../services/i18n.js';
import { obterProdutosLojaOficial } from '../services/officialStoreService.js';

const grid = document.getElementById('official-products');
const status = document.getElementById('store-status');

function criarCardProduto(product) {
    const article = criarElemento('article', { className: 'official-product-card' });
    const media = criarElemento('div', { className: 'official-product-card__media', attrs: { 'aria-hidden': 'true' } });
    media.appendChild(criarIcone(product.icon, { size: 52 }));
    const title = criarElemento('h2', { text: traduzir(product.title) });
    const description = criarElemento('p', { className: 'official-product-card__description', text: traduzir(product.description) });
    const price = criarElemento('strong', { className: 'official-product-card__price', text: formatarMoeda(product.price) });
    const button = criarElemento('button', {
        className: 'btn-primary', text: traduzir('Adicionar ao carrinho'), attrs: { type: 'button' },
        dataset: { productId: product.id }
    });
    article.append(media, title, description, price, button);
    return article;
}

function adicionarProdutoAoCarrinho(productId) {
    const product = obterProdutosLojaOficial().find((item) => item.id === productId);
    if (!product) return;
    adicionarAoCarrinho({
        id: product.id, type: 'STORE_PRODUCT', title: product.title, price: product.price,
        icon: product.icon, category: 'Loja Oficial Midas'
    });
    definirMensagemAoVivo(status, traduzir('{title} foi adicionado ao carrinho.', { title: traduzir(product.title) }));
}

obterProdutosLojaOficial().forEach((product) => grid.appendChild(criarCardProduto(product)));
grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (button) adicionarProdutoAoCarrinho(button.dataset.productId);
});
