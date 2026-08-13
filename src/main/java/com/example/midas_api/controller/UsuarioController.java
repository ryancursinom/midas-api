package com.example.midas_api.controller;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.AtualizarEmailUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarSenhaUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarUsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioResponse;
import com.example.midas_api.dto.usuario.FotoPerfilResponse;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.UsuarioService;
import com.example.midas_api.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final CloudinaryService cloudinaryService;

    // Mantido por compatibilidade, mas o cadastro normal do frontend usa /api/auth/register.
    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioRequest dto) {
        UsuarioResponse response = usuarioService.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/usuarios/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarUsuarioRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<FotoPerfilResponse> obterFotoPerfil(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(new FotoPerfilResponse(cloudinaryService.obterUrlFotoPerfil(id)));
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<FotoPerfilResponse> atualizarFotoPerfil(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(new FotoPerfilResponse(cloudinaryService.uploadFotoPerfil(file, id)));
    }

    @PatchMapping("/{id}/email")
    public ResponseEntity<UsuarioResponse> atualizarEmail(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarEmailUsuarioRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(usuarioService.atualizarEmail(id, dto));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> atualizarSenha(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarSenhaUsuarioRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        usuarioService.atualizarSenha(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/leiloes")
    public ResponseEntity<List<LeilaoResumoResponse>> listarLeiloes(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        validarProprioUsuario(id, usuario);
        return ResponseEntity.ok(usuarioService.listarLeiloes(id));
    }

    private void validarProprioUsuario(Integer id, UsuarioPrincipal usuario) {
        if (usuario == null || !id.equals(usuario.id())) {
            throw new BusinessException("Você não tem permissão para acessar estes dados.", HttpStatus.FORBIDDEN);
        }
    }
}
