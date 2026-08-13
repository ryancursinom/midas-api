package com.example.midas_api.mapper;

import com.example.midas_api.dto.categoria.CategoriaResponse;
import com.example.midas_api.entity.Categoria;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    CategoriaResponse toResponse (Categoria categoria);
}