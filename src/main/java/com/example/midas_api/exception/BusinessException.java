package com.example.midas_api.exception;

import org.springframework.http.HttpStatus;

/**
 * Lançada quando uma regra de negócio é violada — a requisição está bem
 * formada e o recurso existe, mas a operação não pode ser realizada no estado atual do sistema.
 * Por padrão resulta em HTTP 422 (Unprocessable Entity), mas o status pode
 * ser customizado quando 400 (Bad Request) ou 409 (Conflict) fizer mais
 * sentido semântico pro caso específico.
*/
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String mensagem) {
        super(mensagem);
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
    }

    public BusinessException(String mensagem, HttpStatus status) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}