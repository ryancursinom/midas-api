import { criarElemento } from './dom.js';
import { criarIcone } from './icons.js';

const triggerByDialog = new WeakMap();
const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function restaurarFoco(dialog) {
    const trigger = triggerByDialog.get(dialog);
    if (trigger instanceof HTMLElement && document.contains(trigger)) trigger.focus();
    triggerByDialog.delete(dialog);
}

function obterElementosFocaveis(dialog) {
    return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function manterFocoNoDialogo(event, dialog) {
    if (event.key !== 'Tab') return;
    const focusable = obterElementosFocaveis(dialog);
    if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function garantirSuperficieDialogo(dialog) {
    let surface = dialog.querySelector(':scope > .dialog-surface');
    if (surface) return surface;
    surface = document.createElement('div');
    surface.className = 'dialog-surface';
    while (dialog.firstChild) surface.appendChild(dialog.firstChild);
    dialog.appendChild(surface);
    surface.addEventListener('click', (event) => event.stopPropagation());
    return surface;
}

export function abrirDialogo(dialog, trigger = document.activeElement) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    triggerByDialog.set(dialog, trigger instanceof HTMLElement ? trigger : null);
    dialog.showModal();
    const firstFocusable = obterElementosFocaveis(dialog)[0];
    (firstFocusable || dialog).focus();
}

export function fecharDialogo(dialog) {
    if (dialog?.open) dialog.close();
}

export function inicializarDialogo(dialog) {
    if (!dialog) return;
    garantirSuperficieDialogo(dialog);
    dialog.setAttribute('tabindex', '-1');
    dialog.setAttribute('aria-modal', 'true');
    dialog.addEventListener('close', () => restaurarFoco(dialog));
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) fecharDialogo(dialog);
    });
    dialog.addEventListener('keydown', (event) => manterFocoNoDialogo(event, dialog));
    dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
        button.addEventListener('click', () => fecharDialogo(dialog));
    });
}


export function criarBotaoFecharDialogo(label) {
    const button = criarElemento('button', {
        className: 'dialog-close-button',
        attrs: { type: 'button', 'aria-label': label },
        dataset: { dialogClose: 'true' }
    });
    button.appendChild(criarIcone('x'));
    return button;
}
