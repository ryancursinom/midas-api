package com.example.midas_api.dto.carrinho;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AtualizarCarrinhoItemRequest(
        @NotNull @Positive Integer quantidade
) {}
