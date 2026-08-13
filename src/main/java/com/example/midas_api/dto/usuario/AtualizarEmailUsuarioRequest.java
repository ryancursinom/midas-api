package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AtualizarEmailUsuarioRequest(
        @NotBlank @Email String emailNovo
) {}
