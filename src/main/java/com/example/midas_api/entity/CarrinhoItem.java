package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

// JPA
@Entity
@Table(name = "carrinho_item")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CarrinhoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carrinho", nullable = false)
    private Carrinho carrinho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto_loja", nullable = false)
    private ProdutoLoja produtoLoja;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidade = 1;

}