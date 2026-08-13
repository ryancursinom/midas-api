package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.MeioPagamento;
import com.example.midas_api.entity.enums.StatusPagamento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// JPA
@Entity
@Table(name = "pagamento")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Pagamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pagador", nullable = false)
    private Usuario pagador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recebedor")
    private Usuario recebedor;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "meio_pagamento", nullable = false, columnDefinition = "tipo_pagamento")
    private MeioPagamento meioPagamento;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "pagamento_status")
    private StatusPagamento status;

    @Column(name = "id_transacao")
    private String idTransacao;

    @Column(name = "txid_pix")
    private String txidPix;

    private LocalDateTime dataPagamento;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

}