package com.example.midas_api.dto.carrinho;

import com.example.midas_api.dto.produtoLoja.ProdutoLojaResponse;

public record CarrinhoItemResponse(
        Integer id,
        ProdutoLojaResponse produto,
        Integer quantidade,
        Double subtotal
) {}
