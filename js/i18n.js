/* ==========================================================
   CURRENCYFORGE
   I18N.JS

   Internacionalización de la aplicación
========================================================== */

import {
    loadSettings,
    saveLanguage
} from "./settings.js";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const DEFAULT_LANGUAGE = "es";

const SUPPORTED_LANGUAGES = [
    "es",
    "en"
];

/* ==========================================================
   TRADUCCIONES
========================================================== */

const TRANSLATIONS = {

    es: {

        meta: {
            title: "CurrencyForge | Conversor de monedas",
            description:
                "Conversor de monedas moderno, responsive y fácil de usar."
        },

        app: {
            title: "CurrencyForge",
            subtitle:
                "Convierte monedas de forma rápida y sencilla."
        },

        controls: {
            languageLabel: "Idioma",
            themeToggle: "Cambiar tema",
            enableLightTheme: "Cambiar a modo claro",
            enableDarkTheme: "Cambiar a modo oscuro"
        },

        converter: {
            amountLabel: "Cantidad",
            fromLabel: "De",
            toLabel: "A",
            fromAria: "Moneda de origen",
            toAria: "Moneda de destino",

            selectPlaceholder: "Seleccionar moneda",
            searchPlaceholder:
                "Buscar por código o nombre...",
            noResults:
                "No se encontraron monedas."
        },

        buttons: {
            convert: "Convertir",
            swap: "Intercambiar monedas"
        },

        favorites: {
            add:
                "Añadir {currency} a favoritos",
            remove:
                "Eliminar {currency} de favoritos"
        },

        result: {
            title: "Resultado",
            updated: "Actualizado",
            source:
                "Tipos de cambio proporcionados por MoneyConvert.net",
            offline:
                "Sin conexión: se están utilizando las últimas tasas guardadas."
        },

        history: {
            title:
                "Historial de conversiones",
            empty:
                "Todavía no hay conversiones guardadas.",
            clear:
                "Vaciar historial",
            countLabel:
                "Número de conversiones guardadas"
        },

        messages: {
            loadingRates:
                "Cargando tipos de cambio...",
            ratesLoaded:
                "Tipos de cambio actualizados.",
            favoriteLimit:
                "Solo puedes guardar hasta 5 monedas favoritas.",
            invalidAmount:
                "Introduce una cantidad válida mayor que cero.",
            missingCurrency:
                "Selecciona una moneda de origen y una moneda de destino.",
            sameCurrency:
                "Selecciona dos monedas diferentes.",
            unavailableRate:
                "No hay una tasa disponible para una de las monedas seleccionadas.",
            conversionError:
                "No se pudo realizar la conversión.",
            apiError:
                "No se pudieron obtener los tipos de cambio.",
            offlineRates:
                "Sin conexión. Se están utilizando las últimas tasas guardadas.",
            noStoredRates:
                "No hay tasas guardadas. Conéctate a Internet para obtenerlas.",
            historyCleared:
                "Historial eliminado."
        },

        footer: {
            privacy:
                "Las conversiones se procesan localmente en tu navegador.",
            rates:
                "Los tipos de cambio pueden variar respecto a los ofrecidos por bancos y proveedores de pago."
        }

    },

    en: {

        meta: {
            title:
                "CurrencyForge | Currency Converter",
            description:
                "A modern, responsive and easy-to-use currency converter."
        },

        app: {
            title: "CurrencyForge",
            subtitle:
                "Convert currencies quickly and easily."
        },

        controls: {
            languageLabel: "Language",
            themeToggle: "Change theme",
            enableLightTheme:
                "Switch to light mode",
            enableDarkTheme:
                "Switch to dark mode"
        },

        converter: {
            amountLabel: "Amount",
            fromLabel: "From",
            toLabel: "To",
            fromAria: "Source currency",
            toAria: "Target currency",

            selectPlaceholder:
                "Select currency",
            searchPlaceholder:
                "Search by code or name...",
            noResults:
                "No currencies found."
        },

        buttons: {
            convert: "Convert",
            swap: "Swap currencies"
        },

        favorites: {
            add:
                "Add {currency} to favorites",
            remove:
                "Remove {currency} from favorites"
        },

        result: {
            title: "Result",
            updated: "Updated",
            source:
                "Exchange rates provided by MoneyConvert.net",
            offline:
                "Offline: using the latest saved exchange rates."
        },

        history: {
            title:
                "Conversion history",
            empty:
                "There are no saved conversions yet.",
            clear:
                "Clear history",
            countLabel:
                "Number of saved conversions"
        },

        messages: {
            loadingRates:
                "Loading exchange rates...",
            ratesLoaded:
                "Exchange rates updated.",
            favoriteLimit:
                "You can save up to 5 favorite currencies.",
            invalidAmount:
                "Enter a valid amount greater than zero.",
            missingCurrency:
                "Select a source currency and a target currency.",
            sameCurrency:
                "Select two different currencies.",
            unavailableRate:
                "A rate is not available for one of the selected currencies.",
            conversionError:
                "The conversion could not be completed.",
            apiError:
                "Exchange rates could not be retrieved.",
            offlineRates:
                "You are offline. The latest saved rates are being used.",
            noStoredRates:
                "No saved rates are available. Connect to the Internet to retrieve them.",
            historyCleared:
                "History cleared."
        },

        footer: {
            privacy:
                "Conversions are processed locally in your browser.",
            rates:
                "Exchange rates may differ from those offered by banks and payment providers."
        }

    }

};

