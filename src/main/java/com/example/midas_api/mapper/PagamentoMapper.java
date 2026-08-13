package com.example.midas_api.mapper;

import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.entity.Pagamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PagamentoMapper {

    @Mapping(source = "pagador.id", target = "pagadorId")
    @Mapping(source = "recebedor.id", target = "recebedorId")
    @Mapping(source = "pedido.id", target = "pedidoId")
    PagamentoResponse toResponse(Pagamento pagamento);
}
