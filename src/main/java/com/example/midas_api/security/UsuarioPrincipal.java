package com.example.midas_api.security;

/** Identidade mínima extraída do JWT e usada pelo Spring Security. */
public record UsuarioPrincipal(Integer id, String email) {}
