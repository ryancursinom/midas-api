package com.example.midas_api.dto.produtoLoja;

public record ProdutoLojaResponse(
        Integer id,
        String nome,
        Double preco,
        String descricao
) {}
