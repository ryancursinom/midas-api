package com.example.midas_api.controller;

import com.example.midas_api.dto.telefone.AtualizarTelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.TelefoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/telefones")
@RequiredArgsConstructor
public class TelefoneController {
    private final TelefoneService telefoneService;

    @PostMapping
    public ResponseEntity<TelefoneResponse> criar(
            @Valid @RequestBody TelefoneRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.status(201).body(telefoneService.criar(dto, usuario.id()));
    }

    @GetMapping
    public ResponseEntity<List<TelefoneResponse>> listar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(telefoneService.listarPorUsuario(usuario.id()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TelefoneResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarTelefoneRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(telefoneService.atualizar(id, dto, usuario.id()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        telefoneService.deletar(id, usuario.id());
        return ResponseEntity.noContent().build();
    }
}
