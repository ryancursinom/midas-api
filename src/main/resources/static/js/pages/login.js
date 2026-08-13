import { definirErroCampo, limparErroCampo, focarPrimeiroCampoInvalido, validarEmail, validarCampoObrigatorio } from '../components/formValidation.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { autenticarUsuario, verificarAutenticacao } from '../services/authService.js';
import { traduzir } from '../services/i18n.js';

const form = document.getElementById('login-form');
const emailField = document.getElementById('login-email');
const passwordField = document.getElementById('login-password');
const status = document.getElementById('login-status');

function obterDestinoRedirecionamento() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (!redirect) return 'perfil.html';
    const allowedPages = new Set(['perfil.html', 'meus-leiloes.html', 'criar-leilao.html', 'checkout.html']);
    try {
        const target = new URL(redirect, window.location.href);
        const page = target.pathname.split('/').pop();
        const currentDirectory = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);
        const targetDirectory = target.pathname.slice(0, target.pathname.lastIndexOf('/') + 1);
        if (target.origin !== window.location.origin || targetDirectory !== currentDirectory || !allowedPages.has(page)) return 'perfil.html';
        return `${page}${target.search}${target.hash}`;
    } catch {
        return 'perfil.html';
    }
}

function validarFormularioLogin() {
    const emailValido = validarCampoObrigatorio(emailField, traduzir('E-mail')) && validarEmail(emailField);
    const senhaValida = validarCampoObrigatorio(passwordField, traduzir('Senha'));
    if (!emailValido || !senhaValida) focarPrimeiroCampoInvalido(form);
    return emailValido && senhaValida;
}

async function enviarLogin(event) {
    event.preventDefault();
    if (!validarFormularioLogin()) return;

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir('Entrando...'));

    try {
        await autenticarUsuario(emailField.value.trim(), passwordField.value);
        definirMensagemAoVivo(status, traduzir('Login realizado com sucesso. Redirecionando...'));
        window.location.href = obterDestinoRedirecionamento();
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('E-mail ou senha inválidos.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

[emailField, passwordField].forEach((field) => field.addEventListener('input', () => limparErroCampo(field)));
form.addEventListener('submit', enviarLogin);

if (verificarAutenticacao()) window.location.href = obterDestinoRedirecionamento();
