package com.example.midas_api.mapper;

import com.example.midas_api.dto.favorito.FavoritoResponse;
import com.example.midas_api.entity.Favorito;
import org.mapstruct.Mapper;

/**
 * Só mapeia saída (Response). A criação de um Favorito envolve montar a
 * FavoritoId (composta) e ligar Usuario + Leilao já gerenciados, o que faz
 * mais sentido feito diretamente no FavoritoService do que via MapStruct.
 */
@Mapper(componentModel = "spring", uses = LeilaoMapper.class)
public interface FavoritoMapper {

    FavoritoResponse toResponse(Favorito favorito);
}