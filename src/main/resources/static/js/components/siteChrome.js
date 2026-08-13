import { adicionarElementosFilhos, criarElemento, limparElemento } from './dom.js';
import { criarIcone } from './icons.js';
import { AUCTION_CATEGORIES } from './catalogConfig.js';
import { obterQuantidadeItensCarrinho } from '../services/cartService.js';
import { traduzir } from '../services/i18n.js';
import { verificarAutenticacao } from '../services/authService.js';

function criarLinkNavegacao(root, page, href, label, currentPage) {
    const link = criarElemento('a', { text: traduzir(label), attrs: { href: `${root}/${href}` } });
    if (page === currentPage) link.setAttribute('aria-current', 'page');
    const item = criarElemento('li');
    item.appendChild(link);
    return item;
}

function criarLogo(root, footer = false) {
    const link = criarElemento('a', {
        className: footer ? 'logo logo--footer' : 'logo',
        attrs: { href: `${root}/index.html`, 'aria-label': traduzir('Ir para a página inicial do Midas') }
    });
    link.appendChild(criarElemento('img', {
        attrs: { src: `${root}/assets/img/logo.png`, alt: 'Midas' }
    }));
    return link;
}

function criarAcoesCabecalho(root) {
    const actions = criarElemento('div', { className: 'header-actions' });
    const initialCount = obterQuantidadeItensCarrinho();
    const cart = criarElemento('a', {
        className: 'header-icon-link',
        attrs: { href: `${root}/html/carrinho.html`, 'aria-label': traduzir('Abrir carrinho, {count} itens', { count: initialCount }) }
    });
    const cartCount = criarElemento('span', {
        className: 'cart-count', text: String(initialCount), attrs: { 'aria-hidden': 'true' }
    });
    cart.append(criarIcone('cart'), cartCount);

    const autenticado = verificarAutenticacao();
    const profile = criarElemento('a', {
        className: 'profile-btn',
        attrs: {
            href: autenticado ? `${root}/html/perfil.html` : `${root}/html/login.html`,
            'aria-label': traduzir(autenticado ? 'Acessar perfil da conta' : 'Entrar na conta')
        }
    });
    profile.appendChild(criarIcone('user'));
    actions.append(cart, profile);
    return actions;
}

function criarConteudoCabecalho() {
    const root = document.body.dataset.root || '..';
    const currentPage = document.body.dataset.page || '';
    const content = criarElemento('div', { className: 'container navbar__content' });
    const nav = criarElemento('nav', { className: 'nav-links', attrs: { 'aria-label': traduzir('Navegação principal') } });
    const list = criarElemento('ul');
    const myAuctionsHref = 'html/meus-leiloes.html';
    list.append(
        criarLinkNavegacao(root, 'home', 'index.html', 'Home', currentPage),
        criarLinkNavegacao(root, 'sobre', 'html/sobre_nos.html', 'Sobre Nós', currentPage),
        criarLinkNavegacao(root, 'catalogo', 'html/catalogo.html', 'Catálogo', currentPage),
        criarLinkNavegacao(root, 'meus-leiloes', myAuctionsHref, 'Meus Leilões', currentPage)
    );
    nav.appendChild(list);
    adicionarElementosFilhos(content, [criarLogo(root), nav, criarAcoesCabecalho(root)]);
    return content;
}

function criarColunaRodape(title, links) {
    const column = criarElemento('section', { className: 'footer__column' });
    const heading = criarElemento('h2', { text: traduzir(title) });
    const list = criarElemento('ul');
    links.forEach(({ label, href }) => {
        const item = criarElemento('li');
        item.appendChild(criarElemento('a', { text: traduzir(label), attrs: { href } }));
        list.appendChild(item);
    });
    column.append(heading, list);
    return column;
}

function criarItemRedeSocial(name, iconName, href = '') {
    if (href) {
        const link = criarElemento('a', {
            className: 'footer-social-link',
            attrs: { href, 'aria-label': name }
        });
        link.appendChild(criarIcone(iconName));
        return link;
    }
    const item = criarElemento('span', {
        className: 'footer-social-link footer-social-link--disabled',
        attrs: { 'aria-label': traduzir('{network} do Midas: link em breve', { network: name }), role: 'img' }
    });
    item.appendChild(criarIcone(iconName));
    return item;
}

function criarMarcaRodape(root) {
    const brand = criarElemento('div', { className: 'footer__brand' });
    const socials = criarElemento('div', { className: 'footer-socials', attrs: { 'aria-label': traduzir('Redes e contato do Midas') } });
    socials.append(
        criarItemRedeSocial('Instagram', 'instagram'),
        criarItemRedeSocial('Facebook', 'facebook'),
        criarItemRedeSocial(traduzir('E-mail'), 'mail', 'mailto:midas.leiloes@gmail.com')
    );
    const feedback = criarElemento('button', {
        className: 'footer-feedback-button', text: traduzir('Avaliar plataforma'),
        attrs: { type: 'button' }, dataset: { openFeedback: 'true' }
    });
    brand.append(criarLogo(root, true), socials, feedback);
    return brand;
}

function criarLinksRodape(root) {
    const links = criarElemento('div', { className: 'footer__links' });
    const quick = [
        { label: 'Criar leilão', href: `${root}/html/criar-leilao.html` },
        { label: 'Loja Oficial Midas', href: `${root}/html/loja-oficial.html` }
    ];
    const categories = AUCTION_CATEGORIES.map((category) => ({
        label: category,
        href: `${root}/html/categoria.html?categoria=${encodeURIComponent(category)}`
    }));
    const account = [
        { label: 'Perfil', href: `${root}/html/perfil.html` },
        { label: 'Configurações', href: `${root}/html/configuracoes.html` },
        { label: 'Meus Leilões', href: `${root}/html/meus-leiloes.html` }
    ];
    links.append(
        criarColunaRodape('Acesso rápido', quick),
        criarColunaRodape('Categorias', categories),
        criarColunaRodape('Conta', account)
    );
    return links;
}

function criarConteudoRodape() {
    const root = document.body.dataset.root || '..';
    const fragment = document.createDocumentFragment();
    const content = criarElemento('div', { className: 'container footer__content' });
    content.append(criarMarcaRodape(root), criarLinksRodape(root));
    const bottom = criarElemento('div', { className: 'footer__bottom' });
    bottom.appendChild(criarElemento('p', { text: traduzir('© 2026 Midas. Todos os direitos reservados.') }));
    fragment.append(content, bottom);
    return fragment;
}

function atualizarContagemCarrinho() {
    const count = document.querySelector('.cart-count');
    if (!count) return;
    const itemCount = obterQuantidadeItensCarrinho();
    count.textContent = String(itemCount);
    count.closest('.header-icon-link')?.setAttribute('aria-label', traduzir('Abrir carrinho, {count} itens', { count: itemCount }));
}

export function inicializarEstruturaSite() {
    const headerSlot = document.querySelector('[data-site-header]');
    const footerSlot = document.querySelector('[data-site-footer]');
    if (headerSlot) {
        limparElemento(headerSlot);
        headerSlot.appendChild(criarConteudoCabecalho());
    }
    if (footerSlot) {
        limparElemento(footerSlot);
        footerSlot.appendChild(criarConteudoRodape());
    }
    window.addEventListener('midas:cart-updated', atualizarContagemCarrinho);
}
