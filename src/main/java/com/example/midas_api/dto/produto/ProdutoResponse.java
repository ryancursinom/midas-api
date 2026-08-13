package com.example.midas_api.dto.produto;

import com.example.midas_api.dto.categoria.CategoriaResponse;
import com.example.midas_api.dto.estadoFisico.EstadoFisicoResponse;
import com.example.midas_api.dto.raridade.RaridadeResponse;
import com.example.midas_api.entity.enums.StatusProduto;

import java.time.LocalDateTime;
import java.util.List;

public record ProdutoResponse(
        Integer id,
        String nome,
        Integer anoFabricacao,
        Integer anoLancamento,
        String resumoDescricao,
        String marca,
        Double peso,
        Double lanceMinimo,
        StatusProduto status,
        LocalDateTime criadoEm,
        Integer usuarioId,
        CategoriaResponse categoria,
        EstadoFisicoResponse estadoFisico,
        RaridadeResponse raridade,
        List<String> imagens
) {}
