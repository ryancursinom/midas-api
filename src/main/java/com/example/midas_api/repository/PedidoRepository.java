package com.example.midas_api.repository;

import com.example.midas_api.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByUsuario_IdOrderByCriadoEmDesc(Integer usuarioId);
}
