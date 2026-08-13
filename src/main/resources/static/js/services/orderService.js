import { enviarRequisicaoApi } from './api.js';

export function iniciarPagamentoLeilao(auctionId, meioPagamento = 'CARTAO_CREDITO') {
    return enviarRequisicaoApi('/v1/pagamentos', {
        method: 'POST',
        body: JSON.stringify({
            leilaoId: Number(auctionId),
            meioPagamento
        })
    });
}

export function finalizarCompraLeilaoVencido(auctionId, meioPagamento = 'CARTAO_CREDITO') {
    return iniciarPagamentoLeilao(auctionId, meioPagamento);
}

export function confirmarPagamentoTeste(paymentId) {
    return enviarRequisicaoApi(`/v1/pagamentos/${paymentId}/simular-aprovacao`, {
        method: 'POST'
    });
}
