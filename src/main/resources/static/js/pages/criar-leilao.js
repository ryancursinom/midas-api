import { exigirAutenticacao } from '../components/privatePageGuard.js';
import { sincronizarCampoMarca } from '../components/catalogConfig.js';
import { limparElemento, criarElemento } from '../components/dom.js';
import { criarIcone } from '../components/icons.js';
import { limparErroCampo, focarPrimeiroCampoInvalido, definirErroCampo, validarNumeroPositivo, validarCampoObrigatorio } from '../components/formValidation.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { criarLeilao, obterLeilaoPorId, atualizarLeilao } from '../services/auctionService.js';
import { atualizarProduto, criarProduto, enviarImagemProduto, obterCategorias, obterEstadosFisicos, obterRaridades, removerProduto } from '../services/productService.js';
import { traduzir } from '../services/i18n.js';
import { aplicarFallbackImagem } from '../components/image.js';
import { preencherSelectComOpcoes } from '../components/selectOptions.js';


if (!exigirAutenticacao()) throw new Error('Redirecionando para o login.');
const form = document.getElementById('create-auction-form');
const status = document.getElementById('create-auction-status');
const title = document.getElementById('create-auction-title');
const submitButton = document.getElementById('auction-submit-button');
const editId = new URLSearchParams(window.location.search).get('id');
const buyNowField = document.getElementById('auction-buy-now-field');
const customEndField = document.getElementById('auction-custom-end-field');
const brandField = document.getElementById('auction-brand-field');
const imagePreview = document.getElementById('auction-images-preview');

let existingImageUrls = [];
let selectedImages = [];
let auctionEditing = null;

const fields = {
    name: document.getElementById('auction-name'),
    category: document.getElementById('auction-category'),
    description: document.getElementById('auction-description'),
    saleType: document.getElementById('auction-sale-type'),
    value: document.getElementById('auction-value'),
    buyNowValue: document.getElementById('auction-buy-now-value'),
    duration: document.getElementById('auction-duration'),
    endDate: document.getElementById('auction-end-date'),
    condition: document.getElementById('auction-condition'),
    rarity: document.getElementById('auction-rarity'),
    brand: document.getElementById('auction-brand'),
    images: document.getElementById('auction-images')
};

function verificarCompraImediataAtivada() {
    return fields.saleType.value === 'AUCTION_WITH_BUY_NOW';
}

function atualizarCamposTipoVenda() {
    buyNowField.hidden = !verificarCompraImediataAtivada();
    if (!verificarCompraImediataAtivada()) {
        fields.buyNowValue.value = '';
        limparErroCampo(fields.buyNowValue);
    }
}

function atualizarCamposDuracao() {
    const custom = fields.duration.value === 'custom';
    customEndField.hidden = !custom;
    fields.endDate.disabled = !custom;
    fields.endDate.required = custom;
    if (!custom) limparErroCampo(fields.endDate);
}

function obterTextoOpcao(select) {
    return select.selectedOptions[0]?.textContent?.trim() || '';
}

function atualizarCampoMarca() {
    sincronizarCampoMarca(obterTextoOpcao(fields.category), brandField, fields.brand);
}

