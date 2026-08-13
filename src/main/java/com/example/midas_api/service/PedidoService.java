package com.example.midas_api.service;

import com.example.midas_api.dto.pedido.PedidoItemResponse;
import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.entity.Pedido;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.PedidoMapper;
import com.example.midas_api.repository.PedidoItemRepository;
import com.example.midas_api.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final PedidoMapper pedidoMapper;

    public List<PedidoResponse> listarDoUsuario(Integer usuarioId) {
        return pedidoRepository.findByUsuario_IdOrderByCriadoEmDesc(usuarioId)
                .stream().map(this::toResponse).toList();
    }

    public PedidoResponse buscar(Integer id, Integer usuarioId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));

        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você não tem permissão para visualizar este pedido.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        return toResponse(pedido);
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<PedidoItemResponse> itens = pedidoItemRepository.findByPedido_Id(pedido.getId()).stream()
                .map(pedidoMapper::toItemResponse)
                .toList();

        PedidoResponse base = pedidoMapper.toResponse(pedido);
        return new PedidoResponse(base.id(), base.usuarioId(), base.status(), base.valorTotal(),
                base.criadoEm(), base.atualizadoEm(), itens);
    }
}
