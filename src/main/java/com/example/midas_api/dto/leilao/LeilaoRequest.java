package com.example.midas_api.dto.leilao;

import com.example.midas_api.entity.enums.TipoCompra;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

public record LeilaoRequest(
        @NotNull LocalDateTime dataInicio,
        @Future @NotNull LocalDateTime dataFim,
        @NotNull Integer produtoId,
        TipoCompra tipoCompra,
        @PositiveOrZero Double valorCompraImediata
) {}
