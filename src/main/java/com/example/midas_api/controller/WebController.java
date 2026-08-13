package com.example.midas_api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping({"/", "/home"})
    public String home() {
        return "forward:/index.html";
    }

    @GetMapping("/catalogo")
    public String catalogo() { return "forward:/html/catalogo.html"; }

    @GetMapping("/login")
    public String login() { return "forward:/html/login.html"; }

    @GetMapping("/cadastro")
    public String cadastro() { return "forward:/html/cadastro.html"; }

    @GetMapping("/carrinho")
    public String carrinho() { return "forward:/html/carrinho.html"; }

    @GetMapping("/checkout")
    public String checkout() { return "forward:/html/checkout.html"; }

    @GetMapping("/perfil")
    public String perfil() { return "forward:/html/perfil.html"; }

    @GetMapping("/meus-leiloes")
    public String meusLeiloes() { return "forward:/html/meus-leiloes.html"; }

    @GetMapping("/criar-leilao")
    public String criarLeilao() { return "forward:/html/criar-leilao.html"; }

    @GetMapping("/sobre")
    public String sobre() { return "forward:/html/sobre_nos.html"; }

    @GetMapping("/loja")
    public String loja() { return "forward:/html/loja-oficial.html"; }
}
