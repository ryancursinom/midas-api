import { enviarRequisicaoApi, montarParametrosConsulta, normalizarColecao } from './api.js';
import { obterUsuarioAutenticado } from './authService.js';

const CACHE_KEY_BASE = 'midas-auctions-cache-v2';
const CACHE_TTL_MS = 5 * 60 * 1000;
let memoriaCache = new Map();
let requisicoesEmAndamento = new Map();

function chaveCache(params = {}) {
    const entries = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
}

function chavePersistencia() {
    return `${CACHE_KEY_BASE}:${obterUsuarioAutenticado()?.id || 'anon'}`;
}

function lerCachePersistido() {
    try {
        const raw = JSON.parse(localStorage.getItem(chavePersistencia()) || '{}');
        if (!raw || typeof raw !== 'object') return {};
        return raw;
    } catch {
        return {};
    }
}

function salvarCachePersistido() {
    try {
        const payload = Object.fromEntries(memoriaCache.entries());
        localStorage.setItem(chavePersistencia(), JSON.stringify(payload));
    } catch {
        // O cache é uma otimização; falhas de storage não podem quebrar a aplicação.
    }
}

function obterEntradaCache(chave) {
    const entrada = memoriaCache.get(chave) || lerCachePersistido()[chave];
    if (!entrada || !Array.isArray(entrada.items)) return null;
    if (Date.now() - Number(entrada.timestamp || 0) > CACHE_TTL_MS) return null;
    memoriaCache.set(chave, entrada);
    return entrada;
}

function gravarEntradaCache(chave, items) {
    memoriaCache.set(chave, { timestamp: Date.now(), items });
    salvarCachePersistido();
    return items;
}

export function invalidarCacheLeiloes() {
    memoriaCache.clear();
    requisicoesEmAndamento.clear();
    try { localStorage.removeItem(chavePersistencia()); } catch { /* storage opcional */ }
}

function atualizarItensCache(atualizador) {
    for (const [chave, entrada] of memoriaCache.entries()) {
        memoriaCache.set(chave, {
            ...entrada,
            timestamp: Date.now(),
            items: entrada.items.map(atualizador)
        });
    }
    salvarCachePersistido();
}

function extrairUrlImagem(valor) {
    if (!valor) return '';
    if (typeof valor === 'string') {
        const url = valor.trim();
        return url.startsWith('http://res.cloudinary.com/')
            ? `https://${url.slice('http://'.length)}`
            : url;
    }
    if (typeof valor === 'object') {
        return extrairUrlImagem(
            valor.url ?? valor.secure_url ?? valor.secureUrl ?? valor.urlImagem ?? valor.imageUrl
        );
    }
    return '';
}

function obterUrlsImagens(produto, raw) {
    const candidatos = [];
    const colecoes = [produto.imagens, produto.imageUrls, raw?.imagens, raw?.imageUrls];
    colecoes.forEach((colecao) => {
        if (Array.isArray(colecao)) candidatos.push(...colecao);
    });
    candidatos.push(produto.urlImagem, produto.imageUrl, raw?.urlImagem, raw?.imageUrl);
    return [...new Set(candidatos.map(extrairUrlImagem).filter(Boolean))];
}

function normalizarLeilao(raw) {
    if (!raw) return raw;
    const produto = raw.produto || {};
    const imagens = obterUrlsImagens(produto, raw);
    return {
        id: raw.id,
        status: raw.status,
        startsAt: raw.dataInicio,
        endsAt: raw.dataFim,
        createdAt: raw.criadoEm,
        saleType: raw.tipoCompra,
        buyNowPrice: raw.valorCompraImediata,
        currentBid: Number(raw.lanceAtual ?? produto.lanceMinimo ?? 0),
        startingBid: Number(produto.lanceMinimo ?? 0),
        bidCount: Number(raw.quantidadeLances ?? 0),
        productId: produto.id,
        ownerId: produto.usuarioId ?? produto.usuario?.id,
        title: produto.nome || 'Item sem nome',
        description: produto.resumoDescricao || '',
        brand: produto.marca || '',
        category: produto.categoria?.nome || 'Sem categoria',
        categoryId: produto.categoria?.id,
        condition: produto.estadoFisico?.nome || 'Estado não informado',
        conditionId: produto.estadoFisico?.id,
        rarity: produto.raridade?.nome || 'Não informada',
        rarityId: produto.raridade?.id,
        imageUrl: imagens[0] || '',
        imageUrls: imagens,
        isFavorite: false,
        canCheckout: false
    };
}

function normalizarLance(raw) {
    return {
        id: raw.id,
        amount: Number(raw.valor || 0),
        createdAt: raw.data,
        auctionId: raw.leilao?.id,
        userId: raw.usuario?.id,
        username: raw.usuario?.username || ''
    };
}

