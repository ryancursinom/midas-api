package com.example.midas_api.controller;

import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {
    private final PedidoService service;

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(service.listarDoUsuario(usuario.id()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(service.buscar(id, usuario.id()));
    }
}
