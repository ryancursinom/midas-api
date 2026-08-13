package com.example.midas_api.repository;

import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.enums.StatusLeilao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeilaoRepository extends JpaRepository<Leilao, Integer> {

    /** Listagem paginada por status — ideal para "GET /leiloes" (ex: só ABERTO). */
    Page<Leilao> findByStatus(StatusLeilao status, Pageable pageable);

    List<Leilao> findByStatus(StatusLeilao status);

    /** Produto tem @OneToOne único com Leilao, então no máximo um resultado. */
    Optional<Leilao> findByProduto_Id(Integer produtoId);

    /** Usado para barrar cadastro de leilão duplicado pro mesmo produto. */
    boolean existsByProduto_Id(Integer produtoId);

    /** Leilões relacionados ao usuário dono do produto — GET /usuarios/{id}/leiloes. */
    List<Leilao> findByProduto_Usuario_Id(Integer usuarioId);
}