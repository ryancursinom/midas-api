package com.example.midas_api.dto.leilao;

import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.TipoCompra;

public record LeilaoResumoResponse(
        Integer id,
        StatusLeilao status,
        TipoCompra tipoCompra,
        Double valorCompraImediata
) {}
