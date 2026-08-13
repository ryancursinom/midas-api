import { verificarAutenticacao } from '../services/authService.js';

export function exigirAutenticacao() {
    if (verificarAutenticacao()) return true;
    const paginaAtual = `${window.location.pathname.split('/').pop()}${window.location.search}${window.location.hash}`;
    window.location.replace(`login.html?redirect=${encodeURIComponent(paginaAtual)}`);
    return false;
}
