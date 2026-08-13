package com.example.midas_api.exception;

/**
 * Lançada quando um recurso buscado por identificador (ou por qualquer outro
 * critério único) não é encontrado. Sempre resulta em HTTP 404 (Not Found).
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }

    //* Monta a mensagem padrão "{recurso} não encontrado(a) com id: {id}".
    public ResourceNotFoundException(String recurso, Object id) {
        super("%s não encontrado(a) com id: %s".formatted(recurso, id));
    }
}