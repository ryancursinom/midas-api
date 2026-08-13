package com.example.midas_api.controller;

import com.example.midas_api.dto.lance.LanceRequest;
import com.example.midas_api.dto.lance.LanceResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.LanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leiloes/{leilaoId}/lances")
@RequiredArgsConstructor
public class LanceController {
    private final LanceService lanceService;

    @PostMapping
    public ResponseEntity<LanceResponse> registrar(
            @PathVariable Integer leilaoId,
            @Valid @RequestBody LanceRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        LanceRequest request = new LanceRequest(dto.valor(), leilaoId, usuario.id());
        LanceResponse response = lanceService.registrar(request);
        return ResponseEntity.created(URI.create("/api/v1/leiloes/" + leilaoId + "/lances/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LanceResponse>> listarPorLeilao(@PathVariable Integer leilaoId) {
        return ResponseEntity.ok(lanceService.listarPorLeilao(leilaoId));
    }
}
