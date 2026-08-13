package com.example.midas_api.dto.identidadeVisual;

import jakarta.validation.constraints.Size;

public record AtualizarIdentidadeVisualRequest(
        @Size(max = 7) String corPrimaria,
        @Size(max = 7) String corSecundaria,
        String descricaoPaleta,
        @Size(max = 50) String formato,
        String descricaoFormato
) {}
