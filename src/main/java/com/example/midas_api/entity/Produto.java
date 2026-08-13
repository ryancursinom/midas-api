package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.StatusProduto;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// JPA
@Entity
@Table(name = "produto")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Produto {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String nome;

    private Integer anoFabricacao;
    private Integer anoLancamento;

    @Column(columnDefinition = "TEXT")
    @Size(max = 1000)
    private String resumoDescricao;

    @Column(length = 100)
    private String marca;

    @Positive
    private BigDecimal peso;

    // Lance inicial mínimo aceito quando o produto for a leilão.
    @Column(nullable = false)
    @Positive
    private BigDecimal lanceMinimo;

    @Column(nullable = false, columnDefinition = "produto_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    private StatusProduto status;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_fisico", nullable = false)
    private EstadoFisico estadoFisico;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_raridade", nullable = false)
    private Raridade raridade;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<ProdutoImagem> imagens;
}