/* ==========================================================
   VALIDAR IDIOMA
========================================================== */

function normalizeLanguage(language) {

    return SUPPORTED_LANGUAGES.includes(language)
        ? language
        : DEFAULT_LANGUAGE;

}

/* ==========================================================
   BUSCAR TRADUCCIÓN ANIDADA
========================================================== */

function getNestedTranslation(
    language,
    key
) {

    return key
        .split(".")
        .reduce(
            (value, currentKey) =>
                value?.[currentKey],
            TRANSLATIONS[language]
        );

}

/* ==========================================================
   OBTENER IDIOMA ACTUAL
========================================================== */

export function getCurrentLanguage() {

    const settings = loadSettings();

    return normalizeLanguage(
        settings.language
    );

}

/* ==========================================================
   CAMBIAR IDIOMA
========================================================== */

export function setLanguage(language) {

    const selectedLanguage =
        normalizeLanguage(language);

    saveLanguage(selectedLanguage);

    translatePage(selectedLanguage);

    return selectedLanguage;

}

/* ==========================================================
   REEMPLAZAR VARIABLES
========================================================== */

function replaceTranslationVariables(
    translation,
    replacements
) {

    return Object
        .entries(replacements)
        .reduce(
            (
                text,
                [name, value]
            ) => {

                return text
                    .split(`{${name}}`)
                    .join(String(value));

            },
            translation
        );

}

/* ==========================================================
   TRADUCIR UNA CLAVE
========================================================== */

export function translate(
    key,
    replacementsOrLanguage = {},
    language = getCurrentLanguage()
) {

    /*
     * Mantiene compatibilidad con llamadas antiguas:
     *
     * translate("meta.title", "en")
     *
     * y permite reemplazos:
     *
     * translate("favorites.add", {
     *     currency: "EUR"
     * })
     */

    const secondArgumentIsLanguage =
        typeof replacementsOrLanguage
        === "string";

    const replacements =
        secondArgumentIsLanguage
            ? {}
            : replacementsOrLanguage;

    const requestedLanguage =
        secondArgumentIsLanguage
            ? replacementsOrLanguage
            : language;

    const selectedLanguage =
        normalizeLanguage(
            requestedLanguage
        );

    const translation =
        getNestedTranslation(
            selectedLanguage,
            key
        )
        || getNestedTranslation(
            DEFAULT_LANGUAGE,
            key
        )
        || key;

    return replaceTranslationVariables(
        translation,
        replacements
    );

}

/* ==========================================================
   TRADUCIR LA PÁGINA
========================================================== */

export function translatePage(
    language = getCurrentLanguage()
) {

    const selectedLanguage =
        normalizeLanguage(language);

    document.documentElement.lang =
        selectedLanguage;

    document
        .querySelectorAll("[data-i18n]")
        .forEach((element) => {

            const key =
                element.dataset.i18n;

            element.textContent =
                translate(
                    key,
                    {},
                    selectedLanguage
                );

        });

    document
        .querySelectorAll(
            "[data-i18n-aria]"
        )
        .forEach((element) => {

            const key =
                element.dataset.i18nAria;

            element.setAttribute(
                "aria-label",
                translate(
                    key,
                    {},
                    selectedLanguage
                )
            );

        });

    document
        .querySelectorAll(
            "[data-i18n-content]"
        )
        .forEach((element) => {

            const key =
                element.dataset.i18nContent;

            element.setAttribute(
                "content",
                translate(
                    key,
                    {},
                    selectedLanguage
                )
            );

        });

    document.title =
        translate(
            "meta.title",
            {},
            selectedLanguage
        );

    return selectedLanguage;

}