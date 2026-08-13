package com.example.midas_api.repository;

import com.example.midas_api.entity.EstadoFisico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoFisicoRepository extends JpaRepository<EstadoFisico, Integer> {

    boolean existsByNome(String nome);
}