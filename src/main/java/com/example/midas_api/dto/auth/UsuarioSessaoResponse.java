package com.example.midas_api.dto.auth;

public record UsuarioSessaoResponse(
        Integer id,
        String nome,
        String username,
        String email,
        String telefone
) {}
