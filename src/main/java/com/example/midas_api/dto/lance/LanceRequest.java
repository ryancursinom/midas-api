package com.example.midas_api.dto.lance;

import jakarta.validation.constraints.Positive;

public record LanceRequest(
        @Positive(message = "O valor do lance deve ser maior que zero.")
        double valor,
        Integer leilaoId,
        Integer usuarioId
) {}
