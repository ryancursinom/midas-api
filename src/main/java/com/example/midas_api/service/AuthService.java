package com.example.midas_api.service;

import com.example.midas_api.dto.auth.AuthResponse;
import com.example.midas_api.dto.auth.LoginRequest;
import com.example.midas_api.dto.auth.RegistroRequest;
import com.example.midas_api.dto.auth.UsuarioSessaoResponse;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.usuario.UsuarioRequest;
import com.example.midas_api.entity.Telefone;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.entity.enums.TipoTelefone;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.repository.TelefoneRepository;
import com.example.midas_api.repository.UsuarioRepository;
import com.example.midas_api.security.TokenService;
import com.example.midas_api.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final TelefoneRepository telefoneRepository;
    private final UsuarioService usuarioService;
    private final TelefoneService telefoneService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED));

        if (!senhaConfere(request.senha(), usuario.getSenha())) {
            throw new BusinessException("E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED);
        }

        // Compatibilidade temporária com usuários antigos que ainda tinham senha em texto puro.
        if (!senhaEstaCriptografada(usuario.getSenha())) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
            usuarioRepository.save(usuario);
        }

        return criarResposta(usuario);
    }

    public AuthResponse registrar(RegistroRequest request) {
        var criado = usuarioService.criar(new UsuarioRequest(
                request.nome(), request.username(), request.email(), request.senha()));

        telefoneService.criar(new TelefoneRequest(
                request.telefone()), criado.id());

        Usuario usuario = usuarioRepository.findById(criado.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", criado.id()));
        return criarResposta(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioSessaoResponse obterUsuarioAtual(UsuarioPrincipal principal) {
        Usuario usuario = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", principal.id()));
        return criarUsuarioSessao(usuario);
    }

    private AuthResponse criarResposta(Usuario usuario) {
        return new AuthResponse(tokenService.gerarToken(usuario), criarUsuarioSessao(usuario));
    }

    private UsuarioSessaoResponse criarUsuarioSessao(Usuario usuario) {
        var telefones = telefoneRepository.findByUsuario_Id(usuario.getId());
        String telefone = telefones.stream()
                .findFirst()
                .or(() -> telefones.stream().findFirst())
                .map(Telefone::getTelefone)
                .orElse("");

        return new UsuarioSessaoResponse(
                usuario.getId(), usuario.getNome(), usuario.getUsername(), usuario.getEmail(), telefone);
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
}
