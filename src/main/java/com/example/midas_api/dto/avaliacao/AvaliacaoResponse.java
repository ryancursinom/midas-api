package com.example.midas_api.dto.avaliacao;

public record AvaliacaoResponse(
        Integer id,
        Integer usuarioId,
        Integer nota,
        String observacao
) {}
