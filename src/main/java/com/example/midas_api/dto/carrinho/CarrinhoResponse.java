package com.example.midas_api.dto.carrinho;

import java.util.List;

public record CarrinhoResponse(
        Integer id,
        Integer usuarioId,
        Integer qtdItens,
        Double total,
        List<CarrinhoItemResponse> itens
) {}
