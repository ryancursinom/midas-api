package com.example.midas_api.config;

import com.example.midas_api.security.JwtAuthenticationFilter;
import com.example.midas_api.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final TokenService tokenService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/leiloes/**",
                                "/api/v1/produtos/**",
                                "/api/v1/categorias/**",
                                "/api/v1/estado/**",
                                "/api/v1/raridades/**",
                                "/api/v1/identidades-visuais/**",
                                "/api/v1/produtos-loja/**",
                                "/api/v1/avaliacoes/**").permitAll()
                        .requestMatchers(
                                "/", "/home", "/catalogo", "/login", "/cadastro", "/carrinho",
                                "/checkout", "/perfil", "/meus-leiloes", "/criar-leilao", "/sobre", "/loja",
                                "/index.html", "/html/**", "/css/**", "/js/**", "/assets/**", "/favicon.ico")
                        .permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"Faça login para continuar.\"}");
                }))
                .addFilterBefore(new JwtAuthenticationFilter(tokenService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
