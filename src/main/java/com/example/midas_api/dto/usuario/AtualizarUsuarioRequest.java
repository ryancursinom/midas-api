package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.Size;

public record AtualizarUsuarioRequest(
        @Size(max = 255) String nome,
        @Size(max = 50) String username
) {}
