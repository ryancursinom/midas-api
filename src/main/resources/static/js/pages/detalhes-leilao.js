import { limparElemento, criarElemento, formatarMoeda, formatarDataHora } from '../components/dom.js';
import { limparErroCampo, validarNumeroPositivo } from '../components/formValidation.js';
import { fecharDialogo, inicializarDialogo, abrirDialogo } from '../components/modal.js';
import { renderizarEstado, definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { formatarTelefoneBrasileiro, obterDigitosTelefone } from '../components/phone.js';
import { obterLeilaoPorId, obterHistoricoLances, enviarLance } from '../services/auctionService.js';
import { obterPerfil } from '../services/userService.js';
import { normalizarColecao } from '../services/api.js';
import { traduzir } from '../services/i18n.js';
import { verificarLeilaoAtivo, verificarLeilaoEncerrado, verificarLeilaoFinalizado } from '../components/auctionStatus.js';
import { aplicarFallbackImagem } from '../components/image.js';

const params = new URLSearchParams(window.location.search);
const auctionId = params.get('id');
const state = document.getElementById('details-state');
const content = document.getElementById('details-content');
const bidSection = document.getElementById('bid-section');
const bidForm = document.getElementById('bid-form');
const bidInput = document.getElementById('bid-amount');
const bidMinimumHelp = document.getElementById('bid-minimum-help');
const actionStatus = document.getElementById('details-action-status');
const bidHistory = document.getElementById('bid-history');
const confirmDialog = document.getElementById('bid-confirm-dialog');
const confirmMessage = document.getElementById('bid-confirm-message');
const confirmButton = document.getElementById('bid-confirm-button');
const buyNowContainer = document.getElementById('buy-now-action');
const buyNowInfo = document.getElementById('details-buy-now-info');
const buyNowDialog = document.getElementById('buy-now-confirm-dialog');
const buyNowMessage = document.getElementById('buy-now-confirm-message');
const buyNowConfirmButton = document.getElementById('buy-now-confirm-button');
const ownerReadOnlyMessage = document.getElementById('owner-read-only-message');
const winnerSection = document.getElementById('auction-winner-section');
const winnerContact = document.getElementById('auction-winner-contact');
const withoutWinnerMessage = document.getElementById('auction-without-winner');

let auction = null;
let pendingBid = null;
let countdownTimer = null;
let ownerView = false;

function definirTexto(id, value, fallback = 'Não informado') {
    const element = document.getElementById(id);
    if (element) element.textContent = value || traduzir(fallback);
}

function renderizarImagens(item) {
    const image = document.getElementById('details-main-image');
    const gallery = document.getElementById('details-image-gallery');
    const fallbackSrc = '../assets/img/item-default.svg';
    const urls = Array.isArray(item.imageUrls) ? item.imageUrls.filter(Boolean) : [];
    if (!urls.length && item.imageUrl) urls.push(item.imageUrl);
    if (!urls.length) urls.push(fallbackSrc);

    aplicarFallbackImagem(image, fallbackSrc);

    const selecionarImagem = (url, index) => {
        image.dataset.fallbackAplicado = 'false';
        image.src = url;
        image.alt = traduzir('Imagem {number} de {title}', { number: index + 1, title: item.title });
        gallery.querySelectorAll('button').forEach((button, buttonIndex) => {
            button.setAttribute('aria-pressed', String(buttonIndex === index));
        });
    };

    limparElemento(gallery);
    urls.forEach((url, index) => {
        const button = criarElemento('button', {
            className: 'details-thumbnail',
            attrs: {
                type: 'button',
                'aria-label': traduzir('Ver imagem {number} de {title}', { number: index + 1, title: item.title }),
                'aria-pressed': String(index === 0)
            }
        });
        const thumbnail = criarElemento('img', {
            attrs: { src: url, alt: '', loading: 'lazy', decoding: 'async' }
        });
        aplicarFallbackImagem(thumbnail, fallbackSrc);
        button.appendChild(thumbnail);
        button.addEventListener('click', () => selecionarImagem(url, index));
        gallery.appendChild(button);
    });

    selecionarImagem(urls[0], 0);
    gallery.hidden = urls.length <= 1;
}

function formatarContagemRegressiva(endsAt) {
    const remaining = new Date(endsAt).getTime() - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return traduzir('Leilão encerrado');

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return traduzir('Encerra em {days}d {hours}h {minutes}min {seconds}s', {
        days, hours, minutes, seconds
    });
}

function pararContagemRegressiva() {
    if (!countdownTimer) return;
    window.clearInterval(countdownTimer);
    countdownTimer = null;
}

function atualizarContagemRegressiva() {
    const countdown = document.getElementById('details-countdown');
    if (!auction?.endsAt || !countdown) return;

    const expired = new Date(auction.endsAt).getTime() <= Date.now();
    if (expired && !verificarLeilaoEncerrado(auction.status)) {
        auction.status = 'FINALIZADO';
        definirTexto('details-price-label', traduzir('Lance final'));
        renderizarAcoes(auction);
    }

    countdown.textContent = verificarLeilaoEncerrado(auction.status)
        ? traduzir('Leilão encerrado')
        : formatarContagemRegressiva(auction.endsAt);

    if (expired) pararContagemRegressiva();
}

function iniciarContagemRegressiva(item) {
    pararContagemRegressiva();
    atualizarContagemRegressiva();
    if (!verificarLeilaoEncerrado(item.status) && item.endsAt) {
        countdownTimer = window.setInterval(atualizarContagemRegressiva, 1000);
    }
}

function obterLanceAtual(item) {
    return Number(item.currentBid ?? item.startingBid ?? 0);
}

function atualizarLanceMinimo(item) {
    const currentBid = obterLanceAtual(item);
    bidInput.min = String(currentBid + 0.01);
    bidMinimumHelp.textContent = traduzir('O novo lance deve ser maior que {price}.', {
        price: formatarMoeda(currentBid)
    });
}

function abrirConfirmacaoCompraImediata(item, button) {
    buyNowMessage.textContent = traduzir(
        'Ao continuar com a compra por {price}, você será direcionado ao checkout. O leilão será encerrado assim que o pagamento fictício for confirmado.',
        { price: formatarMoeda(item.buyNowPrice) }
    );
    abrirDialogo(buyNowDialog, button);
}

function criarBotaoCompraImediata(item) {
    const button = criarElemento('button', {
        className: 'btn-primary buy-now-button',
        text: traduzir('Comprar Agora por {price}', { price: formatarMoeda(item.buyNowPrice) }),
        attrs: { type: 'button' }
    });
    button.addEventListener('click', () => abrirConfirmacaoCompraImediata(item, button));
    return button;
}

function renderizarAcoes(item) {
    ownerReadOnlyMessage.hidden = !ownerView;
    const ativo = verificarLeilaoAtivo(item.status);
    if (verificarLeilaoEncerrado(item.status) || ownerView || !ativo) {
        bidSection.hidden = true;
        buyNowInfo.hidden = true;
        buyNowContainer.hidden = true;
        limparElemento(buyNowContainer);
        if (!ownerView && !verificarLeilaoEncerrado(item.status) && !ativo) {
            definirMensagemAoVivo(actionStatus, traduzir('Este leilão ainda não começou. Os lances e a Compra Imediata serão liberados no horário de início.'));
        }
        return;
    }

    definirMensagemAoVivo(actionStatus, '');
    bidSection.hidden = false;
    atualizarLanceMinimo(item);
    limparElemento(buyNowContainer);

    const hasBuyNow = Number(item.buyNowPrice) > 0;
    buyNowContainer.hidden = !hasBuyNow;
    buyNowInfo.hidden = !hasBuyNow;

    if (!hasBuyNow) return;

    buyNowContainer.appendChild(criarBotaoCompraImediata(item));
    buyNowInfo.textContent = traduzir(
        'Compra imediata disponível por {price}. Essa opção encerra o leilão na hora.',
        { price: formatarMoeda(item.buyNowPrice) }
    );
}

function adicionarCampoVencedor(label, value, href = '') {
    if (!value) return;

    const field = criarElemento('div');
    const description = criarElemento('dd');
    const content = href
        ? criarElemento('a', { text: value, attrs: { href } })
        : document.createTextNode(value);

    description.appendChild(content);
    field.append(
        criarElemento('dt', { text: traduzir(label) }),
        description
    );
    winnerContact.appendChild(field);
}

function renderizarVencedor(item) {
    winnerSection.hidden = true;
    withoutWinnerMessage.hidden = true;
    limparElemento(winnerContact);

    if (!ownerView || !verificarLeilaoFinalizado(item.status)) return;

    winnerSection.hidden = false;
    const winner = item.winner;
    const hasWinner = Boolean(winner && (
        winner.id !== undefined || winner.name || winner.email || winner.phone
    ));

    if (!hasWinner) {
        withoutWinnerMessage.hidden = false;
        return;
    }

    const name = String(winner.name || '').trim();
    const email = String(winner.email || '').trim();
    const phoneDigits = obterDigitosTelefone(winner.phone);
    const phone = formatarTelefoneBrasileiro(phoneDigits);

    adicionarCampoVencedor('Nome', name);
    adicionarCampoVencedor('Telefone', phone, phoneDigits ? `tel:${phoneDigits}` : '');
    adicionarCampoVencedor('E-mail', email, email ? `mailto:${email}` : '');
}

function renderizarLeilao(item) {
    renderizarImagens(item);
    definirTexto('details-category', traduzir(item.category));
    definirTexto('details-title', item.title);
    definirTexto('details-description', item.description);
    definirTexto('details-condition', traduzir(item.condition));
    definirTexto('details-rarity', item.rarity ? traduzir(item.rarity) : traduzir('Não informada'));
    definirTexto('details-ends-at', formatarDataHora(item.endsAt));
    definirTexto('details-brand', item.brand || traduzir('Não informada'));
    definirTexto('details-price-label', traduzir(verificarLeilaoEncerrado(item.status) ? 'Lance final' : 'Lance atual'));
    definirTexto('details-price', formatarMoeda(obterLanceAtual(item)));
    renderizarAcoes(item);
    renderizarVencedor(item);
    iniciarContagemRegressiva(item);
    content.hidden = false;
    limparElemento(state);
}

function criarItemHistoricoLance(bid, index, total) {
    const item = criarElemento('article', { className: 'bid-history-item' });
    const info = criarElemento('div', { className: 'bid-history-info' });
    const position = total - index;

    info.append(
        criarElemento('strong', { text: traduzir('Lance #{number}', { number: position }) }),
        criarElemento('time', {
            text: formatarDataHora(bid.createdAt),
            attrs: { datetime: bid.createdAt || '' }
        })
    );

    item.append(
        info,
        criarElemento('strong', {
            className: 'bid-history-value',
            text: formatarMoeda(bid.amount)
        })
    );
    return item;
}

function renderizarHistoricoLances(bids) {
    limparElemento(bidHistory);
    if (!bids.length) {
        renderizarEstado(bidHistory, 'empty', traduzir('Este item ainda não recebeu lances.'));
        return;
    }

    const sorted = [...bids].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    sorted.forEach((bid, index) => {
        bidHistory.appendChild(criarItemHistoricoLance(bid, index, sorted.length));
    });
}

async function carregarHistoricoLances() {
    if (!auctionId) return;
    renderizarEstado(bidHistory, 'loading', traduzir('Carregando histórico de lances...'));

    try {
        renderizarHistoricoLances(normalizarColecao(await obterHistoricoLances(auctionId)));
    } catch (error) {
        renderizarEstado(bidHistory, 'error', obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos carregar o histórico de lances agora. Tente novamente em instantes.')
        ));
    }
}

