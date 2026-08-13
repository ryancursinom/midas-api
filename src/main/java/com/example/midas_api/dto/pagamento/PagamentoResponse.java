package com.example.midas_api.dto.pagamento;

import com.example.midas_api.entity.enums.MeioPagamento;
import com.example.midas_api.entity.enums.StatusPagamento;

import java.time.LocalDateTime;

public record PagamentoResponse(
        Integer id,
        MeioPagamento meioPagamento,
        Double valorTotal,
        StatusPagamento status,
        String idTransacao,
        String txidPix,
        LocalDateTime dataPagamento,
        LocalDateTime criadoEm,
        Integer pedidoId,
        Integer pagadorId,
        Integer recebedorId
) {}
