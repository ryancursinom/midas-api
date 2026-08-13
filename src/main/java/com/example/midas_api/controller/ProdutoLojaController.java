package com.example.midas_api.controller;

import com.example.midas_api.dto.produtoLoja.ProdutoLojaRequest;
import com.example.midas_api.dto.produtoLoja.ProdutoLojaResponse;
import com.example.midas_api.service.ProdutoLojaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/produtos-loja")
@RequiredArgsConstructor
public class ProdutoLojaController {

    private final ProdutoLojaService service;

    @GetMapping
    public ResponseEntity<List<ProdutoLojaResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoLojaResponse> buscar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @PostMapping
    public ResponseEntity<ProdutoLojaResponse> criar(@Valid @RequestBody ProdutoLojaRequest dto) {
        ProdutoLojaResponse response = service.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/produtos-loja/" + response.id())).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProdutoLojaResponse> atualizar(
            @PathVariable Integer id, @Valid @RequestBody ProdutoLojaRequest dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }
}
