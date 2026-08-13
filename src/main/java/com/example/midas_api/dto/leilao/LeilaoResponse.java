package com.example.midas_api.dto.leilao;

import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.TipoCompra;

import java.time.LocalDateTime;

public record LeilaoResponse(
        Integer id,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        StatusLeilao status,
        TipoCompra tipoCompra,
        Double valorCompraImediata,
        LocalDateTime criadoEm,
        Double lanceAtual,
        Integer quantidadeLances,
        ProdutoResponse produto
) {}
