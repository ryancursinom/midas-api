package com.example.midas_api.mapper;

import com.example.midas_api.dto.produtoLoja.ProdutoLojaRequest;
import com.example.midas_api.dto.produtoLoja.ProdutoLojaResponse;
import com.example.midas_api.entity.ProdutoLoja;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProdutoLojaMapper {
    ProdutoLoja toEntity(ProdutoLojaRequest dto);
    ProdutoLojaResponse toResponse(ProdutoLoja entity);
}
