package com.example.midas_api.controller;

import com.example.midas_api.dto.pagamento.PagamentoRequest;
import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping
    public ResponseEntity<PagamentoResponse> iniciar(
            @Valid @RequestBody PagamentoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        PagamentoResponse response = pagamentoService.iniciar(dto, usuario.id());
        return ResponseEntity.created(URI.create("/api/v1/pagamentos/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoResponse> buscarPorId(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(pagamentoService.buscarPorId(id, usuario.id()));
    }

    @PostMapping("/{id}/simular-aprovacao")
    public ResponseEntity<PagamentoResponse> simularAprovacao(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(pagamentoService.simularAprovacao(id, usuario.id()));
    }
}
