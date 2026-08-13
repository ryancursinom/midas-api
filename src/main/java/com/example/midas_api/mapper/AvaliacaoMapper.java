package com.example.midas_api.mapper;

import com.example.midas_api.dto.avaliacao.AvaliacaoResponse;
import com.example.midas_api.entity.Avaliacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AvaliacaoMapper {
    @Mapping(source = "usuario.id", target = "usuarioId")
    AvaliacaoResponse toResponse(Avaliacao avaliacao);
}
