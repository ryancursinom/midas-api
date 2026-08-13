package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "produto_imagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProdutoImagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @Column(length = 1024)
    private String url;

    @Column(name = "ordem")
    private Integer ordem;
}
