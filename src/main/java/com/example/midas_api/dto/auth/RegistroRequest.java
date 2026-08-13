package com.example.midas_api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Pattern(regexp = "\\d{10,11}", message = "Informe um telefone com 10 ou 11 dígitos.") String telefone,
        @NotBlank @Size(min = 8, max = 255) String senha
) {}
