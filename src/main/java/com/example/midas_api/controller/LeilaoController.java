package com.example.midas_api.controller;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.LeilaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leiloes")
@RequiredArgsConstructor
public class LeilaoController {
    private final LeilaoService leilaoService;

    @PostMapping
    public ResponseEntity<LeilaoResponse> criar(
            @Valid @RequestBody LeilaoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        LeilaoResponse response = leilaoService.criar(dto, usuario.id());
        return ResponseEntity.created(URI.create("/api/v1/leiloes/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LeilaoResponse>> listar(@RequestParam(required = false) StatusLeilao status) {
        return ResponseEntity.ok(leilaoService.listar(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeilaoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(leilaoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LeilaoResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarLeilaoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(leilaoService.atualizar(id, dto, usuario.id()));
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<LeilaoResponse> ativar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(leilaoService.ativar(id, usuario.id()));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<LeilaoResponse> finalizar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(leilaoService.finalizar(id, usuario.id()));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<LeilaoResponse> cancelar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(leilaoService.cancelar(id, usuario.id()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        leilaoService.deletar(id, usuario.id());
        return ResponseEntity.noContent().build();
    }
}
