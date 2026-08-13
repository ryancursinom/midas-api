package com.example.midas_api.dto.lance;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.UsuarioResumoResponse;

import java.time.LocalDateTime;

public record LanceResponse(
        Integer id,

        double valor,

        LocalDateTime data,

        LeilaoResumoResponse leilao,

        UsuarioResumoResponse usuario
)
{}