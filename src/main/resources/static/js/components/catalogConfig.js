export const AUCTION_CATEGORIES = [
    'Jogos Eletrônicos',
    'Cards Colecionáveis',
    'Itens Esportivos',
    'Action Figures',
    'Automóveis',
    'Imóveis',
    'Aparelhos Eletrônicos'
];

export const BRAND_CATEGORIES = new Set(['Automóveis', 'Aparelhos Eletrônicos']);

export function verificarCategoriaAceitaMarca(category) {
    return BRAND_CATEGORIES.has(category);
}


export function sincronizarCampoMarca(category, field, input) {
    const visible = verificarCategoriaAceitaMarca(category);
    field.hidden = !visible;
    if (!visible && input) input.value = '';
    return visible;
}
