import { UserFacingError } from '../components/userError.js';
import { traduzir } from './i18n.js';

function obterBaseApi() {
    const { hostname, port, protocol } = window.location;
    const hostLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    // Quando o frontend está aberto por Live Server em outra porta,
    // o backend continua em 8080. Em produção/Render usamos a mesma origem.
    if (protocol === 'file:') return 'http://localhost:8080/api';
    if (hostLocal && port && port !== '8080') return `${protocol}//${hostname}:8080/api`;
    return '/api';
}

const API_BASE_URL = obterBaseApi();
const REQUEST_TIMEOUT_MS = 10000;
const AUTH_TOKEN_KEY = 'midas-auth-token';

export class ApiError extends UserFacingError {
    constructor(message, status = 0, details = null) {
        super(message, status, details);
        this.name = 'ApiError';
    }
}

function montarCabecalhos(customHeaders = {}, body) {
    const headers = new Headers(customHeaders);
    if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');
    const token = localStorage.getItem(AUTH_TOKEN_KEY)?.trim();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return headers;
}

async function interpretarResposta(response) {
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return response.text();
}

function obterMensagemPorStatus(status) {
    const messages = {
        400: 'Revise os dados informados e tente novamente.',
        401: 'Os dados informados não foram aceitos.',
        403: 'Você não tem permissão para realizar esta ação.',
        404: 'Não encontramos o conteúdo solicitado.',
        409: 'Esta ação entra em conflito com dados já existentes.',
        422: 'Alguns dados precisam ser corrigidos antes de continuar.',
        429: 'Muitas tentativas foram feitas em pouco tempo. Aguarde um momento e tente novamente.'
    };
    if (messages[status]) return traduzir(messages[status]);
    if (status >= 500) return traduzir('Algo deu errado do nosso lado. Tente novamente em instantes.');
    return traduzir('Não conseguimos concluir esta ação agora. Tente novamente em instantes.');
}

function obterMensagemErro(payload, status) {
    if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.erros) && payload.erros.length) {
            return payload.erros.map((item) => item.mensagem).filter(Boolean).join(' ');
        }
        if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
    }
    if (typeof payload === 'string' && payload.trim() && payload.length < 300) return payload;
    return obterMensagemPorStatus(status);
}

export async function enviarRequisicaoApi(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: montarCabecalhos(options.headers, options.body),
            signal: controller.signal
        });
        const payload = await interpretarResposta(response);
        if (!response.ok) throw new ApiError(traduzir(obterMensagemErro(payload, response.status)), response.status, payload);
        return payload;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === 'AbortError') {
            throw new ApiError(traduzir('Esta ação está demorando mais que o esperado. Tente novamente.'), 408);
        }
        throw new ApiError(traduzir('Não conseguimos concluir esta ação agora. Verifique sua conexão e tente novamente.'));
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export function montarParametrosConsulta(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
}

export function normalizarColecao(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}
