package com.example.midas_api.service;

import com.example.midas_api.dto.lance.LanceRequest;
import com.example.midas_api.dto.lance.LanceResponse;
import com.example.midas_api.entity.Lance;
import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.LanceMapper;
import com.example.midas_api.repository.LanceRepository;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LanceService {

    private final LanceRepository lanceRepository;
    private final LeilaoRepository leilaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LanceMapper lanceMapper;

    /**
     * em um leilão de verdade, dois lances podem
     * chegar quase ao mesmo tempo. A checagem abaixo (buscar o maior lance,
     * depois inserir) tem uma janela de corrida — dois requests concorrentes
     * podem ler o mesmo "maior lance atual" antes de qualquer um dos dois
     * salvar.
     */
    public LanceResponse registrar(LanceRequest dto) {
        Leilao leilao = leilaoRepository.findById(dto.leilaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", dto.leilaoId()));

        LocalDateTime agora = LocalDateTime.now();
        if (leilao.getStatus() == StatusLeilao.AGUARDANDO && !agora.isBefore(leilao.getDataInicio())) {
            leilao.setStatus(StatusLeilao.ATIVO);
        }
        if (leilao.getStatus() == StatusLeilao.ATIVO && !agora.isBefore(leilao.getDataFim())) {
            leilao.setStatus(StatusLeilao.FINALIZADO);
        }

        if (leilao.getStatus() != StatusLeilao.ATIVO) {
            throw new BusinessException(
                    "Não é possível registrar lance em um leilão com status " + leilao.getStatus() + ".");
        }
        if (leilao.getDataFim() != null && LocalDateTime.now().isAfter(leilao.getDataFim())) {
            throw new BusinessException("O prazo deste leilão já expirou.");
        }

        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", dto.usuarioId()));

        if (leilao.getProduto().getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Você não pode dar lance no seu próprio produto.");
        }

        BigDecimal valorMinimo = lanceRepository.findTopByLeilao_IdOrderByValorDesc(leilao.getId())
                .map(Lance::getValor)
                .orElse(leilao.getProduto().getLanceMinimo());

        BigDecimal valorLance = BigDecimal.valueOf(dto.valor());
        if (valorLance.compareTo(valorMinimo) <= 0) {
            throw new BusinessException(
                    "O valor do lance deve ser maior que o lance atual (R$ %.2f).".formatted(valorMinimo));
        }

        Lance lance = lanceMapper.toEntity(dto);
        lance.setValor(valorLance);
        lance.setLeilao(leilao);
        lance.setUsuario(usuario);

        return lanceMapper.toResponse(lanceRepository.save(lance));
    }

    @Transactional(readOnly = true)
    public List<LanceResponse> listarPorUsuario(Integer usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuário", usuarioId);
        }
        return lanceRepository.findByUsuario_Id(usuarioId).stream()
                .map(lanceMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LanceResponse> listarPorLeilao(Integer leilaoId) {
        if (!leilaoRepository.existsById(leilaoId)) {
            throw new ResourceNotFoundException("Leilão", leilaoId);
        }
        return lanceRepository.findByLeilao_IdOrderByDataDesc(leilaoId).stream()
                .map(lanceMapper::toResponse)
                .toList();
    }
}