function validarLance() {
    const valid = validarNumeroPositivo(
        bidInput,
        'O lance',
        obterLanceAtual(auction)
    );
    if (valid) limparErroCampo(bidInput);
    return valid;
}

function solicitarConfirmacaoLance(event) {
    event.preventDefault();
    if (ownerView) return;
    if (!validarLance()) return;

    pendingBid = Number(bidInput.value);
    confirmMessage.textContent = traduzir(
        'Você confirma o lance de {amount} em {title}?',
        { amount: formatarMoeda(pendingBid), title: auction.title }
    );
    abrirDialogo(confirmDialog, bidForm.querySelector('[type="submit"]'));
}

function aplicarAtualizacaoLance(updated) {
    auction = updated?.auction || { ...auction, currentBid: pendingBid };
    definirTexto('details-price', formatarMoeda(obterLanceAtual(auction)));
    atualizarLanceMinimo(auction);
    bidInput.value = '';
}

async function confirmarLance() {
    if (ownerView || !pendingBid) return;

    confirmButton.disabled = true;
    definirMensagemAoVivo(actionStatus, traduzir('Enviando lance...'));

    try {
        aplicarAtualizacaoLance(await enviarLance(auctionId, pendingBid));
        fecharDialogo(confirmDialog);
        definirMensagemAoVivo(actionStatus, traduzir('Lance registrado com sucesso.'));
        await carregarHistoricoLances();
    } catch (error) {
        fecharDialogo(confirmDialog);
        definirMensagemAoVivo(actionStatus, obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos registrar seu lance agora. Confira o valor e tente novamente.')
        ), true);
    } finally {
        pendingBid = null;
        confirmButton.disabled = false;
    }
}

