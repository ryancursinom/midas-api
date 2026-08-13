package com.example.midas_api.exception.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;


/** Corpo padrão de resposta para qualquer erro retornado pela API.
 * Corpo padrão de resposta para qualquer erro retornado pela API.
 * O campo {erros} só é preenchido em erros de validação de campos
 * (ex: 400 vindo de @Valid); nos demais casos ele vem como {null} e é omitido do JSON.
*/

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<CampoErro> erros
) {

    public static ErrorResponse of(HttpStatus status, String message, String path) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                null
        );
    }

    public static ErrorResponse ofValidacao(HttpStatus status, String message, String path, List<CampoErro> erros) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                erros
        );
    }

    public record CampoErro(String campo, String mensagem) {}
}