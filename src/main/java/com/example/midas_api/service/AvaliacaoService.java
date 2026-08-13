package com.example.midas_api.service;

import com.example.midas_api.dto.avaliacao.AvaliacaoRequest;
import com.example.midas_api.dto.avaliacao.AvaliacaoResponse;
import com.example.midas_api.entity.Avaliacao;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.AvaliacaoMapper;
import com.example.midas_api.repository.AvaliacaoRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoMapper avaliacaoMapper;

    public AvaliacaoResponse criar(Integer usuarioId, AvaliacaoRequest dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Avaliacao avaliacao = Avaliacao.builder()
                .usuario(usuario)
                .nota(dto.nota())
                .observacao(dto.observacao())
                .build();

        AvaliacaoResponse response = avaliacaoMapper.toResponse(avaliacaoRepository.save(avaliacao));

        return response;
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listar() {
        return avaliacaoRepository.findAll().stream()
                .map(avaliacaoMapper::toResponse).toList();
    }
}
