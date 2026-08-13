package com.example.midas_api.service;

import com.example.midas_api.dto.pagamento.PagamentoRequest;
import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.entity.*;
import com.example.midas_api.entity.enums.PedidoStatus;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.StatusPagamento;
import com.example.midas_api.entity.enums.TipoCompra;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.PagamentoMapper;
import com.example.midas_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final LeilaoRepository leilaoRepository;
    private final LanceRepository lanceRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final PagamentoMapper pagamentoMapper;

    /** Inicia o pagamento de um leilão finalizado ou uma Compra Imediata em leilão ativo. */
    public PagamentoResponse iniciar(PagamentoRequest dto, Integer usuarioId) {
        Leilao leilao = leilaoRepository.findById(dto.leilaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", dto.leilaoId()));

        if (pedidoItemRepository.existsByLeilao_Id(leilao.getId())) {
            throw new ResourceAlreadyExistsException("Pedido", "leilão", leilao.getId());
        }

        Usuario pagador = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));
        Usuario recebedor = leilao.getProduto().getUsuario();

        if (recebedor.getId().equals(pagador.getId())) {
            throw new BusinessException("Você não pode comprar o próprio produto.");
        }

        LocalDateTime agora = LocalDateTime.now();
        if (leilao.getStatus() == StatusLeilao.AGUARDANDO && !agora.isBefore(leilao.getDataInicio())) {
            leilao.setStatus(StatusLeilao.ATIVO);
        }
        if (leilao.getStatus() == StatusLeilao.ATIVO && !agora.isBefore(leilao.getDataFim())) {
            leilao.setStatus(StatusLeilao.FINALIZADO);
        }

        boolean permiteCompraImediata = (leilao.getTipoCompra() == TipoCompra.COMPRA_IMEDIATA
                || leilao.getTipoCompra() == TipoCompra.AMBOS)
                && leilao.getValorCompraImediata() != null
                && leilao.getStatus() == StatusLeilao.ATIVO
                && !agora.isBefore(leilao.getDataInicio())
                && agora.isBefore(leilao.getDataFim());

        BigDecimal valor;
        if (permiteCompraImediata) {
            valor = leilao.getValorCompraImediata();
            leilao.setStatus(StatusLeilao.FINALIZADO);
        } else {
            if (leilao.getStatus() != StatusLeilao.FINALIZADO) {
                throw new BusinessException("Este leilão ainda não está disponível para pagamento.");
            }

            Lance maiorLance = lanceRepository.findTopByLeilao_IdOrderByValorDesc(leilao.getId())
                    .orElseThrow(() -> new BusinessException("Este leilão não teve nenhum lance registrado."));

            if (!maiorLance.getUsuario().getId().equals(usuarioId)) {
                throw new BusinessException("Somente o usuário que arrematou o leilão pode efetuar o pagamento.");
            }
            valor = maiorLance.getValor();
        }

        Pedido pedido = Pedido.builder()
                .usuario(pagador)
                .status(PedidoStatus.AGUARDANDO_PAGAMENTO)
                .valorTotal(valor)
                .build();
        pedido = pedidoRepository.save(pedido);

        PedidoItem item = PedidoItem.builder()
                .pedido(pedido)
                .leilao(leilao)
                .quantidade(1)
                .precoUnitario(valor)
                .subtotal(valor)
                .build();
        pedidoItemRepository.save(item);

        Pagamento pagamento = Pagamento.builder()
                .pedido(pedido)
                .pagador(pagador)
                .recebedor(recebedor)
                .meioPagamento(dto.meioPagamento())
                .valorTotal(valor)
                .status(StatusPagamento.PENDENTE)
                .build();

        return pagamentoMapper.toResponse(pagamentoRepository.save(pagamento));
    }

    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorId(Integer id, Integer usuarioId) {
        Pagamento pagamento = buscarEntidadePorId(id);

        if (!pagamento.getPagador().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para visualizar este pagamento.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        return pagamentoMapper.toResponse(pagamento);
    }

    /**
     * Simula a aprovação do pagamento no ambiente de demonstração.
     * Em produção, a confirmação deve vir de um webhook autenticado do provedor.
     */
    public PagamentoResponse simularAprovacao(Integer id, Integer usuarioId) {
        Pagamento pagamento = buscarEntidadePorId(id);

        if (!pagamento.getPagador().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para confirmar este pagamento.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        if (pagamento.getStatus() == StatusPagamento.APROVADO) {
            return pagamentoMapper.toResponse(pagamento);
        }

        pagamento.setStatus(StatusPagamento.APROVADO);
        pagamento.setIdTransacao("SIMULACAO-" + System.currentTimeMillis());
        pagamento.setTxidPix("TXID-SIMULADO");
        pagamento.setDataPagamento(LocalDateTime.now());
        pagamento.getPedido().setStatus(PedidoStatus.PAGO);
        pagamento.getPedido().getItens().forEach(item -> {
            if (item.getLeilao() != null) {
                item.getLeilao().getProduto().setStatus(
                        com.example.midas_api.entity.enums.StatusProduto.VENDIDO);
            }
        });

        return pagamentoMapper.toResponse(pagamento);
    }

    private Pagamento buscarEntidadePorId(Integer id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento", id));
    }
}
