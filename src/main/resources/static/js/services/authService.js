import { enviarRequisicaoApi } from './api.js';

const TOKEN_KEY = 'midas-auth-token';
const USER_KEY = 'midas-auth-user';

export function obterTokenAutenticacao() {
    return localStorage.getItem(TOKEN_KEY)?.trim() || '';
}

export function verificarAutenticacao() {
    return Boolean(obterTokenAutenticacao());
}

export function obterUsuarioAutenticado() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
        return null;
    }
}

function salvarSessao(response) {
    if (!response?.token || !response?.usuario) throw new Error('Resposta de autenticação inválida.');
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
    return response.usuario;
}

export async function autenticarUsuario(email, senha) {
    const response = await enviarRequisicaoApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
    return salvarSessao(response);
}

export async function cadastrarUsuario(data) {
    const response = await enviarRequisicaoApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return salvarSessao(response);
}

export function encerrarSessao() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export async function atualizarUsuarioSessao() {
    if (!verificarAutenticacao()) return null;
    const usuario = await enviarRequisicaoApi('/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    return usuario;
}
