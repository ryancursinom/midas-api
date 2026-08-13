package com.example.midas_api.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(Environment environment) {
        String cloudName = obterValor(environment, "CLOUDINARY_CLOUD_NAME");
        String apiKey = obterValor(environment, "CLOUDINARY_API_KEY");
        String apiSecret = obterValor(environment, "CLOUDINARY_API_SECRET");

        // Preferimos as três variáveis separadas. Isso evita que um CLOUDINARY_URL
        // de exemplo/placeholder sobrescreva credenciais válidas.
        if (valorValido(cloudName) && valorValido(apiKey) && valorValido(apiSecret)) {
            Map<String, Object> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            config.put("secure", true);
            return new Cloudinary(config);
        }

        String url = obterValor(environment, "CLOUDINARY_URL");
        if (valorValido(url) && url.startsWith("cloudinary://")) {
            Cloudinary cloudinary = new Cloudinary(url);
            cloudinary.config.secure = true;
            return cloudinary;
        }

        // Mantém a aplicação capaz de iniciar mesmo sem Cloudinary configurado.
        // O CloudinaryService devolve uma mensagem clara caso alguém tente upload.
        Map<String, Object> config = new HashMap<>();
        config.put("secure", true);
        return new Cloudinary(config);
    }

    private String obterValor(Environment environment, String chave) {
        String valor = environment.getProperty(chave, "");
        return valor == null ? "" : valor.trim();
    }

    private boolean valorValido(String valor) {
        return valor != null
                && !valor.isBlank()
                && !valor.contains("<")
                && !valor.contains(">")
                && !valor.toLowerCase().contains("troque_aqui")
                && !valor.toLowerCase().contains("seu_")
                && !valor.toLowerCase().contains("sua_");
    }
}
