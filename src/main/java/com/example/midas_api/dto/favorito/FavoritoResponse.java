package com.example.midas_api.dto.favorito;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;

import java.time.LocalDateTime;

public record FavoritoResponse(
        LeilaoResumoResponse leilao,
        LocalDateTime dataAdicao
) {}