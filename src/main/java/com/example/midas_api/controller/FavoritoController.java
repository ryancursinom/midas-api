package com.example.midas_api.controller;

import com.example.midas_api.dto.favorito.FavoritoRequest;
import com.example.midas_api.dto.favorito.FavoritoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.FavoritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favoritos")
@RequiredArgsConstructor
public class FavoritoController {
    private final FavoritoService favoritoService;

    @GetMapping
    public ResponseEntity<List<FavoritoResponse>> listar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(favoritoService.listar(usuario.id()));
    }

    @PostMapping
    public ResponseEntity<FavoritoResponse> adicionar(
            @Valid @RequestBody FavoritoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.status(201).body(favoritoService.adicionar(usuario.id(), dto));
    }

    @DeleteMapping
    public ResponseEntity<Void> remover(
            @RequestParam Integer leilaoId,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        favoritoService.remover(usuario.id(), leilaoId);
        return ResponseEntity.noContent().build();
    }
}
