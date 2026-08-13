package com.example.midas_api.dto.pagamento;

import com.example.midas_api.entity.enums.StatusPagamento;
import jakarta.validation.constraints.NotNull;

public record PagamentoWebhookRequest(
        @NotNull Integer pagamentoId,
        @NotNull StatusPagamento status,
        String idTransacao,
        String txidPix
) {}
