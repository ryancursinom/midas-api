package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.TipoCompra;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// JPA
@Entity
@Table(name = "leilao")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Leilao {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "data_inicio",nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim",nullable = false)
    private LocalDateTime dataFim;

    @Column(nullable = false, columnDefinition = "leilao_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    private StatusLeilao status;

    @Column(name = "tipo_compra", nullable = false, columnDefinition = "tipo_compra")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    private TipoCompra tipoCompra;

    @Column(name = "valor_compra_imediata")
    private BigDecimal valorCompraImediata;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto", nullable = false, unique = true)
    private Produto produto;

    // Atributos mapeados
    @OneToMany(mappedBy = "leilao")
    private List<Lance> lances;
}