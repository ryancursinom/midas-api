package com.example.midas_api.repository;

import com.example.midas_api.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {

    List<Favorito> findByUsuario_Id(Integer usuarioId);

    Optional<Favorito> findByUsuario_IdAndLeilao_Id(Integer usuarioId, Integer leilaoId);

    boolean existsByUsuario_IdAndLeilao_Id(Integer usuarioId, Integer leilaoId);
}
