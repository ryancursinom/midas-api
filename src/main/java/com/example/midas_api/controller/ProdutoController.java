package com.example.midas_api.controller;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(
            @Valid @RequestBody ProdutoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        ProdutoResponse response = produtoService.criar(dto, usuario.id());
        return ResponseEntity.created(URI.create("/api/v1/produtos/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listar(@RequestParam(required = false) Integer usuarioId) {
        return ResponseEntity.ok(usuarioId == null
                ? produtoService.listarDisponiveis()
                : produtoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProdutoResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarProdutoRequest dto,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto, usuario.id()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        produtoService.deletar(id, usuario.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/imagens")
    public ResponseEntity<ProdutoResponse> adicionarImagem(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(produtoService.adicionarImagem(id, file, usuario.id()));
    }
}
