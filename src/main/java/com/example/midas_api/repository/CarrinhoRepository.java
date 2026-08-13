package com.example.midas_api.repository;

import com.example.midas_api.entity.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Integer> {
    Optional<Carrinho> findByUsuario_Id(Integer usuarioId);
}
