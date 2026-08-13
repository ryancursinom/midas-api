package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

// JPA
@Entity
@Table(name = "identidade_visual")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class IdentidadeVisual {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 30)
    private String corPrimaria;

    @Column(length = 30)
    private String corSecundaria;

    @Column(name = "descricao_paleta")
    private String descricaoPaleta;

    @Column(nullable = false, length = 50)
    private String formato;

    @Column(name = "descricao_formato")
    private String descricaoFormato;
}