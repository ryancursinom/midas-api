package com.example.midas_api.dto.produto;

import com.example.midas_api.entity.enums.StatusProduto;

public record ProdutoResumoResponse(
        Integer id,

        String nome,

        Double lanceMinimo,

        StatusProduto status
) {}