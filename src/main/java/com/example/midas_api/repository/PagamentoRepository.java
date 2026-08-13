package com.example.midas_api.repository;

import com.example.midas_api.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {
    boolean existsByPedido_Id(Integer pedidoId);
    Optional<Pagamento> findByPedido_Id(Integer pedidoId);
}
