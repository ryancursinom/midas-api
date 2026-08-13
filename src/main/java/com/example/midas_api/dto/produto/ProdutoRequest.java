package com.example.midas_api.dto.produto;

import jakarta.validation.constraints.*;

public record ProdutoRequest(
        @NotBlank @Size(max = 255) String nome,
        @Positive Integer anoFabricacao,
        @Positive Integer anoLancamento,
        @NotBlank @Size(max = 1000) String resumoDescricao,
        @Size(max = 100) String marca,
        @Positive Double peso,
        @NotNull @Positive Double lanceMinimo,
        @NotNull Integer categoriaId,
        @NotNull Integer estadoFisicoId,
        @NotNull Integer raridadeId
) {}