async function obterMaiorLanceUsuario(leilaoId) {
    try {
        const lances = normalizarColecao(await enviarRequisicaoApi('/v1/lances'))
            .map(normalizarLance)
            .filter((lance) => String(lance.auctionId) === String(leilaoId));
        if (!lances.length) return null;
        return Math.max(...lances.map((lance) => lance.amount));
    } catch {
        return null;
    }
}

async function obterIdsFavoritos() {
    try {
        const favoritos = normalizarColecao(await enviarRequisicaoApi('/v1/favoritos'));
        return new Set(favoritos.map((item) => String(item.leilao?.id)).filter(Boolean));
    } catch {
        return new Set();
    }
}

async function carregarLeiloes(params = {}) {
    const raw = normalizarColecao(await enviarRequisicaoApi(`/v1/leiloes${montarParametrosConsulta(params)}`));
    const favoritos = await obterIdsFavoritos();
    return raw.map(normalizarLeilao).map((item) => ({
        ...item,
        isFavorite: favoritos.has(String(item.id))
    }));
}

export async function obterLeiloes(params = {}) {
    const chave = chaveCache(params);
    const entrada = obterEntradaCache(chave);
    if (entrada) return entrada.items.map((item) => ({ ...item }));
    if (requisicoesEmAndamento.has(chave)) return requisicoesEmAndamento.get(chave);

    const requisicao = carregarLeiloes(params)
        .then((items) => gravarEntradaCache(chave, items).map((item) => ({ ...item })))
        .finally(() => requisicoesEmAndamento.delete(chave));
    requisicoesEmAndamento.set(chave, requisicao);
    return requisicao;
}

export async function obterLeilaoPorId(id) {
    const [raw, favoritos] = await Promise.all([
        enviarRequisicaoApi(`/v1/leiloes/${encodeURIComponent(id)}`),
        obterIdsFavoritos()
    ]);
    const item = normalizarLeilao(raw);
    const finalizado = ['FINALIZADO', 'ENCERRADO', 'CLOSED'].includes(String(item.status).toUpperCase());
    const maiorLanceUsuario = finalizado ? await obterMaiorLanceUsuario(item.id) : null;
    return {
        ...item,
        isFavorite: favoritos.has(String(item.id)),
        canCheckout: finalizado && maiorLanceUsuario !== null && maiorLanceUsuario === Number(item.currentBid)
    };
}

export async function obterHistoricoLances(id) {
    return normalizarColecao(await enviarRequisicaoApi(`/v1/leiloes/${encodeURIComponent(id)}/lances`)).map(normalizarLance);
}

export async function enviarLance(id, valor) {
    const resposta = await enviarRequisicaoApi(`/v1/leiloes/${encodeURIComponent(id)}/lances`, {
        method: 'POST', body: JSON.stringify({ valor })
    });
    invalidarCacheLeiloes();
    return resposta;
}

export async function definirFavorito(id, favorite) {
    const resposta = favorite
        ? await enviarRequisicaoApi('/v1/favoritos', {
            method: 'POST', body: JSON.stringify({ leilaoId: id })
        })
        : await enviarRequisicaoApi(`/v1/favoritos?leilaoId=${encodeURIComponent(id)}`, { method: 'DELETE' });
    atualizarItensCache((item) => String(item.id) === String(id) ? { ...item, isFavorite: favorite } : item);
    return resposta;
}

export async function criarLeilao(data) {
    const resposta = await enviarRequisicaoApi('/v1/leiloes', { method: 'POST', body: JSON.stringify(data) });
    invalidarCacheLeiloes();
    return resposta;
}

export async function atualizarLeilao(id, data) {
    const resposta = await enviarRequisicaoApi(`/v1/leiloes/${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify(data)
    });
    invalidarCacheLeiloes();
    return resposta;
}

async function obterLeiloesBase() {
    return obterLeiloes();
}

export async function obterLeiloesFavoritos() {
    const todos = await obterLeiloesBase();
    return todos.filter((item) => item.isFavorite).map((item) => ({ ...item, isFavorite: true }));
}

export async function obterLeiloesCriados() {
    const usuarioId = obterUsuarioAutenticado()?.id;
    const todos = await obterLeiloesBase();
    return todos.filter((item) => String(item.ownerId) === String(usuarioId));
}

export async function obterLeiloesComMeusLances() {
    const lances = normalizarColecao(await enviarRequisicaoApi('/v1/lances'));
    const maiorPorLeilao = new Map();
    lances.forEach((raw) => {
        const lance = normalizarLance(raw);
        const key = String(lance.auctionId);
        maiorPorLeilao.set(key, Math.max(maiorPorLeilao.get(key) || 0, lance.amount));
    });
    const items = await obterLeiloesBase();
    return items.filter((item) => maiorPorLeilao.has(String(item.id))).map((item) => ({
        ...item,
        canCheckout: ['FINALIZADO', 'ENCERRADO', 'CLOSED'].includes(String(item.status).toUpperCase())
            && maiorPorLeilao.get(String(item.id)) === Number(item.currentBid)
    }));
}
