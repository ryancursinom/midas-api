package com.example.midas_api.dto.avaliacao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AvaliacaoRequest(
        @NotNull @Min(1) @Max(5) Integer nota,
        String observacao
) {}
