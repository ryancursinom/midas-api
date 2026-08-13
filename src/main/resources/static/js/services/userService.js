import { enviarRequisicaoApi } from './api.js';
import { atualizarUsuarioSessao, obterUsuarioAutenticado } from './authService.js';

function obterUsuarioId() {
    const id = Number(obterUsuarioAutenticado()?.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Usuário autenticado não identificado.');
    return id;
}

function adicionarVersaoCache(url) {
    if (!url) return '';
    const separador = url.includes('?') ? '&' : '?';
    return `${url}${separador}v=${Date.now()}`;
}

async function obterTelefones() {
    return enviarRequisicaoApi('/v1/telefones');
}

async function obterFotoPerfil(usuarioId) {
    try {
        return await enviarRequisicaoApi(`/v1/usuarios/${usuarioId}/foto`);
    } catch {
        return { url: '' };
    }
}

export async function obterPerfil() {
    const usuarioId = obterUsuarioId();
    const [usuario, telefones, foto] = await Promise.all([
        enviarRequisicaoApi(`/v1/usuarios/${usuarioId}`),
        obterTelefones(),
        obterFotoPerfil(usuarioId)
    ]);
    const principal = (telefones || []).find((item) => item.principal) || telefones?.[0];
    return {
        ...usuario,
        phone: principal?.telefone || '',
        phoneId: principal?.id || null,
        // O public_id do Cloudinary é estável e o upload usa overwrite=true.
        // A versão evita que o navegador reutilize a foto antiga após reload/login.
        fotoUrl: adicionarVersaoCache(foto?.url || '')
    };
}

export async function atualizarPerfil(data) {
    const usuarioId = obterUsuarioId();
    const atual = await obterPerfil();
    await enviarRequisicaoApi(`/v1/usuarios/${usuarioId}`, {
        method: 'PATCH',
        body: JSON.stringify({ nome: data.nome?.trim() || atual.nome })
    });

    if (data.email?.trim() && data.email.trim() !== atual.email) {
        await enviarRequisicaoApi(`/v1/usuarios/${usuarioId}/email`, {
            method: 'PATCH', body: JSON.stringify({ emailNovo: data.email.trim() })
        });
    }

    const telefone = String(data.phone || '').replace(/\D/g, '');
    if (telefone && telefone !== String(atual.phone || '').replace(/\D/g, '')) {
        if (atual.phoneId) {
            await enviarRequisicaoApi(`/v1/telefones/${atual.phoneId}`, {
                method: 'PATCH', body: JSON.stringify({ telefone, principal: true, tipo: 'CELULAR' })
            });
        } else {
            await enviarRequisicaoApi('/v1/telefones', {
                method: 'POST', body: JSON.stringify({ telefone, principal: true, tipo: 'CELULAR' })
            });
        }
    }

    await atualizarUsuarioSessao();
    return obterPerfil();
}

export function atualizarSenha(data) {
    const usuarioId = obterUsuarioId();
    return enviarRequisicaoApi(`/v1/usuarios/${usuarioId}/senha`, {
        method: 'PATCH',
        body: JSON.stringify({ senhaAntiga: data.currentPassword, senhaNova: data.newPassword })
    });
}


export async function atualizarFotoPerfil(file) {
    const usuarioId = obterUsuarioId();
    const body = new FormData();
    body.append('file', file);
    const resposta = await enviarRequisicaoApi(`/v1/usuarios/${usuarioId}/foto`, {
        method: 'POST',
        body
    });
    return { ...resposta, url: adicionarVersaoCache(resposta?.url || '') };
}
