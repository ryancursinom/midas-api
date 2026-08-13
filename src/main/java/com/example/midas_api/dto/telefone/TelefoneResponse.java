package com.example.midas_api.dto.telefone;

import com.example.midas_api.entity.enums.TipoTelefone;

public record TelefoneResponse(
        Integer id,
        String telefone
) {}
