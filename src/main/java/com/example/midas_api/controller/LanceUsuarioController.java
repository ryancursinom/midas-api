package com.example.midas_api.controller;

import com.example.midas_api.dto.lance.LanceResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.LanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lances")
@RequiredArgsConstructor
public class LanceUsuarioController {
    private final LanceService lanceService;

    @GetMapping
    public ResponseEntity<List<LanceResponse>> listarPorUsuario(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(lanceService.listarPorUsuario(usuario.id()));
    }
}
