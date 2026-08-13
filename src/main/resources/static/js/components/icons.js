const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = {
    accessibility: [
        ['circle', { cx: 12, cy: 4, r: 2 }],
        ['path', { d: 'M5 8h14' }],
        ['path', { d: 'M12 6v6' }],
        ['path', { d: 'm8 21 4-9 4 9' }],
        ['path', { d: 'm7 13 5-1 5 1' }]
    ],
    cart: [
        ['circle', { cx: 9, cy: 20, r: 1 }],
        ['circle', { cx: 19, cy: 20, r: 1 }],
        ['path', { d: 'M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6' }]
    ],
    user: [
        ['circle', { cx: 12, cy: 8, r: 4 }],
        ['path', { d: 'M4 21a8 8 0 0 1 16 0' }]
    ],
    heart: [['path', { d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8a5.5 5.5 0 0 0 1-8.8Z' }]],
    pencil: [
        ['path', { d: 'M12 20h9' }],
        ['path', { d: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' }]
    ],
    star: [['path', { d: 'm12 2 3.1 6.3 7 .9-5 4.9 1.2 6.9-6.3-3.3L5.7 21l1.2-6.9-5-4.9 7-.9Z' }]],
    x: [
        ['path', { d: 'M18 6 6 18' }],
        ['path', { d: 'm6 6 12 12' }]
    ],
    check: [['path', { d: 'm5 12 4 4L19 6' }]],
    checkCircle: [
        ['circle', { cx: 12, cy: 12, r: 9 }],
        ['path', { d: 'm8 12 2.5 2.5L16 9' }]
    ],
    clock: [
        ['circle', { cx: 12, cy: 12, r: 9 }],
        ['path', { d: 'M12 7v5l3 2' }]
    ],
    users: [
        ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
        ['circle', { cx: 9, cy: 7, r: 4 }],
        ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.9' }],
        ['path', { d: 'M16 3.1a4 4 0 0 1 0 7.8' }]
    ],
    trendingUp: [
        ['path', { d: 'm3 17 6-6 4 4 8-8' }],
        ['path', { d: 'M15 7h6v6' }]
    ],
    scale: [
        ['path', { d: 'm16 16 3-8 3 8a5 5 0 0 1-6 0Z' }],
        ['path', { d: 'm2 16 3-8 3 8a5 5 0 0 1-6 0Z' }],
        ['path', { d: 'M7 21h10' }],
        ['path', { d: 'M12 3v18' }],
        ['path', { d: 'M3 7h18' }]
    ],
    banknote: [
        ['rect', { x: 2.5, y: 6, width: 19, height: 12, rx: 1.5 }],
        ['circle', { cx: 12, cy: 12, r: 2.5 }],
        ['path', { d: 'M6 9.5a2 2 0 0 1-2 2' }],
        ['path', { d: 'M18 14.5a2 2 0 0 1 2-2' }]
    ],
    home: [
        ['path', { d: 'm3 11 9-8 9 8' }],
        ['path', { d: 'M5 10v10h14V10' }],
        ['path', { d: 'M9 20v-6h6v6' }]
    ],
    globe: [
        ['circle', { cx: 12, cy: 12, r: 9 }],
        ['path', { d: 'M3 12h18' }],
        ['path', { d: 'M12 3a14 14 0 0 1 0 18' }],
        ['path', { d: 'M12 3a14 14 0 0 0 0 18' }]
    ],
    settings: [
        ['circle', { cx: 12, cy: 12, r: 3 }],
        ['path', { d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z' }]
    ],
    encerrarSessao: [
        ['path', { d: 'M10 17l5-5-5-5' }],
        ['path', { d: 'M15 12H3' }],
        ['path', { d: 'M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5' }]
    ],
    instagram: [
        ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 5 }],
        ['circle', { cx: 12, cy: 12, r: 4 }],
        ['circle', { cx: 17.5, cy: 6.5, r: 1, fill: 'currentColor', stroke: 'none' }]
    ],
    facebook: [
        ['path', { d: 'M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9a1 1 0 0 1 1-1Z' }]
    ],
    mail: [
        ['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }],
        ['path', { d: 'm3 7 9 6 9-6' }]
    ],
    chevronLeft: [['path', { d: 'm15 18-6-6 6-6' }]],
    chevronRight: [['path', { d: 'm9 18 6-6-6-6' }]],
    upload: [
        ['path', { d: 'M12 16V4' }],
        ['path', { d: 'm7 9 5-5 5 5' }],
        ['path', { d: 'M5 20h14' }]
    ],
    image: [
        ['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }],
        ['circle', { cx: 9, cy: 10, r: 2 }],
        ['path', { d: 'm21 15-5-5L5 20' }]
    ],
    trash: [
        ['path', { d: 'M3 6h18' }],
        ['path', { d: 'M8 6V4h8v2' }],
        ['path', { d: 'm19 6-1 15H6L5 6' }],
        ['path', { d: 'M10 11v5' }],
        ['path', { d: 'M14 11v5' }]
    ],
    coins: [
        ['ellipse', { cx: 8, cy: 8, rx: 5, ry: 3 }],
        ['path', { d: 'M3 8v4c0 1.7 2.2 3 5 3 1.2 0 2.3-.2 3.1-.6' }],
        ['ellipse', { cx: 16, cy: 14, rx: 5, ry: 3 }],
        ['path', { d: 'M11 14v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4' }]
    ],

    shirt: [
        ['path', { d: 'M8 4 4 6l-2 5 4 2v8h12v-8l4-2-2-5-4-2a4 4 0 0 1-8 0Z' }]
    ],
    mug: [
        ['path', { d: 'M5 6h11v12H7a2 2 0 0 1-2-2Z' }],
        ['path', { d: 'M16 9h2a3 3 0 0 1 0 6h-2' }],
        ['path', { d: 'M8 2v2' }],
        ['path', { d: 'M12 2v2' }]
    ],
    poster: [
        ['rect', { x: 4, y: 3, width: 16, height: 18, rx: 2 }],
        ['path', { d: 'm7 16 3-4 3 3 2-2 2 3' }],
        ['circle', { cx: 9, cy: 8, r: 1.5 }]
    ],
    package: [
        ['path', { d: 'm12 3 8 4-8 4-8-4Z' }],
        ['path', { d: 'm4 7 8 4 8-4v10l-8 4-8-4Z' }],
        ['path', { d: 'M12 11v10' }]
    ],
    search: [
        ['circle', { cx: 11, cy: 11, r: 7 }],
        ['path', { d: 'm20 20-4-4' }]
    ],
    filter: [
        ['path', { d: 'M4 6h16' }],
        ['path', { d: 'M7 12h10' }],
        ['path', { d: 'M10 18h4' }]
    ],
    rotateCcw: [
        ['path', { d: 'M3 12a9 9 0 1 0 3-6.7' }],
        ['path', { d: 'M3 4v6h6' }]
    ]
};

function definirAtributos(element, attributes) {
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
}

export function criarIcone(name, options = {}) {
    const icon = document.createElementNS(SVG_NS, 'svg');
    const { size = 22, className = '', filled = false, label = '' } = options;
    definirAtributos(icon, {
        viewBox: '0 0 24 24', width: size, height: size,
        fill: filled ? 'currentColor' : 'none', stroke: 'currentColor',
        'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        focusable: 'false'
    });
    if (className) icon.setAttribute('class', className);
    if (label) {
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', label);
    } else {
        icon.setAttribute('aria-hidden', 'true');
    }
    (ICONS[name] || ICONS.check).forEach(([tag, attrs]) => {
        const child = document.createElementNS(SVG_NS, tag);
        definirAtributos(child, attrs);
        icon.appendChild(child);
    });
    return icon;
}

export function renderizarIconesEstaticos(root = document) {
    root.querySelectorAll('[data-icon]').forEach((slot) => {
        if (slot.querySelector('svg')) return;
        slot.appendChild(criarIcone(slot.dataset.icon, {
            size: Number(slot.dataset.iconSize || 22),
            filled: slot.dataset.iconFilled === 'true'
        }));
    });
}
