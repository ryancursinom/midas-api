const MAX_PHONE_DIGITS = 11;

export function obterDigitosTelefone(value) {
    return String(value || '').replace(/\D/g, '');
}

export function validarTelefoneBrasileiro(value) {
    return /^[1-9]{2}\d{8,9}$/.test(obterDigitosTelefone(value));
}

export function formatarTelefoneBrasileiro(value) {
    const digits = obterDigitosTelefone(value).slice(0, MAX_PHONE_DIGITS);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;

    const areaCode = digits.slice(0, 2);
    const localNumber = digits.slice(2);
    const prefixLength = localNumber.length > 8 ? 5 : 4;
    const prefix = localNumber.slice(0, prefixLength);
    const suffix = localNumber.slice(prefixLength);

    return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ''}`;
}

export function aplicarMascaraTelefone(field) {
    field.value = formatarTelefoneBrasileiro(field.value);
}
