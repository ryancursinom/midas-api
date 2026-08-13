import { adicionarElementosFilhos, limparElemento, criarElemento, formatarMoeda } from '../components/dom.js';
import { criarIcone } from '../components/icons.js';
import { obterCarrinho, obterQuantidadeItensCarrinho, obterTotalCarrinho, removerDoCarrinho, atualizarQuantidadeCarrinho } from '../services/cartService.js';
import { traduzir } from '../services/i18n.js';

const list = document.getElementById('cart-list');
const count = document.getElementById('cart-item-count');
const total = document.getElementById('cart-total');
const checkoutLink = document.getElementById('cart-checkout-link');
const cartStatus = document.getElementById('cart-status');

function criarCampoQuantidade(item) {
    const wrapper = criarElemento('div', { className: 'cart-quantity' });
    const label = criarElemento('label', { text: traduzir('Quantidade'), attrs: { for: `quantity-${item.id}` } });
    const input = criarElemento('input', {
        attrs: {
            id: `quantity-${item.id}`, type: 'number', min: 1, max: 20, step: 1, value: item.quantity,
            inputmode: 'numeric', 'aria-label': traduzir('Quantidade de {title}', { title: traduzir(item.title) })
        },
        dataset: { action: 'quantity', itemId: item.id }
    });
    wrapper.append(label, input);
    return wrapper;
}

function criarMidiaProduto(item) {
    const media = criarElemento('div', {
        className: 'cart-item-media', attrs: { 'aria-label': traduzir('Produto da Loja Oficial Midas: {title}', { title: traduzir(item.title) }), role: 'img' }
    });
    media.appendChild(criarIcone(item.icon || 'package', { size: 44 }));
    return media;
}

function criarItemCarrinho(item) {
    const article = criarElemento('article', { className: 'cart-item', dataset: { itemId: item.id } });
    const info = criarElemento('div', { className: 'cart-item-info' });
    info.append(
        criarElemento('h2', { text: traduzir(item.title) }),
        criarElemento('p', { text: traduzir(item.category || 'Loja Oficial Midas') }),
        criarElemento('strong', { text: formatarMoeda(item.price) })
    );
    const controls = criarElemento('div', { className: 'cart-item-controls' });
    const remove = criarElemento('button', {
        className: 'btn-danger', attrs: { type: 'button', 'aria-label': traduzir('Remover {title} do carrinho', { title: traduzir(item.title) }) },
        dataset: { action: 'remove', itemId: item.id }
    });
    remove.append(criarIcone('trash'), document.createTextNode(traduzir('Remover')));
    adicionarElementosFilhos(controls, [criarCampoQuantidade(item), remove]);
    article.append(criarMidiaProduto(item), info, controls);
    return article;
}

function atualizarResumoCarrinho(items = obterCarrinho()) {
    count.textContent = String(obterQuantidadeItensCarrinho(items));
    total.textContent = formatarMoeda(obterTotalCarrinho(items));
    checkoutLink.setAttribute('aria-disabled', String(items.length === 0));
    checkoutLink.tabIndex = items.length ? 0 : -1;
}

function renderizarCarrinhoVazio() {
    const message = criarElemento('div', { className: 'empty-state cart-empty-state' });
    message.append(
        criarElemento('p', { text: traduzir('Seu carrinho está vazio.') }),
        criarElemento('a', { className: 'btn-primary', text: traduzir('Ir à Loja Oficial Midas'), attrs: { href: 'loja-oficial.html' } })
    );
    list.appendChild(message);
}

function renderizarCarrinho() {
    const items = obterCarrinho();
    limparElemento(list);
    atualizarResumoCarrinho(items);
    if (!items.length) {
        renderizarCarrinhoVazio();
        return;
    }
    items.forEach((item) => list.appendChild(criarItemCarrinho(item)));
}

function anunciarAtualizacaoCarrinho(message) {
    cartStatus.textContent = '';
    window.requestAnimationFrame(() => {
        cartStatus.textContent = message;
    });
}

list.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-action="remove"]');
    if (!removeButton) return;
    const article = removeButton.closest('.cart-item');
    const nextArticle = article.nextElementSibling || article.previousElementSibling;
    const items = removerDoCarrinho(removeButton.dataset.itemId);
    article.remove();
    atualizarResumoCarrinho(items);

    if (!items.length) {
        renderizarCarrinhoVazio();
        list.querySelector('a')?.focus();
    } else {
        nextArticle?.querySelector('[data-action="remove"]')?.focus();
    }
    anunciarAtualizacaoCarrinho(traduzir('Produto removido. Total do carrinho: {total}.', { total: formatarMoeda(obterTotalCarrinho(items)) }));
});

list.addEventListener('change', (event) => {
    const quantityInput = event.target.closest('[data-action="quantity"]');
    if (!quantityInput) return;
    const items = atualizarQuantidadeCarrinho(quantityInput.dataset.itemId, quantityInput.value);
    const updatedItem = items.find((item) => String(item.id) === String(quantityInput.dataset.itemId));
    quantityInput.value = String(updatedItem?.quantity || 1);
    atualizarResumoCarrinho(items);
    anunciarAtualizacaoCarrinho(traduzir('Quantidade atualizada. Total do carrinho: {total}.', { total: formatarMoeda(obterTotalCarrinho(items)) }));
});

checkoutLink.addEventListener('click', (event) => {
    if (!obterCarrinho().length) event.preventDefault();
});

renderizarCarrinho();
