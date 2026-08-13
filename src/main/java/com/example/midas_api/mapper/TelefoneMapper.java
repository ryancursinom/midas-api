package com.example.midas_api.mapper;

import com.example.midas_api.dto.telefone.AtualizarTelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneResponse;
import com.example.midas_api.entity.Telefone;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TelefoneMapper {

    Telefone toEntity(TelefoneRequest dto);

    TelefoneResponse toResponse(Telefone telefone);

    void toUpdate(AtualizarTelefoneRequest dto, @MappingTarget Telefone telefone);
}