function revogarUrlImagemSelecionada(image) {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

function removerImagemSelecionada(index) {
    revogarUrlImagemSelecionada(selectedImages[index]);
    selectedImages.splice(index, 1);
    renderizarPreviasImagens();
}

function criarCardPrevia(src, label, onRemove, number) {
    const card = criarElemento('figure', { className: 'image-preview-card' });
    const image = criarElemento('img', { attrs: { src, alt: label } });
    aplicarFallbackImagem(image, '../assets/img/item-default.svg');
    card.appendChild(image);
    if (onRemove) {
        const button = criarElemento('button', {
            className: 'btn-danger image-preview-remove', text: traduzir('Remover'),
            attrs: { type: 'button', 'aria-label': traduzir('Remover imagem {number}', { number }) }
        });
        button.prepend(criarIcone('trash'));
        button.addEventListener('click', onRemove);
        card.appendChild(button);
    }
    return card;
}

function renderizarPreviasImagens() {
    limparElemento(imagePreview);
    let number = 1;
    existingImageUrls.forEach((url) => {
        imagePreview.appendChild(criarCardPrevia(url, traduzir('Imagem atual {number} do leilão', { number }), null, number++));
    });
    selectedImages.forEach((image, index) => {
        imagePreview.appendChild(criarCardPrevia(
            image.previewUrl, traduzir('Prévia da nova imagem {number}', { number }),
            () => removerImagemSelecionada(index), number++
        ));
    });
    imagePreview.hidden = number === 1;
}

function adicionarImagensSelecionadas(files) {
    const knownFiles = new Set(selectedImages.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`));
    [...files].forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024 || knownFiles.has(key)) return;
        selectedImages.push({ file, previewUrl: URL.createObjectURL(file) });
        knownFiles.add(key);
    });
}

function atualizarSelecaoImagens() {
    limparErroCampo(fields.images);
    adicionarImagensSelecionadas(fields.images.files);
    fields.images.value = '';
    renderizarPreviasImagens();
}

function validarImagens() {
    const valid = Boolean(editId) || existingImageUrls.length + selectedImages.length > 0;
    if (!valid) definirErroCampo(fields.images, traduzir('Selecione pelo menos uma imagem do item para continuar.'));
    else limparErroCampo(fields.images);
    return valid;
}

function validarCompraImediata() {
    if (!verificarCompraImediataAtivada()) return true;
    const startingBid = Number(fields.value.value);
    const buyNowPrice = Number(fields.buyNowValue.value);
    const valid = Number.isFinite(buyNowPrice) && buyNowPrice > startingBid;
    if (!valid) definirErroCampo(fields.buyNowValue, traduzir('O valor de Compra Imediata deve ser maior que o valor inicial.'));
    else limparErroCampo(fields.buyNowValue);
    return valid;
}

function validarDataEncerramento() {
    if (fields.duration.value !== 'custom') return true;
    const time = new Date(fields.endDate.value).getTime();
    const valid = Boolean(fields.endDate.value) && time > Date.now();
    if (!valid) definirErroCampo(fields.endDate, traduzir('Escolha uma data e hora futuras para o encerramento.'));
    else limparErroCampo(fields.endDate);
    return valid;
}

function validarFormularioLeilao() {
    const checks = [
        validarCampoObrigatorio(fields.name, traduzir('Nome do item')),
        validarCampoObrigatorio(fields.category, traduzir('Categoria')),
        validarCampoObrigatorio(fields.description, traduzir('Descrição')),
        validarNumeroPositivo(fields.value, traduzir('Valor inicial'), 0),
        validarCompraImediata(), validarDataEncerramento(),
        validarCampoObrigatorio(fields.condition, traduzir('Condição do Item')),
        validarCampoObrigatorio(fields.rarity, traduzir('Raridade')),
        validarImagens()
    ];
    if (checks.includes(false)) focarPrimeiroCampoInvalido(form);
    return checks.every(Boolean);
}

function formatarLocalDateTime(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
}

function calcularDataEncerramento() {
    if (fields.duration.value === 'custom') return formatarLocalDateTime(new Date(fields.endDate.value));
    return formatarLocalDateTime(new Date(Date.now() + Number(fields.duration.value) * 60 * 60 * 1000));
}

function montarDadosProduto(atualizacao = false) {
    const base = {
        nome: fields.name.value.trim(),
        resumoDescricao: fields.description.value.trim(),
        marca: fields.brand.value.trim() || null,
        lanceMinimo: Number(fields.value.value)
    };
    if (atualizacao) {
        return { ...base, categoria: Number(fields.category.value), estadoFisico: Number(fields.condition.value), raridade: Number(fields.rarity.value) };
    }
    return { ...base, categoriaId: Number(fields.category.value), estadoFisicoId: Number(fields.condition.value), raridadeId: Number(fields.rarity.value) };
}

function montarDadosLeilao(produtoId, atualizacao = false) {
    const dados = {
        dataInicio: editId && auctionEditing?.startsAt ? auctionEditing.startsAt : formatarLocalDateTime(new Date()),
        dataFim: calcularDataEncerramento(),
        tipoCompra: verificarCompraImediataAtivada() ? 'AMBOS' : 'LEILAO',
        valorCompraImediata: verificarCompraImediataAtivada() ? Number(fields.buyNowValue.value) : null
    };
    if (!atualizacao) dados.produtoId = produtoId;
    return dados;
}

async function enviarImagens(produtoId) {
    for (const image of selectedImages) await enviarImagemProduto(produtoId, image.file);
}

async function criarNovoLeilao() {
    let produto = null;
    try {
        produto = await criarProduto(montarDadosProduto(false));
        await enviarImagens(produto.id);
        return await criarLeilao(montarDadosLeilao(produto.id));
    } catch (error) {
        if (produto?.id) {
            try { await removerProduto(produto.id); } catch { /* limpeza de melhor esforço */ }
        }
        throw error;
    }
}

async function salvarEdicao() {
    await atualizarProduto(auctionEditing.productId, montarDadosProduto(true));
    await enviarImagens(auctionEditing.productId);
    return atualizarLeilao(editId, montarDadosLeilao(auctionEditing.productId, true));
}

async function salvarLeilao(event) {
    event.preventDefault();
    if (!validarFormularioLeilao()) return;
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir(editId ? 'Salvando alterações...' : 'Publicando item...'));
    try {
        if (editId) await salvarEdicao();
        else await criarNovoLeilao();
        definirMensagemAoVivo(status, traduzir(editId ? 'Leilão atualizado com sucesso.' : 'Item publicado com sucesso.'));
        window.setTimeout(() => { window.location.href = 'meus-leiloes.html?aba=criados'; }, 500);
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos salvar este leilão agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

function converterParaDataHoraLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}


async function carregarOpcoesFormulario() {
    const [categorias, estados, raridades] = await Promise.all([
        obterCategorias(),
        obterEstadosFisicos(),
        obterRaridades()
    ]);

    const opcoesPorId = {
        placeholder: traduzir('Selecione'),
        placeholderValue: '',
        obterValor: (item) => item.id,
        obterRotulo: (item) => item.nome
    };

    preencherSelectComOpcoes(fields.category, categorias, opcoesPorId);
    preencherSelectComOpcoes(fields.condition, estados, opcoesPorId);
    preencherSelectComOpcoes(fields.rarity, raridades, opcoesPorId);
}

function preencherFormularioEdicao(auction) {
    auctionEditing = auction;
    fields.name.value = auction.title || '';
    fields.category.value = auction.categoryId || '';
    fields.description.value = auction.description || '';
    fields.value.value = auction.startingBid || '';
    fields.condition.value = auction.conditionId || '';
    fields.rarity.value = auction.rarityId || '';
    fields.brand.value = auction.brand || '';
    fields.saleType.value = auction.buyNowPrice ? 'AUCTION_WITH_BUY_NOW' : 'AUCTION';
    fields.buyNowValue.value = auction.buyNowPrice || '';
    fields.duration.value = 'custom';
    fields.endDate.value = converterParaDataHoraLocal(auction.endsAt);
    existingImageUrls = auction.imageUrls || [];
    renderizarPreviasImagens();
    atualizarCamposTipoVenda();
    atualizarCamposDuracao();
    atualizarCampoMarca();
    title.textContent = traduzir('Editar Leilão');
    submitButton.textContent = traduzir('Salvar alterações');
}

async function inicializarPagina() {
    definirMensagemAoVivo(status, traduzir('Carregando opções do formulário...'));
    try {
        await carregarOpcoesFormulario();
        if (editId) {
            const auction = await obterLeilaoPorId(editId);
            const statusLeilao = String(auction.status).toUpperCase();
            const podeEditar = statusLeilao === 'AGUARDANDO'
                || (['ATIVO', 'ACTIVE', 'OPEN'].includes(statusLeilao) && Number(auction.bidCount || 0) === 0);
            if (!podeEditar) {
                throw new Error(traduzir('Este leilão já recebeu lances ou foi encerrado e não pode mais ser editado.'));
            }
            preencherFormularioEdicao(auction);
        }
        definirMensagemAoVivo(status, '');
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos preparar o formulário agora.')), true);
        submitButton.disabled = true;
    }
}

function liberarPreviasImagens() {
    selectedImages.forEach(revogarUrlImagemSelecionada);
    selectedImages = [];
}

Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => limparErroCampo(field));
    field.addEventListener('change', () => limparErroCampo(field));
});
fields.saleType.addEventListener('change', atualizarCamposTipoVenda);
fields.duration.addEventListener('change', atualizarCamposDuracao);
fields.category.addEventListener('change', atualizarCampoMarca);
fields.images.addEventListener('change', atualizarSelecaoImagens);
form.addEventListener('submit', salvarLeilao);
window.addEventListener('pagehide', liberarPreviasImagens);
atualizarCamposTipoVenda();
atualizarCamposDuracao();
inicializarPagina();
