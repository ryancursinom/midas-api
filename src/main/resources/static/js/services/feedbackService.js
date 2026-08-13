import { enviarRequisicaoApi, normalizarColecao } from './api.js';

export function enviarAvaliacao({ rating, comments }) {
    return enviarRequisicaoApi('/v1/avaliacoes', {
        method: 'POST',
        body: JSON.stringify({ nota: Number(rating), observacao: String(comments || '').trim() })
    });
}

export async function obterAvaliacoesEmDestaque() {
    const avaliacoes = normalizarColecao(await enviarRequisicaoApi('/v1/avaliacoes'));
    return avaliacoes.map((item) => ({
        id: item.id,
        rating: Number(item.nota || 0),
        comments: item.observacao || '',
        userName: 'Usuário Midas'
    }));
}
