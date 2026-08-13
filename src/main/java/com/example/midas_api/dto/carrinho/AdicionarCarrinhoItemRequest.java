package com.example.midas_api.dto.carrinho;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AdicionarCarrinhoItemRequest(
        @NotNull Integer produtoLojaId,
        @NotNull @Positive Integer quantidade
) {}
