package com.example.midas_api.repository;

import com.example.midas_api.entity.CarrinhoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarrinhoItemRepository extends JpaRepository<CarrinhoItem, Integer> {
    Optional<CarrinhoItem> findByCarrinho_IdAndProdutoLoja_Id(Integer carrinhoId, Integer produtoLojaId);
    Optional<CarrinhoItem> findByIdAndCarrinho_Id(Integer id, Integer carrinhoId);
    List<CarrinhoItem> findByCarrinho_Id(Integer carrinhoId);
}
