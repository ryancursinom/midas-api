package com.example.midas_api.mapper;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.dto.produto.ProdutoResumoResponse;
import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.ProdutoImagem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = {CategoriaMapper.class, RaridadeMapper.class, EstadoFisicoMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProdutoMapper {

    @Mapping(source = "categoriaId", target = "categoria.id")
    @Mapping(source = "estadoFisicoId", target = "estadoFisico.id")
    @Mapping(source = "raridadeId", target = "raridade.id")
    @Mapping(target = "imagens", ignore = true)
    Produto toEntity(ProdutoRequest dto);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(target = "imagens", expression = "java(obterUrlsImagens(produto))")
    ProdutoResponse toResponse(Produto produto);

    ProdutoResumoResponse toResponseResumo(Produto produto);

    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "estadoFisico", ignore = true)
    @Mapping(target = "raridade", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    void toUpdate(AtualizarProdutoRequest dto, @MappingTarget Produto produto);

    default List<String> obterUrlsImagens(Produto produto) {
        if (produto == null || produto.getImagens() == null) return List.of();

        return produto.getImagens().stream()
                .map(ProdutoImagem::getUrl)
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
    }
}
