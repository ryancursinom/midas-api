package com.example.midas_api.mapper;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.entity.Lance;
import com.example.midas_api.entity.Leilao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = ProdutoMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LeilaoMapper {

    @Mapping(source = "produtoId", target = "produto.id")
    Leilao toEntity(LeilaoRequest dto);

    @Mapping(target = "lanceAtual", expression = "java(obterLanceAtual(leilao))")
    @Mapping(target = "quantidadeLances", expression = "java(obterQuantidadeLances(leilao))")
    LeilaoResponse toResponse(Leilao leilao);

    LeilaoResumoResponse toResponseResumo(Leilao leilao);

    void toUpdate(AtualizarLeilaoRequest dto, @MappingTarget Leilao leilao);

    default Double obterLanceAtual(Leilao leilao) {
        if (leilao.getLances() != null && !leilao.getLances().isEmpty()) {
            return leilao.getLances().stream()
                    .map(Lance::getValor)
                    .max(java.math.BigDecimal::compareTo)
                    .map(java.math.BigDecimal::doubleValue)
                    .orElse(0.0);
        }
        return leilao.getProduto() != null && leilao.getProduto().getLanceMinimo() != null
                ? leilao.getProduto().getLanceMinimo().doubleValue()
                : 0.0;
    }

    default Integer obterQuantidadeLances(Leilao leilao) {
        return leilao.getLances() == null ? 0 : leilao.getLances().size();
    }
}
