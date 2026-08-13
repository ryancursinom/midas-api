package com.example.midas_api.service;

import com.example.midas_api.dto.telefone.AtualizarTelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneResponse;
import com.example.midas_api.entity.Telefone;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.TelefoneMapper;
import com.example.midas_api.repository.TelefoneRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TelefoneService {

    private final TelefoneRepository telefoneRepository;
    private final UsuarioRepository usuarioRepository;
    private final TelefoneMapper telefoneMapper;

    public TelefoneResponse criar(TelefoneRequest dto, Integer usuarioId) {
        if (telefoneRepository.existsByTelefone(dto.telefone())) {
            throw new ResourceAlreadyExistsException("Telefone", "telefone", dto.telefone());
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Telefone telefone = telefoneMapper.toEntity(dto);
        telefone.setUsuario(usuario);

        return telefoneMapper.toResponse(telefoneRepository.save(telefone));
    }

    @Transactional(readOnly = true)
    public List<TelefoneResponse> listarPorUsuario(Integer usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuário", usuarioId);
        }
        return telefoneRepository.findByUsuario_Id(usuarioId).stream()
                .map(telefoneMapper::toResponse).toList();
    }

    public TelefoneResponse atualizar(Integer id, AtualizarTelefoneRequest dto, Integer usuarioId) {
        Telefone telefone = buscarEntidadePorId(id);

        if (!telefone.getUsuario().getId().equals(usuarioId)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você não tem permissão para alterar este telefone.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        if (dto.telefone() != null && !dto.telefone().equals(telefone.getTelefone())
                && telefoneRepository.existsByTelefone(dto.telefone())) {
            throw new ResourceAlreadyExistsException("Telefone", "telefone", dto.telefone());
        }

        telefoneMapper.toUpdate(dto, telefone);

        return telefoneMapper.toResponse(telefoneRepository.save(telefone));
    }

    public void deletar(Integer id, Integer usuarioId) {
        Telefone telefone = buscarEntidadePorId(id);
        if (!telefone.getUsuario().getId().equals(usuarioId)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você não tem permissão para excluir este telefone.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        telefoneRepository.delete(telefone);
    }

    private Telefone buscarEntidadePorId(Integer id) {
        return telefoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Telefone", id));
    }
}
