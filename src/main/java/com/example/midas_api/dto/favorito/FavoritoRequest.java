package com.example.midas_api.dto.favorito;

import jakarta.validation.constraints.NotNull;

public record FavoritoRequest(
        @NotNull
        Integer leilaoId
) {}