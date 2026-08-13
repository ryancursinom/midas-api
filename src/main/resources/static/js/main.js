import { inicializarPainelAcessibilidade } from './components/accessibilityPanel.js';
import { inicializarModalAvaliacao } from './components/feedbackModal.js';
import { renderizarIconesEstaticos } from './components/icons.js';
import { inicializarEstruturaSite } from './components/siteChrome.js';
import { inicializarTraducao } from './services/i18n.js';
import { aplicarConfiguracoes } from './services/settingsService.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function obterDestinoInterno(link) {
    const href = link.getAttribute('href');
    if (!href || href === '#' || !href.startsWith('#')) return null;
    return document.querySelector(href);
}

function focarSecao(target) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
}

function navegarParaSecaoInterna(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = obterDestinoInterno(link);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
    focarSecao(target);
}

function inicializarNavegacaoGlobal() {
    document.addEventListener('click', navegarParaSecaoInterna);
}


function navegarParaPaginaAnterior(event) {
    const button = event.target.closest('[data-back-button]');
    if (!button) return;

    const fallback = button.dataset.backFallback || '../index.html';
    const referrer = document.referrer;

    if (referrer) {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.origin === window.location.origin) {
            window.history.back();
            return;
        }
    }

    window.location.href = fallback;
}

function inicializarBotoesVoltar() {
    document.addEventListener('click', navegarParaPaginaAnterior);
}

function sincronizarConfiguracoesAposHistorico() {
    // O navegador pode restaurar uma página antiga pelo botão Voltar sem executar os módulos novamente.
    aplicarConfiguracoes();
}

function inicializarRecursosGlobais() {
    aplicarConfiguracoes();
    inicializarTraducao();
    inicializarEstruturaSite();
    inicializarPainelAcessibilidade();
    inicializarModalAvaliacao();
    renderizarIconesEstaticos();
    inicializarNavegacaoGlobal();
    inicializarBotoesVoltar();
    window.addEventListener('pageshow', sincronizarConfiguracoesAposHistorico);
}

inicializarRecursosGlobais();
