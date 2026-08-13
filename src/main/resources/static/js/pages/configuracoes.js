import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { traduzir } from '../services/i18n.js';
import { obterConfiguracoes, restaurarConfiguracoes, salvarConfiguracoes } from '../services/settingsService.js';

const form = document.getElementById('settings-form');
const status = document.getElementById('settings-status');
const layout = document.getElementById('settings-layout');
const sidebar = document.getElementById('settings-profile-sidebar');
const backButton = document.getElementById('settings-back-button');
const siteHeader = document.getElementById('settings-site-header');
const siteFooter = document.getElementById('settings-site-footer');

function verificarContextoPerfil() {
    return new URLSearchParams(window.location.search).get('origem') === 'perfil';
}

function configurarContextoPagina() {
    const profileContext = verificarContextoPerfil();
    sidebar.hidden = !profileContext;
    backButton.hidden = profileContext;
    siteHeader.hidden = !profileContext;
    siteFooter.hidden = true;
    layout.classList.toggle('settings-layout--profile', profileContext);
}

function preencherFormulario(settings) {
    form.elements.theme.value = settings.theme;
    form.elements.contrast.value = settings.contrast;
    form.elements.fontSize.value = settings.fontSize;
    form.elements.colorVision.value = settings.colorVision;
    form.elements.language.value = settings.language;
    form.elements.reduceMotion.checked = settings.reduceMotion;
}

function lerFormulario() {
    return {
        theme: form.elements.theme.value,
        contrast: form.elements.contrast.value,
        fontSize: form.elements.fontSize.value,
        colorVision: form.elements.colorVision.value,
        language: form.elements.language.value,
        reduceMotion: form.elements.reduceMotion.checked
    };
}

function recarregarAposAlteracaoIdioma(previousLanguage, nextLanguage) {
    if (previousLanguage === nextLanguage) return false;
    window.location.reload();
    return true;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const previousLanguage = obterConfiguracoes().language;
    const settings = salvarConfiguracoes(lerFormulario());

    if (!recarregarAposAlteracaoIdioma(previousLanguage, settings.language)) {
        definirMensagemAoVivo(status, traduzir('Configurações salvas.'));
    }
});

document.getElementById('reset-settings').addEventListener('click', () => {
    const previousLanguage = obterConfiguracoes().language;
    const settings = restaurarConfiguracoes();
    preencherFormulario(settings);

    if (!recarregarAposAlteracaoIdioma(previousLanguage, settings.language)) {
        definirMensagemAoVivo(status, traduzir('Configurações restauradas para o padrão.'));
    }
});

document.getElementById('settings-logout-button').addEventListener('click', () => {
    window.location.href = 'login.html';
});

configurarContextoPagina();
preencherFormulario(obterConfiguracoes());
