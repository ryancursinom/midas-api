package com.example.midas_api.mapper;

import com.example.midas_api.dto.lance.LanceRequest;
import com.example.midas_api.dto.lance.LanceResponse;
import com.example.midas_api.entity.Lance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = {LeilaoMapper.class, UsuarioMapper.class}
)
public interface LanceMapper {

    @Mapping(source = "usuarioId", target = "usuario.id")
    @Mapping(source = "leilaoId", target = "leilao.id")
    Lance toEntity (LanceRequest dto);

    LanceResponse toResponse (Lance lance);
}