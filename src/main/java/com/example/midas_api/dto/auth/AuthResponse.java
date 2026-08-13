package com.example.midas_api.dto.auth;

public record AuthResponse(
        String token,
        UsuarioSessaoResponse usuario
) {}
