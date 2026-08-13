package com.example.midas_api.repository;

import com.example.midas_api.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    long count();

}
