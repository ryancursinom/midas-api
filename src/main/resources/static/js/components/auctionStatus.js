const CLOSED_STATUSES = new Set(['CLOSED', 'FINALIZADO', 'ENCERRADO', 'CANCELADO']);
const FINISHED_STATUSES = new Set(['CLOSED', 'FINALIZADO', 'ENCERRADO']);
const ACTIVE_STATUSES = new Set(['ACTIVE', 'OPEN', 'ATIVO']);

function normalizarStatus(status) {
    return String(status || '').toUpperCase();
}

export function verificarLeilaoEncerrado(status) {
    return CLOSED_STATUSES.has(normalizarStatus(status));
}

export function verificarLeilaoFinalizado(status) {
    return FINISHED_STATUSES.has(normalizarStatus(status));
}

export function verificarLeilaoAtivo(status) {
    return ACTIVE_STATUSES.has(normalizarStatus(status));
}

export function obterClasseStatusLeilao(status) {
    const normalized = normalizarStatus(status);
    if (CLOSED_STATUSES.has(normalized)) return 'closed';
    if (ACTIVE_STATUSES.has(normalized)) return 'active';
    return 'pending';
}

export function obterRotuloStatusLeilao(status) {
    const normalized = normalizarStatus(status);
    if (normalized === 'CANCELADO') return 'CANCELADO';
    if (CLOSED_STATUSES.has(normalized)) return 'ENCERRADO';
    if (ACTIVE_STATUSES.has(normalized)) return 'AO VIVO';
    return 'AGUARDANDO';
}
