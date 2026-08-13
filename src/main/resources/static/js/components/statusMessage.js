import { criarElemento, limparElemento } from './dom.js';

export function renderizarEstado(container, type, message) {
    limparElemento(container);
    const state = criarElemento('p', {
        className: `${type}-state`,
        text: message,
        attrs: { role: type === 'error' ? 'alert' : 'status' }
    });
    container.appendChild(state);
    return state;
}

export function definirMensagemAoVivo(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('form-status--error', isError);
    element.classList.toggle('form-status--success', !isError && Boolean(message));
}
