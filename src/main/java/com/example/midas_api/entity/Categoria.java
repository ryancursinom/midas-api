package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

// JPA
@Entity
@Table(name = "categoria")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Categoria{
    // Atributos
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column (nullable = false, unique = true, length = 100)
    private String nome;
}