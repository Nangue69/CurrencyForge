
/* ==========================================================
   CURRENCYFORGE
   SETTINGS.JS

   Preferencias persistentes de la aplicación
========================================================== */

import {
    load,
    save,
    STORAGE_KEYS
} from "./storage.js";

/* ==========================================================
   CONFIGURACIÓN POR DEFECTO
========================================================== */

const DEFAULT_SETTINGS = {

    language: "es",

    theme: "light",

    fromCurrency: "EUR",

    toCurrency: "USD"

};

/* ==========================================================
   CARGAR CONFIGURACIÓN
========================================================== */

export function loadSettings() {

    return {

        language: load(
            STORAGE_KEYS.LANGUAGE,
            DEFAULT_SETTINGS.language
        ),

        theme: load(
            STORAGE_KEYS.THEME,
            DEFAULT_SETTINGS.theme
        ),

        fromCurrency: load(
            STORAGE_KEYS.FROM_CURRENCY,
            DEFAULT_SETTINGS.fromCurrency
        ),

        toCurrency: load(
            STORAGE_KEYS.TO_CURRENCY,
            DEFAULT_SETTINGS.toCurrency
        )

    };

}

/* ==========================================================
   GUARDAR IDIOMA
========================================================== */

export function saveLanguage(language) {

    save(
        STORAGE_KEYS.LANGUAGE,
        language
    );

}

/* ==========================================================
   GUARDAR TEMA
========================================================== */

export function saveTheme(theme) {

    save(
        STORAGE_KEYS.THEME,
        theme
    );

}

/* ==========================================================
   GUARDAR MONEDAS
========================================================== */

export function saveSelectedCurrencies(
    fromCurrency,
    toCurrency
) {

    save(
        STORAGE_KEYS.FROM_CURRENCY,
        fromCurrency
    );

    save(
        STORAGE_KEYS.TO_CURRENCY,
        toCurrency
    );

}

/* ==========================================================
   RESTAURAR VALORES POR DEFECTO
========================================================== */

export function getDefaultSettings() {

    return {
        ...DEFAULT_SETTINGS
    };

}