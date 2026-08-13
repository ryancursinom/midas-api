export function aplicarFallbackImagem(imagem, fallbackSrc) {
    if (!imagem || !fallbackSrc) return imagem;

    imagem.addEventListener('error', () => {
        if (imagem.dataset.fallbackAplicado === 'true') return;
        imagem.dataset.fallbackAplicado = 'true';
        imagem.src = fallbackSrc;
    });

    return imagem;
}
