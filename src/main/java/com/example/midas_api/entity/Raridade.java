package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

// JPA
@Entity
@Table(name = "raridade")

//Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Raridade {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String nome;
}