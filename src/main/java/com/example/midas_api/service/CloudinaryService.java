package com.example.midas_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.midas_api.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        validarConfiguracao();
        validarArquivoImagem(file);
        return enviarImagem(file, ObjectUtils.asMap(
                "folder", "midas/produtos",
                "resource_type", "image"
        ));
    }

    public String uploadFotoPerfil(MultipartFile file, Integer usuarioId) {
        validarConfiguracao();
        validarArquivoImagem(file);

        return enviarImagem(file, ObjectUtils.asMap(
                "public_id", publicIdFotoPerfil(usuarioId),
                "resource_type", "image",
                "overwrite", true,
                "invalidate", true
        ));
    }

    public String obterUrlFotoPerfil(Integer usuarioId) {
        if (!configuracaoValida()) return "";
        return garantirHttps(
                cloudinary.url()
                        .secure(true)
                        .resourceType("image")
                        .format("jpg")
                        .generate(publicIdFotoPerfil(usuarioId))
        );
    }

    private String enviarImagem(MultipartFile file, Map<String, Object> opcoes) {
        try {
            Map<?, ?> resultado = cloudinary.uploader().upload(file.getBytes(), opcoes);
            Object secureUrl = resultado.get("secure_url");
            if (secureUrl == null || secureUrl.toString().isBlank()) {
                throw new BusinessException("O Cloudinary não retornou a URL da imagem enviada.");
            }
            return garantirHttps(secureUrl.toString());
        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            throw new BusinessException("Não foi possível ler a imagem selecionada.");
        } catch (Exception e) {
            throw new BusinessException(
                    "Não foi possível enviar a imagem ao Cloudinary. Verifique as variáveis CLOUDINARY_* e tente novamente."
            );
        }
    }

    private String publicIdFotoPerfil(Integer usuarioId) {
        return "midas/perfis/usuario-" + usuarioId;
    }

    private void validarArquivoImagem(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Selecione uma imagem para enviar.");
        }
        String tipo = file.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new BusinessException("O arquivo enviado precisa ser uma imagem.");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new BusinessException("A imagem deve ter no máximo 5 MB.");
        }
    }

    private void validarConfiguracao() {
        if (!configuracaoValida()) {
            throw new BusinessException(
                    "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no ambiente."
            );
        }
    }

    private boolean configuracaoValida() {
        return !valorInvalido(cloudinary.config.cloudName)
                && !valorInvalido(cloudinary.config.apiKey)
                && !valorInvalido(cloudinary.config.apiSecret);
    }

    private boolean valorInvalido(String valor) {
        return valor == null || valor.isBlank() || valor.contains("<") || valor.contains(">");
    }

    private String garantirHttps(String url) {
        if (url == null) return "";
        if (url.startsWith("http://res.cloudinary.com/")) {
            return "https://" + url.substring("http://".length());
        }
        return url;
    }
}
