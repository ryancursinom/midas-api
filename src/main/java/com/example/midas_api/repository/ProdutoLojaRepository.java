package com.example.midas_api.repository;

import com.example.midas_api.entity.ProdutoLoja;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoLojaRepository extends JpaRepository<ProdutoLoja, Integer> {
    boolean existsByNome(String nome);
}
