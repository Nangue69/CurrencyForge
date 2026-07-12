/* ==========================================================
   CURRENCYFORGE
   CONVERTER.JS

   Validación y cálculo de conversiones monetarias
========================================================== */

import {
    hasRate,
    BASE_CURRENCY
} from "./api.js";

/* ==========================================================
   VALIDAR CANTIDAD
========================================================== */

export function validateAmount(value) {
    const amount = Number(value);

    return (
        Number.isFinite(amount)
        && amount > 0
    );
}

/* ==========================================================
   NORMALIZAR CANTIDAD
========================================================== */

export function normalizeAmount(value) {
    const amount = Number(value);

    if (!validateAmount(amount)) {
        return null;
    }

    return amount;
}

/* ==========================================================
   VALIDAR MONEDAS
========================================================== */

export function validateCurrencySelection(
    fromCurrency,
    toCurrency
) {
    return Boolean(
        fromCurrency
        && toCurrency
        && fromCurrency !== toCurrency
    );
}

/* ==========================================================
   OBTENER TASA RESPECTO AL USD
========================================================== */

function getUsdRate(rates, currencyCode) {
    /*
     * La API usa USD como moneda base.
     * Por tanto, 1 USD siempre equivale a 1 USD.
     */
    if (currencyCode === BASE_CURRENCY) {
        return 1;
    }

    if (!hasRate(rates, currencyCode)) {
        return null;
    }

    return rates[currencyCode];
}

/* ==========================================================
   CALCULAR TASA ENTRE DOS MONEDAS
========================================================== */

export function calculateUnitRate(
    rates,
    fromCurrency,
    toCurrency
) {
    const fromRate = getUsdRate(
        rates,
        fromCurrency
    );

    const toRate = getUsdRate(
        rates,
        toCurrency
    );

    if (
        fromRate === null
        || toRate === null
    ) {
        return null;
    }

    /*
     * Las tasas recibidas expresan cuántas unidades de cada
     * moneda equivalen a 1 USD.
     *
     * Para convertir entre dos monedas:
     *
     * tasa destino / tasa origen
     */
    return toRate / fromRate;
}

/* ==========================================================
   REALIZAR CONVERSIÓN
========================================================== */

export function convertCurrency({
    amount,
    fromCurrency,
    toCurrency,
    rates
}) {
    const normalizedAmount =
        normalizeAmount(amount);

    if (normalizedAmount === null) {
        return {
            success: false,
            errorKey: "messages.invalidAmount"
        };
    }

    if (!fromCurrency || !toCurrency) {
        return {
            success: false,
            errorKey: "messages.missingCurrency"
        };
    }

    if (fromCurrency === toCurrency) {
        return {
            success: false,
            errorKey: "messages.sameCurrency"
        };
    }

    const unitRate = calculateUnitRate(
        rates,
        fromCurrency,
        toCurrency
    );

    if (
        unitRate === null
        || !Number.isFinite(unitRate)
        || unitRate <= 0
    ) {
        return {
            success: false,
            errorKey: "messages.unavailableRate"
        };
    }

    const result =
        normalizedAmount * unitRate;

    if (!Number.isFinite(result)) {
        return {
            success: false,
            errorKey: "messages.conversionError"
        };
    }

    return {
        success: true,
        conversion: {
            amount: normalizedAmount,
            from: fromCurrency,
            to: toCurrency,
            result,
            unitRate
        }
    };
}

/* ==========================================================
   CREAR REGISTRO PARA EL HISTORIAL
========================================================== */

export function createConversionRecord(
    conversion,
    updatedAt,
    isOffline = false
) {
    return {
        id: createRecordId(),

        amount: conversion.amount,

        from: conversion.from,

        to: conversion.to,

        result: conversion.result,

        unitRate: conversion.unitRate,

        updatedAt,

        isOffline,

        createdAt: new Date().toISOString()
    };
}

/* ==========================================================
   CREAR IDENTIFICADOR
========================================================== */

function createRecordId() {
    if (
        "crypto" in globalThis
        && typeof globalThis.crypto.randomUUID === "function"
    ) {
        return globalThis.crypto.randomUUID();
    }

    return (
        Date.now().toString(36)
        + "-"
        + Math.random().toString(36).slice(2)
    );
}