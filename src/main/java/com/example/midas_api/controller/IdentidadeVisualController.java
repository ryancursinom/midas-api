package com.example.midas_api.controller;

import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualResponse;
import com.example.midas_api.service.IdentidadeVisualService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/identidades-visuais")
@RequiredArgsConstructor
public class IdentidadeVisualController {

    private final IdentidadeVisualService identidadeVisualService;

    @GetMapping
    public ResponseEntity<List<IdentidadeVisualResponse>> listarTodas() {
        return ResponseEntity.ok(identidadeVisualService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdentidadeVisualResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(identidadeVisualService.buscarPorId(id));
    }
}
