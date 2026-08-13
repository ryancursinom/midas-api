package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

// JPA
@Entity
@Table(name = "produto_loja")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProdutoLoja {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50, unique = true)
    private String nome;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

}