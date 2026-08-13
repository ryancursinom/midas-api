const CART_KEY = 'midas-cart';

function lerCarrinho() {
    try {
        return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function salvarCarrinho(items) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('midas:cart-updated', { detail: items }));
}

export function obterCarrinho() {
    return lerCarrinho();
}

export function adicionarAoCarrinho(product) {
    const items = lerCarrinho();
    const existing = items.find((item) => String(item.id) === String(product.id));

    if (existing) existing.quantity += 1;
    else items.push({ ...product, quantity: 1 });

    salvarCarrinho(items);
    return items;
}

export function atualizarQuantidadeCarrinho(id, quantity) {
    const nextQuantity = Math.min(20, Math.max(1, Number(quantity) || 1));
    const items = lerCarrinho().map((item) => (
        String(item.id) === String(id) ? { ...item, quantity: nextQuantity } : item
    ));
    salvarCarrinho(items);
    return items;
}

export function removerDoCarrinho(id) {
    const items = lerCarrinho().filter((item) => String(item.id) !== String(id));
    salvarCarrinho(items);
    return items;
}

export function limparCarrinho() {
    salvarCarrinho([]);
}

export function obterTotalCarrinho(items = lerCarrinho()) {
    return items.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);
}

export function obterQuantidadeItensCarrinho(items = lerCarrinho()) {
    return items.reduce((total, item) => total + item.quantity, 0);
}
