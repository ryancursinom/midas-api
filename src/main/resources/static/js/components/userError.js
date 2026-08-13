import { traduzir } from '../services/i18n.js';

export class UserFacingError extends Error {
    constructor(message, status = 0, details = null) {
        super(message);
        this.name = 'UserFacingError';
        this.status = status;
        this.details = details;
        this.userFacing = true;
    }
}

export function obterMensagemErroUsuario(error, fallback = 'Não conseguimos concluir esta ação agora. Tente novamente em instantes.') {
    if (error?.userFacing && error.message) return error.message;
    return traduzir(fallback);
}
