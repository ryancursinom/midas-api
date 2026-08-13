import { limparErroCampo, focarPrimeiroCampoInvalido, validarCampoTelefoneBrasileiro, validarEmail, validarSenha, validarCampoObrigatorio } from '../components/formValidation.js';
import { aplicarMascaraTelefone, formatarTelefoneBrasileiro, obterDigitosTelefone } from '../components/phone.js';
import { renderizarEstado, definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { traduzir } from '../services/i18n.js';
import { obterPerfil, atualizarSenha, atualizarPerfil, atualizarFotoPerfil } from '../services/userService.js';
import { encerrarSessao } from '../services/authService.js';
import { exigirAutenticacao } from '../components/privatePageGuard.js';
import { abrirDialogo, fecharDialogo, inicializarDialogo } from '../components/modal.js';

if (!exigirAutenticacao()) throw new Error('Redirecionando para o login.');

const state = document.getElementById('profile-state');
const dataContainer = document.getElementById('profile-data');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const profileStatus = document.getElementById('profile-form-status');
const passwordStatus = document.getElementById('password-status');
const avatarInitials = document.getElementById('profile-avatar-initials');
const avatarImage = document.getElementById('profile-avatar-image');
const phoneField = document.getElementById('profile-phone');
const photoEditButton = document.getElementById('profile-avatar-edit');
const photoDialog = document.getElementById('profile-photo-dialog');
const photoInput = document.getElementById('profile-photo-input');
const photoPreviewImage = document.getElementById('profile-photo-preview-image');
const photoPreviewInitials = document.getElementById('profile-photo-preview-initials');
const photoSaveButton = document.getElementById('profile-photo-save');
const photoStatus = document.getElementById('profile-photo-status');

let profileAtual = null;
let fotoSelecionada = null;
let urlPreviaFoto = '';

function obterIniciais(name) {
    return String(name || 'M').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function exibirImagemOuIniciais(image, initials, url, name) {
    const iniciais = obterIniciais(name);
    initials.textContent = iniciais;

    if (!url) {
        image.hidden = true;
        image.removeAttribute('src');
        initials.hidden = false;
        return;
    }

    image.onerror = () => {
        image.hidden = true;
        initials.hidden = false;
    };
    image.src = url;
    image.hidden = false;
    initials.hidden = true;
}

function renderizarPerfil(profile) {
    profileAtual = profile;
    const name = profile.nome || traduzir('Usuário Midas');
    document.getElementById('profile-name-heading').textContent = name;
    document.getElementById('profile-username').textContent = profile.username ? `@${profile.username}` : '';
    exibirImagemOuIniciais(avatarImage, avatarInitials, profile.fotoUrl, name);
    document.getElementById('profile-name').value = name;
    document.getElementById('profile-email').value = profile.email || '';
    phoneField.value = formatarTelefoneBrasileiro(profile.phone || '');
    dataContainer.hidden = false;
    state.textContent = '';
}

function validarFormularioPerfil() {
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const valid = validarCampoObrigatorio(name, traduzir('Nome'))
        && validarCampoObrigatorio(email, traduzir('E-mail'))
        && validarEmail(email)
        && validarCampoTelefoneBrasileiro(phoneField);
    if (!valid) focarPrimeiroCampoInvalido(profileForm);
    return valid;
}

async function salvarPerfil(event) {
    event.preventDefault();
    if (!validarFormularioPerfil()) return;
    const submitButton = profileForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(profileStatus, traduzir('Salvando alterações...'));
    try {
        const data = Object.fromEntries(new FormData(profileForm));
        renderizarPerfil(await atualizarPerfil({ nome: data.name, email: data.email, phone: obterDigitosTelefone(data.phone) }));
        definirMensagemAoVivo(profileStatus, traduzir('Perfil atualizado com sucesso.'));
    } catch (error) {
        definirMensagemAoVivo(profileStatus, obterMensagemErroUsuario(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

function validarFormularioSenha() {
    const current = document.getElementById('current-password');
    const next = document.getElementById('new-password');
    const valid = validarCampoObrigatorio(current, traduzir('Senha atual')) && validarSenha(next);
    if (!valid) focarPrimeiroCampoInvalido(passwordForm);
    return valid;
}

async function salvarSenha(event) {
    event.preventDefault();
    if (!validarFormularioSenha()) return;
    const submitButton = passwordForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(passwordStatus, traduzir('Atualizando senha...'));
    try {
        await atualizarSenha(Object.fromEntries(new FormData(passwordForm)));
        passwordForm.reset();
        definirMensagemAoVivo(passwordStatus, traduzir('Senha atualizada com sucesso.'));
    } catch (error) {
        definirMensagemAoVivo(passwordStatus, obterMensagemErroUsuario(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

function liberarPreviaFoto() {
    if (urlPreviaFoto) URL.revokeObjectURL(urlPreviaFoto);
    urlPreviaFoto = '';
}

function limparSelecaoFoto() {
    liberarPreviaFoto();
    fotoSelecionada = null;
    photoInput.value = '';
    photoSaveButton.disabled = true;
    definirMensagemAoVivo(photoStatus, '');
}

function abrirEdicaoFoto() {
    limparSelecaoFoto();
    exibirImagemOuIniciais(
        photoPreviewImage,
        photoPreviewInitials,
        profileAtual?.fotoUrl,
        profileAtual?.nome
    );
    abrirDialogo(photoDialog, photoEditButton);
}

function selecionarFoto() {
    liberarPreviaFoto();
    fotoSelecionada = photoInput.files?.[0] || null;

    if (!fotoSelecionada) {
        photoSaveButton.disabled = true;
        return;
    }
    if (!fotoSelecionada.type.startsWith('image/')) {
        definirMensagemAoVivo(photoStatus, traduzir('O arquivo selecionado precisa ser uma imagem.'), true);
        fotoSelecionada = null;
        photoSaveButton.disabled = true;
        return;
    }
    if (fotoSelecionada.size > 5 * 1024 * 1024) {
        definirMensagemAoVivo(photoStatus, traduzir('A imagem deve ter no máximo 5 MB.'), true);
        fotoSelecionada = null;
        photoSaveButton.disabled = true;
        return;
    }

    urlPreviaFoto = URL.createObjectURL(fotoSelecionada);
    exibirImagemOuIniciais(photoPreviewImage, photoPreviewInitials, urlPreviaFoto, profileAtual?.nome);
    definirMensagemAoVivo(photoStatus, traduzir('Prévia pronta. Salve a foto para confirmar a alteração.'));
    photoSaveButton.disabled = false;
}

async function salvarFoto() {
    if (!fotoSelecionada) return;
    photoSaveButton.disabled = true;
    definirMensagemAoVivo(photoStatus, traduzir('Salvando foto...'));
    try {
        const response = await atualizarFotoPerfil(fotoSelecionada);
        profileAtual = { ...profileAtual, fotoUrl: response?.url || '' };
        exibirImagemOuIniciais(avatarImage, avatarInitials, profileAtual.fotoUrl, profileAtual.nome);
        definirMensagemAoVivo(photoStatus, traduzir('Foto de perfil atualizada com sucesso.'));
        window.setTimeout(() => fecharDialogo(photoDialog), 350);
    } catch (error) {
        definirMensagemAoVivo(photoStatus, obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos atualizar sua foto agora. Tente novamente em instantes.')
        ), true);
        photoSaveButton.disabled = false;
    }
}

async function carregarPerfil() {
    renderizarEstado(state, 'loading', traduzir('Carregando perfil...'));
    try {
        renderizarPerfil(await obterPerfil());
    } catch (error) {
        renderizarEstado(state, 'error', obterMensagemErroUsuario(error));
    }
}

inicializarDialogo(photoDialog);
profileForm.addEventListener('submit', salvarPerfil);
passwordForm.addEventListener('submit', salvarSenha);
profileForm.querySelectorAll('input').forEach((field) => field.addEventListener('input', () => limparErroCampo(field)));
phoneField.addEventListener('input', () => aplicarMascaraTelefone(phoneField));
passwordForm.querySelectorAll('input').forEach((field) => field.addEventListener('input', () => limparErroCampo(field)));
photoEditButton.addEventListener('click', abrirEdicaoFoto);
photoInput.addEventListener('change', selecionarFoto);
photoSaveButton.addEventListener('click', salvarFoto);
photoDialog.addEventListener('close', limparSelecaoFoto);
document.getElementById('logout-button').addEventListener('click', () => {
    encerrarSessao();
    window.location.href = 'login.html';
});
window.addEventListener('pagehide', liberarPreviaFoto);

carregarPerfil();