async function confirmarCompraImediata() {
    if (ownerView || !auction?.buyNowPrice) return;

    buyNowConfirmButton.disabled = true;
    definirMensagemAoVivo(actionStatus, traduzir('Confirmando Compra Imediata...'));

    try {
        fecharDialogo(buyNowDialog);
        window.location.href = `checkout.html?auctionId=${encodeURIComponent(auctionId)}&source=buy-now`;
    } catch (error) {
        fecharDialogo(buyNowDialog);
        definirMensagemAoVivo(actionStatus, obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos concluir a Compra Imediata agora. Atualize a página e tente novamente.')
        ), true);
    } finally {
        buyNowConfirmButton.disabled = false;
    }
}

async function verificarSeUsuarioLeiloeiro(item) {
    if (item.ownerId === undefined || item.ownerId === null) return false;

    try {
        const profile = await obterPerfil();
        return String(profile.id) === String(item.ownerId);
    } catch {
        return false;
    }
}

async function carregarVencedorSeNecessario(item) {
    if (!ownerView || !verificarLeilaoFinalizado(item.status)) return item;

    try {
        const bids = normalizarColecao(await obterHistoricoLances(item.id));
        if (!bids.length) return { ...item, winner: null };
        const winningBid = bids.reduce((best, bid) => Number(bid.amount) > Number(best.amount) ? bid : best, bids[0]);
        if (!winningBid.userId) return { ...item, winner: null };
        const profile = await obterPerfil(winningBid.userId);
        return {
            ...item,
            winner: {
                id: profile.id,
                name: profile.nome,
                email: profile.email,
                phone: profile.phone
            }
        };
    } catch {
        return { ...item, winner: null };
    }
}

async function carregarLeilao() {
    if (!auctionId) {
        renderizarEstado(
            state,
            'error',
            traduzir('Não encontramos o item solicitado. Volte ao catálogo e escolha um leilão.')
        );
        return;
    }

    renderizarEstado(state, 'loading', traduzir('Carregando detalhes do item...'));
    try {
        auction = await obterLeilaoPorId(auctionId);
        ownerView = await verificarSeUsuarioLeiloeiro(auction);
        auction = await carregarVencedorSeNecessario(auction);
        renderizarLeilao(auction);
        await carregarHistoricoLances();
    } catch (error) {
        renderizarEstado(state, 'error', obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos carregar os detalhes deste item agora. Tente novamente em instantes.')
        ));
    }
}

inicializarDialogo(confirmDialog);
inicializarDialogo(buyNowDialog);
bidForm.addEventListener('submit', solicitarConfirmacaoLance);
bidInput.addEventListener('input', () => limparErroCampo(bidInput));
confirmButton.addEventListener('click', confirmarLance);
buyNowConfirmButton.addEventListener('click', confirmarCompraImediata);
window.addEventListener('pagehide', pararContagemRegressiva);
carregarLeilao();
