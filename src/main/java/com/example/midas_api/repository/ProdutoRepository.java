package com.example.midas_api.repository;

import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.enums.StatusProduto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    List<Produto> findByUsuario_Id(Integer usuarioId);

    List<Produto> findByStatus(StatusProduto status);

    /** Útil para checar posse antes de permitir alterar/excluir um produto. */
    boolean existsByIdAndUsuario_Id(Integer id, Integer usuarioId);
}