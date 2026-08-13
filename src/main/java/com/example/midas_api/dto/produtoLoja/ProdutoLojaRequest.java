package com.example.midas_api.dto.produtoLoja;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProdutoLojaRequest(
        @NotBlank String nome,
        @NotNull @PositiveOrZero Double preco,
        @NotBlank String descricao
) {}
