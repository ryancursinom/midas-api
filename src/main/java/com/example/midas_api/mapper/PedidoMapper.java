package com.example.midas_api.mapper;

import com.example.midas_api.dto.pedido.PedidoItemResponse;
import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.entity.Pedido;
import com.example.midas_api.entity.PedidoItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PedidoMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(target = "itens", ignore = true)
    PedidoResponse toResponse(Pedido pedido);

    @Mapping(source = "produtoLoja.id", target = "produtoLojaId")
    @Mapping(source = "leilao.id", target = "leilaoId")
    PedidoItemResponse toItemResponse(PedidoItem item);
}
