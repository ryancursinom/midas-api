package com.example.midas_api.dto.produto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record AtualizarProdutoRequest(
        @Size(max = 255) String nome,
        @Positive Integer anoFabricacao,
        @Positive Integer anoLancamento,
        @Size(max = 1000) String resumoDescricao,
        @Size(max = 100) String marca,
        @Positive Double peso,
        @PositiveOrZero Double lanceMinimo,
        Integer categoria,
        Integer estadoFisico,
        Integer raridade
) {}
