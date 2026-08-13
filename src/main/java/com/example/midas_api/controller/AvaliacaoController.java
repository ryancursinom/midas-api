package com.example.midas_api.controller;

import com.example.midas_api.dto.avaliacao.AvaliacaoRequest;
import com.example.midas_api.dto.avaliacao.AvaliacaoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {
    private final AvaliacaoService service;

    @GetMapping
    public ResponseEntity<List<AvaliacaoResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> criar(
            @Valid @RequestBody AvaliacaoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.status(201).body(service.criar(usuario.id(), dto));
    }
}
