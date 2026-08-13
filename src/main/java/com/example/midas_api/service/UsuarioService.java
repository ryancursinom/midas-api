package com.example.midas_api.service;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.*;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.LeilaoMapper;
import com.example.midas_api.mapper.UsuarioMapper;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final LeilaoRepository leilaoRepository;
    private final UsuarioMapper usuarioMapper;
    private final LeilaoMapper leilaoMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponse criar(UsuarioRequest dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new ResourceAlreadyExistsException("Usuário", "email", dto.email());
        }
        if (usuarioRepository.existsByUsername(dto.username())) {
            throw new ResourceAlreadyExistsException("Usuário", "username", dto.username());
        }

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Integer id) {
        return usuarioMapper.toResponse(buscarEntidadePorId(id));
    }

    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);

        if (dto.username() != null && !dto.username().equals(usuario.getUsername())
                && usuarioRepository.existsByUsername(dto.username())) {
            throw new ResourceAlreadyExistsException("Usuário", "username", dto.username());
        }

        usuarioMapper.toUpdate(dto, usuario);
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizarEmail(Integer id, AtualizarEmailUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);

        if (dto.emailNovo() != null && !dto.emailNovo().equals(usuario.getEmail())
                && usuarioRepository.existsByEmail(dto.emailNovo())) {
            throw new ResourceAlreadyExistsException("Usuário", "email", dto.emailNovo());
        }

        usuario.setEmail(dto.emailNovo());
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    public void atualizarSenha(Integer id, AtualizarSenhaUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);
        validarSenha(usuario, dto.senhaAntiga());

        usuario.setSenha(passwordEncoder.encode(dto.senhaNova()));
        usuarioRepository.save(usuario);
    }

    public void validarSenha(Usuario usuario, String senhaAntiga) {
        if (senhaAntiga == null || !senhaConfere(senhaAntiga, usuario.getSenha())) {
            throw new BusinessException("Senha incorreta, tente novamente.", HttpStatus.UNAUTHORIZED);
        }

        // Ao alterar a senha de uma conta antiga, ela já passa a usar BCrypt.
        if (!senhaEstaCriptografada(usuario.getSenha())) {
            usuario.setSenha(passwordEncoder.encode(senhaAntiga));
        }
    }

    private boolean senhaConfere(String senhaDigitada, String senhaArmazenada) {
        if (senhaArmazenada == null) return false;
        if (senhaEstaCriptografada(senhaArmazenada)) {
            return passwordEncoder.matches(senhaDigitada, senhaArmazenada);
        }
        return senhaDigitada.equals(senhaArmazenada);
    }

    private boolean senhaEstaCriptografada(String senha) {
        return senha != null && senha.matches("^\\$2[aby]\\$.+");
    }

    public void deletar(Integer id) {
        Usuario usuario = buscarEntidadePorId(id);
        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public List<LeilaoResumoResponse> listarLeiloes(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário", id);
        }

        return leilaoRepository.findByProduto_Usuario_Id(id).stream()
                .map(leilaoMapper::toResponseResumo)
                .toList();
    }

    private Usuario buscarEntidadePorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }

}
