package com.example.midas_api.controller;

import com.example.midas_api.dto.estadoFisico.EstadoFisicoResponse;
import com.example.midas_api.service.EstadoFisicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/estado")
@RequiredArgsConstructor
public class EstadoFisicoController {

    private final EstadoFisicoService estadoFisicoService;

    @GetMapping
    public ResponseEntity<List<EstadoFisicoResponse>> listarTodos(){
        return ResponseEntity.ok(estadoFisicoService.listarTodas());
    };

    @GetMapping("/{id}")
    public ResponseEntity<EstadoFisicoResponse> buscarPorId(@PathVariable Integer id){
        return ResponseEntity.ok(estadoFisicoService.buscarPorId(id));
    };
}