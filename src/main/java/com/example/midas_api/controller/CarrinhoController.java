package com.example.midas_api.controller;

import com.example.midas_api.dto.carrinho.AdicionarCarrinhoItemRequest;
import com.example.midas_api.dto.carrinho.AtualizarCarrinhoItemRequest;
import com.example.midas_api.dto.carrinho.CarrinhoResponse;
import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.CarrinhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {
    private final CarrinhoService service;

    @GetMapping
    public ResponseEntity<CarrinhoResponse> buscar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(service.buscar(usuario.id()));
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionar(
            @Valid @RequestBody AdicionarCarrinhoItemRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(service.adicionar(usuario.id(), dto));
    }

    @PatchMapping("/itens/{itemId}")
    public ResponseEntity<CarrinhoResponse> atualizar(
            @PathVariable Integer itemId,
            @Valid @RequestBody AtualizarCarrinhoItemRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(service.atualizarItem(usuario.id(), itemId, dto));
    }

    @DeleteMapping("/itens/{itemId}")
    public ResponseEntity<Void> remover(
            @PathVariable Integer itemId,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        service.removerItem(usuario.id(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> limpar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        service.limpar(usuario.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<PedidoResponse> checkout(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.status(201).body(service.checkout(usuario.id()));
    }
}
