package com.example.midas_api.security;

import com.example.midas_api.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class TokenService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public TokenService(
            @Value("${security.jwt.secret}") String segredoBase64,
            @Value("${security.jwt.expiration-ms:28800000}") long expiracaoMs) {
        if (segredoBase64 == null || segredoBase64.isBlank()) {
            throw new IllegalStateException("Defina JWT_SECRET no ambiente ou no arquivo .env antes de iniciar a aplicação.");
        }
        this.chave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(segredoBase64.trim()));
        this.expiracaoMs = expiracaoMs;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("uid", usuario.getId())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusMillis(expiracaoMs)))
                .signWith(chave)
                .compact();
    }

    public UsuarioPrincipal validarEObterPrincipal(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Integer usuarioId = claims.get("uid", Integer.class);
        String email = claims.getSubject();
        if (usuarioId == null || email == null || email.isBlank()) {
            throw new IllegalArgumentException("Token sem identificação de usuário.");
        }
        return new UsuarioPrincipal(usuarioId, email);
    }
}
