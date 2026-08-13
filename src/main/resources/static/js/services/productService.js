import { enviarRequisicaoApi } from './api.js';

export function obterCategorias() {
    return enviarRequisicaoApi('/v1/categorias');
}

export function obterEstadosFisicos() {
    return enviarRequisicaoApi('/v1/estado');
}

export function obterRaridades() {
    return enviarRequisicaoApi('/v1/raridades');
}

export function obterIdentidadesVisuais() {
    return enviarRequisicaoApi('/v1/identidades-visuais');
}

export function criarProduto(data) {
    return enviarRequisicaoApi('/v1/produtos', {
        method: 'POST', body: JSON.stringify(data)
    });
}

export function atualizarProduto(id, data) {
    return enviarRequisicaoApi(`/v1/produtos/${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify(data)
    });
}

export function removerProduto(id) {
    return enviarRequisicaoApi(`/v1/produtos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function enviarImagemProduto(id, file) {
    const body = new FormData();
    body.append('file', file);
    return enviarRequisicaoApi(`/v1/produtos/${encodeURIComponent(id)}/imagens`, {
        method: 'POST', body
    });
}
