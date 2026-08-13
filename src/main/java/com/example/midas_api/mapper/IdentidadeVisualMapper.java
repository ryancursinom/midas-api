package com.example.midas_api.mapper;

import com.example.midas_api.dto.identidadeVisual.AtualizarIdentidadeVisualRequest;
import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualRequest;
import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualResponse;
import com.example.midas_api.entity.IdentidadeVisual;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IdentidadeVisualMapper {

    IdentidadeVisual toEntity (IdentidadeVisualRequest dto);

    IdentidadeVisualResponse toResponse (IdentidadeVisual identidadeVisual);

    void toUpdate (AtualizarIdentidadeVisualRequest dto,
                   @MappingTarget IdentidadeVisual identidadeVisual
    );
}