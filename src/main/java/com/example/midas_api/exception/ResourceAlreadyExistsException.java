package com.example.midas_api.exception;

/**
 * Lançada quando uma operação de criação/atualização violaria uma regra de
 * unicidade (username, email, telefone, nome de categoria, etc.).
 * Sempre resulta em HTTP 409 (Conflict).
 */
public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String mensagem) {
        super(mensagem);
    }

     // Monta a mensagem padrão "{recurso} já existe com {campo}: {valor}".
    public ResourceAlreadyExistsException(String recurso, String campo, Object valor) {
        super("%s já existe com %s: %s".formatted(recurso, campo, valor));
    }
}