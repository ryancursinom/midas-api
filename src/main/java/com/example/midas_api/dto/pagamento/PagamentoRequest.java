package com.example.midas_api.dto.pagamento;

import com.example.midas_api.entity.enums.MeioPagamento;
import jakarta.validation.constraints.NotNull;

public record PagamentoRequest(
        @NotNull MeioPagamento meioPagamento,
        @NotNull Integer leilaoId
) {}
