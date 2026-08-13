function normalizarTexto(value) {
    return String(value || '').trim().toLocaleLowerCase('pt-BR');
}

function obterPrecoComparavel(auction) {
    return Number(auction.currentBid ?? auction.startingBid ?? 0);
}

function correspondeAoTexto(auction, term) {
    if (!term) return true;
    return [auction.id, auction.title, auction.category, auction.brand, auction.description, auction.condition]
        .some((value) => normalizarTexto(value).includes(normalizarTexto(term)));
}

function correspondeAoPrazoEncerramento(auction, endingHours) {
    if (!endingHours || endingHours === 'all' || !auction.endsAt) return true;
    const remainingMs = new Date(auction.endsAt).getTime() - Date.now();
    return remainingMs >= 0 && remainingMs <= Number(endingHours) * 60 * 60 * 1000;
}

export function filtrarLeiloes(auctions, filters = {}) {
    return auctions.filter((auction) => {
        const price = obterPrecoComparavel(auction);
        if (!correspondeAoTexto(auction, filters.search)) return false;
        if (filters.minPrice && price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
        if (filters.brand && !normalizarTexto(auction.brand).includes(normalizarTexto(filters.brand))) return false;
        if (filters.category && filters.category !== 'all' && normalizarTexto(auction.category) !== normalizarTexto(filters.category)) return false;
        if (filters.condition && filters.condition !== 'all' && normalizarTexto(auction.condition) !== normalizarTexto(filters.condition)) return false;
        if (filters.rarity && filters.rarity !== 'all' && normalizarTexto(auction.rarity) !== normalizarTexto(filters.rarity)) return false;
        if (filters.status && filters.status !== 'all' && auction.status !== filters.status) return false;
        return correspondeAoPrazoEncerramento(auction, filters.ending);
    });
}

export function ordenarLeiloes(auctions, sort = 'relevance') {
    const items = [...auctions];
    const comparators = {
        relevance: () => 0,
        'price-asc': (a, b) => obterPrecoComparavel(a) - obterPrecoComparavel(b),
        'price-desc': (a, b) => obterPrecoComparavel(b) - obterPrecoComparavel(a),
        ending: (a, b) => new Date(a.endsAt || 8640000000000000) - new Date(b.endsAt || 8640000000000000)
    };
    return items.sort(comparators[sort] || comparators.relevance);
}

export function adiarExecucao(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
}
