package com.example.midas_api.controller;

import com.example.midas_api.dto.auth.AuthResponse;
import com.example.midas_api.dto.auth.LoginRequest;
import com.example.midas_api.dto.auth.RegistroRequest;
import com.example.midas_api.dto.auth.UsuarioSessaoResponse;
import com.example.midas_api.security.UsuarioPrincipal;
import com.example.midas_api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(201).body(authService.registrar(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioSessaoResponse> me(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(authService.obterUsuarioAtual(usuario));
    }
}
