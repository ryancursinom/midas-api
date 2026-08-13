package com.example.midas_api.dto.identidadeVisual;

public record IdentidadeVisualResponse(
        Integer id,

        String corPrimaria,

        String corSecundaria,

        String descricaoPaleta,

        String formato,

        String descricaoFormato
) {
}
