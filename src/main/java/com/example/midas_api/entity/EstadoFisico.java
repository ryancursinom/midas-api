package com.example.midas_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

// JPA
@Entity
@Table(name = "estado_fisico")

//Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EstadoFisico {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String nome;

    @Column(columnDefinition = "TEXT")
    @Size(max = 500)
    private String descricao;
}
