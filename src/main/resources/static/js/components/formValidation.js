import { formatarMoeda } from './dom.js';
import { validarTelefoneBrasileiro } from './phone.js';
import { traduzir } from '../services/i18n.js';

export function definirErroCampo(field, message) {
    const errorId = field.getAttribute('aria-describedby');
    const ids = String(errorId || '').split(/\s+/).filter(Boolean);
    const errorElement = ids.map((id) => document.getElementById(id)).find((element) => element?.classList.contains('field-error'));
    field.setAttribute('aria-invalid', 'true');
    if (errorElement) errorElement.textContent = message;
}

export function limparErroCampo(field) {
    const errorId = field.getAttribute('aria-describedby');
    const ids = String(errorId || '').split(/\s+/).filter(Boolean);
    const errorElement = ids.map((id) => document.getElementById(id)).find((element) => element?.classList.contains('field-error'));
    field.removeAttribute('aria-invalid');
    if (errorElement) errorElement.textContent = '';
}

export function validarCampoObrigatorio(field, label) {
    const isValid = Boolean(String(field.value || '').trim());
    if (!isValid) definirErroCampo(field, traduzir('{label} é obrigatório.', { label: traduzir(label) }));
    else limparErroCampo(field);
    return isValid;
}

export function validarEmail(field) {
    const value = field.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValid) definirErroCampo(field, traduzir('Informe um e-mail válido.'));
    else limparErroCampo(field);
    return isValid;
}

export function validarCampoTelefoneBrasileiro(field) {
    const isValid = validarTelefoneBrasileiro(field.value);
    if (!isValid) definirErroCampo(field, traduzir('Informe um telefone válido com DDD.'));
    else limparErroCampo(field);
    return isValid;
}

export function validarNumeroPositivo(field, label, minimum = 0) {
    const value = Number(field.value);
    const isValid = Number.isFinite(value) && value > minimum;
    if (!isValid) {
        definirErroCampo(field, traduzir('{label} deve ser maior que {minimum}.', {
            label: traduzir(label), minimum: minimum > 0 ? formatarMoeda(minimum) : minimum
        }));
    } else limparErroCampo(field);
    return isValid;
}

export function validarSenha(field, minimumLength = 8) {
    const isValid = field.value.length >= minimumLength;
    if (!isValid) definirErroCampo(field, traduzir('A senha deve ter pelo menos {minimumLength} caracteres.', { minimumLength }));
    else limparErroCampo(field);
    return isValid;
}

export function focarPrimeiroCampoInvalido(form) {
    form.querySelector('[aria-invalid="true"]')?.focus();
}
