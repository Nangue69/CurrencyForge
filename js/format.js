/* ==========================================================
   CURRENCYFORGE
   FORMAT.JS

   Utilidades centralizadas de formato
========================================================== */

import {
    getCurrentLanguage
} from "./i18n.js";

/* ==========================================================
   OBTENER CONFIGURACIÓN REGIONAL
========================================================== */

function getLocale(
    language = getCurrentLanguage()
) {
    return language === "es"
        ? "es-ES"
        : "en-US";
}

/* ==========================================================
   FORMATEAR CANTIDADES Y RESULTADOS
========================================================== */

export function formatNumber(
    value,
    language = getCurrentLanguage()
) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    const absoluteValue = Math.abs(number);

    let minimumFractionDigits = 2;
    let maximumFractionDigits = 2;

    if (
        absoluteValue > 0
        && absoluteValue < 0.0001
    ) {
        minimumFractionDigits = 2;
        maximumFractionDigits = 8;

    } else if (
        absoluteValue > 0
        && absoluteValue < 0.01
    ) {
        minimumFractionDigits = 2;
        maximumFractionDigits = 6;

    } else if (
        absoluteValue > 0
        && absoluteValue < 1
    ) {
        minimumFractionDigits = 2;
        maximumFractionDigits = 4;
    }

    return new Intl.NumberFormat(
        getLocale(language),
        {
            minimumFractionDigits,
            maximumFractionDigits
        }
    ).format(number);
}

/* ==========================================================
   FORMATEAR TASAS UNITARIAS
========================================================== */

export function formatRate(
    value,
    language = getCurrentLanguage()
) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return new Intl.NumberFormat(
        getLocale(language),
        {
            minimumFractionDigits: 4,
            maximumFractionDigits: 8
        }
    ).format(number);
}