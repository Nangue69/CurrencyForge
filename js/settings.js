
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
            "currencyforge-from-currency",
            DEFAULT_SETTINGS.fromCurrency
        ),

        toCurrency: load(
            "currencyforge-to-currency",
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
        "currencyforge-from-currency",
        fromCurrency
    );

    save(
        "currencyforge-to-currency",
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