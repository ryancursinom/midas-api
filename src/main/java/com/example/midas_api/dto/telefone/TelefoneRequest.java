package com.example.midas_api.dto.telefone;

import com.example.midas_api.entity.enums.TipoTelefone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TelefoneRequest(
        @NotBlank @Pattern(regexp = "\\d{10,11}", message = "Informe um telefone com 10 ou 11 dígitos.") String telefone
) {}
