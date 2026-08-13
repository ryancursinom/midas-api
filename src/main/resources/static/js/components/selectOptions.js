import { criarElemento, limparElemento } from './dom.js';

function normalizarOpcoes(itens) {
    if (Array.isArray(itens)) return itens;
    if (Array.isArray(itens?.content)) return itens.content;
    if (Array.isArray(itens?.items)) return itens.items;
    return [];
}

export function preencherSelectComOpcoes(select, itens, {
    placeholder = 'Todos',
    placeholderValue = 'all',
    obterValor = (item) => item.nome,
    obterRotulo = (item) => item.nome
} = {}) {
    if (!select) return;

    const valorAnterior = select.value;
    const fragmento = document.createDocumentFragment();
    fragmento.appendChild(criarElemento('option', {
        text: placeholder,
        attrs: { value: placeholderValue }
    }));

    const opcoesOrdenadas = [...normalizarOpcoes(itens)].sort((a, b) =>
        String(obterRotulo(a) || '').localeCompare(String(obterRotulo(b) || ''), 'pt-BR')
    );

    opcoesOrdenadas.forEach((item) => {
        fragmento.appendChild(criarElemento('option', {
            text: obterRotulo(item),
            attrs: { value: obterValor(item) }
        }));
    });

    limparElemento(select);
    select.appendChild(fragmento);

    if ([...select.options].some((option) => option.value === valorAnterior)) {
        select.value = valorAnterior;
    }
}
