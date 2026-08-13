package com.example.midas_api.dto.pedido;

public record PedidoItemResponse(
        Integer id,
        Integer produtoLojaId,
        Integer leilaoId,
        Integer quantidade,
        Double precoUnitario,
        Double subtotal
) {}
