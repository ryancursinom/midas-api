package com.example.midas_api.dto.identidadeVisual;

import jakarta.validation.constraints.NotBlank;

public record IdentidadeVisualRequest(
        @NotBlank
        String corPrimaria,

        String corSecundaria,

        String descricaoPaleta,

        @NotBlank
        String formato,

        String descricaoFormato
) {}