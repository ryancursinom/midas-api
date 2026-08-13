package com.example.midas_api.service;

import com.example.midas_api.dto.favorito.FavoritoRequest;
import com.example.midas_api.dto.favorito.FavoritoResponse;
import com.example.midas_api.entity.Favorito;
import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.FavoritoMapper;
import com.example.midas_api.repository.FavoritoRepository;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LeilaoRepository leilaoRepository;
    private final FavoritoMapper favoritoMapper;

    public FavoritoResponse adicionar(Integer usuarioId, FavoritoRequest dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));
        Leilao leilao = leilaoRepository.findById(dto.leilaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", dto.leilaoId()));

        if (favoritoRepository.existsByUsuario_IdAndLeilao_Id(usuarioId, dto.leilaoId())) {
            throw new ResourceAlreadyExistsException(
                    "Favorito", "leilão", dto.leilaoId());
        }

        Favorito favorito = Favorito.builder()
                .usuario(usuario)
                .leilao(leilao)
                .build();

        return favoritoMapper.toResponse(favoritoRepository.save(favorito));
    }

    @Transactional(readOnly = true)
    public List<FavoritoResponse> listar(Integer usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuário", usuarioId);
        }
        return favoritoRepository.findByUsuario_Id(usuarioId).stream()
                .map(favoritoMapper::toResponse)
                .toList();
    }

    public void remover(Integer usuarioId, Integer leilaoId) {
        Favorito favorito = favoritoRepository.findByUsuario_IdAndLeilao_Id(usuarioId, leilaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorito", leilaoId));
        favoritoRepository.delete(favorito);
    }
}
