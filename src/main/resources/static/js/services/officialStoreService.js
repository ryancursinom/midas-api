export const OFFICIAL_STORE_PRODUCTS = [
    { id: 'midas-shirt', title: 'Camiseta Oficial Midas', description: 'Camiseta preta com identidade dourada do Midas.', price: 79.90, icon: 'shirt' },
    { id: 'midas-mug', title: 'Caneca de Colecionador Midas', description: 'Caneca temática para colecionadores da plataforma.', price: 49.90, icon: 'mug' },
    { id: 'midas-poster', title: 'Pôster Edição Dourada', description: 'Pôster decorativo com a identidade visual do Midas.', price: 39.90, icon: 'poster' },
    { id: 'midas-welcome-kit', title: 'Kit de Boas-vindas Midas', description: 'Kit exclusivo com itens oficiais da marca Midas.', price: 119.90, icon: 'package' }
];

export function obterProdutosLojaOficial() {
    return OFFICIAL_STORE_PRODUCTS.map((product) => ({ ...product }));
}
