package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarSenhaUsuarioRequest(
        @NotBlank String senhaAntiga,
        @NotBlank @Size(min = 8, max = 255) String senhaNova
) {}
