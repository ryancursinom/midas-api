package com.example.midas_api.repository;

import com.example.midas_api.entity.Telefone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TelefoneRepository extends JpaRepository<Telefone, Integer> {
    List<Telefone> findByUsuario_Id(Integer usuarioId);
    boolean existsByTelefone(String telefone);
}
