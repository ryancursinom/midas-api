import { obterLocalidadeAtual, traduzir } from '../services/i18n.js';

export function criarElemento(tag, options = {}) {
    const element = document.createElement(tag);
    const { className, text, attrs = {}, dataset = {} } = options;
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    Object.entries(attrs).forEach(([name, value]) => {
        if (value !== undefined && value !== null) element.setAttribute(name, String(value));
    });
    Object.entries(dataset).forEach(([name, value]) => {
        if (value !== undefined && value !== null) element.dataset[name] = String(value);
    });
    return element;
}

export function limparElemento(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

export function adicionarElementosFilhos(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
}

export function formatarMoeda(value) {
    return new Intl.NumberFormat(obterLocalidadeAtual(), {
        style: 'currency', currency: 'BRL'
    }).format(Number(value || 0));
}

export function formatarDataHora(value) {
    if (!value) return traduzir('Data não informada');
    return new Intl.DateTimeFormat(obterLocalidadeAtual(), {
        dateStyle: 'medium', timeStyle: 'short'
    }).format(new Date(value));
}
