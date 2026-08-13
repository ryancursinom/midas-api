package com.example.midas_api.repository;

import com.example.midas_api.entity.Raridade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RaridadeRepository extends JpaRepository<Raridade, Integer> {

    boolean existsByNome(String nome);
}