/* ==========================================================
   CURRENCYFORGE
   APP.JS

   Coordinación general de la aplicación
========================================================== */

import DOM from "./dom.js";

import {
    CURRENCIES,
    getCurrencyName,
    getCurrencyFlagPath
} from "./currencies.js";

import {
    createForgeSelect
} from "./components/forge-select.js";

import {
    loadSettings,
    saveSelectedCurrencies
} from "./settings.js";

import {
    loadFavorites,
    isFavorite,
    toggleFavorite,
    sortCurrenciesByFavorites
} from "./favorites.js";

import {
    applyTheme,
    getCurrentTheme,
    getThemeIcon,
    getThemeLabelKey,
    toggleTheme
} from "./theme.js";

import {
    getCurrentLanguage,
    setLanguage,
    translate,
    translatePage
} from "./i18n.js";

import {
    showFeedback,
    clearFeedback,
    showAmountError,
    clearAmountError,
    setLoadingState,
    renderConversionResult,
    hideConversionResult,
    renderHistory,
    updateThemeButton
} from "./ui.js";

import {
    getExchangeRates
} from "./api.js";

import {
    convertCurrency,
    createConversionRecord
} from "./converter.js";

import {
    loadHistory,
    addConversionToHistory,
    clearHistory
} from "./history.js";

/* ==========================================================
   ESTADO DE LA APLICACIÓN
========================================================== */

const appState = {
    rates: null,
    updatedAt: null,
    isOffline: false,
    lastConversion: null,

    fromSelect: null,
    toSelect: null
};

const LANGUAGE_FLAGS = {
    es: "./img/flags/es.svg",
    en: "./img/flags/gb.svg"
};

function updateLanguageFlag(language) {
    const languageFlag = document.getElementById(
        "language-flag"
    );

    if (!languageFlag) {
        return;
    }

    languageFlag.src =
        LANGUAGE_FLAGS[language] ??
        LANGUAGE_FLAGS.es;
}

/* ==========================================================
   CONTENIDO VISUAL DE LAS MONEDAS
========================================================== */

function createCurrencyContent(currency) {

    const language = getCurrentLanguage();

    const wrapper = document.createElement("span");

    wrapper.classList.add(
        "currency-option"
    );

    /* ==============================
       BANDERA
    ============================== */

    const flag = document.createElement("img");

    flag.classList.add(
        "currency-option__flag"
    );

    flag.src =
        getCurrencyFlagPath(currency);

    flag.alt = "";

    flag.loading = "lazy";
    flag.decoding = "async";

    flag.setAttribute(
        "aria-hidden",
        "true"
    );

    /* ==============================
       INFORMACIÓN
    ============================== */

    const information =
        document.createElement("span");

    information.classList.add(
        "currency-option__information"
    );

    const code =
        document.createElement("strong");

    code.classList.add(
        "currency-option__code"
    );

    code.textContent =
        currency.code;

    const name =
        document.createElement("span");

    name.classList.add(
        "currency-option__name"
    );

    name.textContent =
        getCurrencyName(
            currency,
            language
        );

    information.appendChild(code);
    information.appendChild(name);

    /* ==============================
       SÍMBOLO
    ============================== */

    const symbol =
        document.createElement("span");

    symbol.classList.add(
        "currency-option__symbol"
    );

    symbol.textContent =
        currency.symbol;

    /* ==============================
       ENSAMBLAR
    ============================== */

    wrapper.appendChild(flag);
    wrapper.appendChild(information);
    wrapper.appendChild(symbol);

    return wrapper;

}

function createCurrencyOptionContent(currency) {

    const wrapper = document.createElement("span");

    wrapper.classList.add(
        "currency-option-wrapper"
    );

    const content =
        createCurrencyContent(currency);

    const favoriteButton =
        document.createElement("button");

    const favorite =
        isFavorite(currency.code);

    favoriteButton.type = "button";

    favoriteButton.classList.add(
        "currency-option__favorite"
    );

    favoriteButton.dataset.forgeAction =
        "favorite";

    favoriteButton.dataset.currencyCode =
        currency.code;

    favoriteButton.textContent =
        favorite ? "★" : "☆";

    favoriteButton.setAttribute(
        "aria-pressed",
        String(favorite)
    );

    favoriteButton.setAttribute(
        "aria-label",
        translate(
            favorite
                ? "favorites.remove"
                : "favorites.add",
            {
                currency: currency.code
            }
        )
    );

    favoriteButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            const result =
                toggleFavorite(currency.code);

            if (!result.success) {

                showFeedback(
                    DOM,
                    translate(result.errorKey),
                    "warning"
                );

                return;

            }

            clearFeedback(DOM);

            refreshCurrencySelectorsAfterFavoriteChange(
                result.favorites
            );

        }
    );

    wrapper.appendChild(content);
    wrapper.appendChild(favoriteButton);

    return wrapper;

}


function getCurrencySearchText(currency) {
    return [
        currency.code,
        currency.symbol,
        currency.names.es,
        currency.names.en,
        currency.region,
        ...(currency.searchTerms || [])
    ].join(" ");
}

function refreshCurrencySelectorsAfterFavoriteChange(
    favorites
) {
    const fromCurrency =
        appState.fromSelect.getValue();

    const toCurrency =
        appState.toSelect.getValue();

    const currencies =
        sortCurrenciesByFavorites(
            CURRENCIES,
            favorites
        );

    appState.fromSelect.setItems(currencies);
    appState.toSelect.setItems(currencies);

    appState.fromSelect.setValue(fromCurrency);
    appState.toSelect.setValue(toCurrency);
}

/* ==========================================================
   CREAR FORGE SELECTS
========================================================== */

function initializeCurrencySelectors(settings) {

    const favorites = loadFavorites();

    const currencies = sortCurrenciesByFavorites(
        CURRENCIES,
        favorites
    );

    appState.fromSelect = createForgeSelect({
        root: DOM.fromCurrencyRoot,
        items: currencies,
        value: settings.fromCurrency,

        placeholder:
            translate("converter.selectPlaceholder"),

        searchPlaceholder:
            translate("converter.searchPlaceholder"),

        emptyMessage:
            translate("converter.noResults"),

        getValue: (currency) => currency.code,

        getLabel: (currency) =>
            `${currency.code} — `
            + getCurrencyName(
                currency,
                getCurrentLanguage()
            ),

        getSearchText: getCurrencySearchText,

        renderSelected: createCurrencyContent,
        renderOption: createCurrencyOptionContent,

        onChange: handleCurrencySelectionChange
    });

    appState.toSelect = createForgeSelect({
        root: DOM.toCurrencyRoot,
        items: currencies,
        value: settings.toCurrency,

        placeholder:
            translate("converter.selectPlaceholder"),

        searchPlaceholder:
            translate("converter.searchPlaceholder"),

        emptyMessage:
            translate("converter.noResults"),

        getValue: (currency) => currency.code,

        getLabel: (currency) =>
            `${currency.code} — `
            + getCurrencyName(
                currency,
                getCurrentLanguage()
            ),

        getSearchText: getCurrencySearchText,

        renderSelected: createCurrencyContent,
        renderOption: createCurrencyOptionContent,

        onChange: handleCurrencySelectionChange
    });
}

/* ==========================================================
   CARGAR TASAS
========================================================== */

async function loadRates({
    forceRefresh = false,
    showSuccessMessage = false
} = {}) {
    setLoadingState(DOM, true);
    clearFeedback(DOM);

    showFeedback(
        DOM,
        translate("messages.loadingRates"),
        "info"
    );

    try {
        const rateData = await getExchangeRates({
            forceRefresh
        });

        appState.rates = rateData.rates;
        appState.updatedAt = rateData.updatedAt;
        appState.isOffline = rateData.isOffline;

        if (rateData.isOffline) {
            showFeedback(
                DOM,
                translate("messages.offlineRates"),
                "warning"
            );

        } else if (showSuccessMessage) {
            showFeedback(
                DOM,
                translate("messages.ratesLoaded"),
                "success"
            );

        } else {
            clearFeedback(DOM);
        }

        return true;

    } catch (error) {
        console.error(
            "CurrencyForge rates error:",
            error
        );

        showFeedback(
            DOM,
            translate("messages.noStoredRates"),
            "error"
        );

        return false;

    } finally {
        setLoadingState(DOM, false);
    }
}

/* ==========================================================
   CONVERSIÓN
========================================================== */

async function handleConversion() {
    clearFeedback(DOM);
    clearAmountError(DOM);

    const amount = DOM.amountInput.value;

    const fromCurrency =
        appState.fromSelect.getValue();

    const toCurrency =
        appState.toSelect.getValue();

    if (
        !amount
        || !Number.isFinite(Number(amount))
        || Number(amount) <= 0
    ) {
        showAmountError(
            DOM,
            translate("messages.invalidAmount")
        );

        hideConversionResult(DOM);
        return;
    }

    if (!appState.rates) {
        const ratesAvailable =
            await loadRates();

        if (!ratesAvailable) {
            hideConversionResult(DOM);
            return;
        }
    }

    const result = convertCurrency({
        amount,
        fromCurrency,
        toCurrency,
        rates: appState.rates
    });

    if (!result.success) {
        const message =
            translate(result.errorKey);

        if (
            result.errorKey
            === "messages.invalidAmount"
        ) {
            showAmountError(
                DOM,
                message
            );

        } else {
            showFeedback(
                DOM,
                message,
                "error"
            );
        }

        hideConversionResult(DOM);
        return;
    }

    const conversionRecord =
        createConversionRecord(
            result.conversion,
            appState.updatedAt,
            appState.isOffline
        );

    appState.lastConversion =
        conversionRecord;

    renderConversionResult(
        DOM,
        conversionRecord
    );

    const history =
        addConversionToHistory(
            conversionRecord
        );

    renderHistory(DOM, history);

    saveSelectedCurrencies(
        fromCurrency,
        toCurrency
    );
}

/* ==========================================================
   INTERCAMBIAR MONEDAS
========================================================== */

/* ==========================================================
   INTERCAMBIAR MONEDAS
========================================================== */

function handleCurrencySwap() {
    const currentFrom =
        appState.fromSelect.getValue();

    const currentTo =
        appState.toSelect.getValue();

    DOM.swapCurrencies.classList.remove(
        "swap-button--animating"
    );

    DOM.fromCurrencyRoot.classList.remove(
        "currency-select-root--swap-left"
    );

    DOM.toCurrencyRoot.classList.remove(
        "currency-select-root--swap-right"
    );

    /*
     * Fuerza al navegador a reiniciar la animación,
     * incluso al pulsar varias veces seguidas.
     */
    void DOM.swapCurrencies.offsetWidth;

    DOM.swapCurrencies.classList.add(
        "swap-button--animating"
    );

    DOM.fromCurrencyRoot.classList.add(
        "currency-select-root--swap-left"
    );

    DOM.toCurrencyRoot.classList.add(
        "currency-select-root--swap-right"
    );

    appState.fromSelect.setValue(currentTo);
    appState.toSelect.setValue(currentFrom);

    saveSelectedCurrencies(
        currentTo,
        currentFrom
    );

    clearFeedback(DOM);
    clearAmountError(DOM);
    hideConversionResult(DOM);
}

/* ==========================================================
   CAMBIO DE MONEDAS
========================================================== */

function handleCurrencySelectionChange() {
    saveSelectedCurrencies(
        appState.fromSelect.getValue(),
        appState.toSelect.getValue()
    );

    clearFeedback(DOM);
    clearAmountError(DOM);
    hideConversionResult(DOM);
}

/* ==========================================================
   IDIOMA
========================================================== */

function refreshForgeSelectLanguage() {
    const configuration = {
        nextPlaceholder:
            translate("converter.selectPlaceholder"),

        nextSearchPlaceholder:
            translate("converter.searchPlaceholder"),

        nextEmptyMessage:
            translate("converter.noResults")
    };

    const favorites = loadFavorites();

    const currencies =
        sortCurrenciesByFavorites(
            CURRENCIES,
            favorites
        );

    appState.fromSelect.setItems(currencies);
    appState.toSelect.setItems(currencies);

    appState.fromSelect.refresh(configuration);
    appState.toSelect.refresh(configuration);
}

function handleLanguageChange() {
    const language = setLanguage(
        DOM.languageSelector.value
    );

    DOM.languageSelector.value = language;

    updateLanguageFlag(language);

    refreshForgeSelectLanguage();

    renderHistory(
        DOM,
        loadHistory()
    );

    updateCurrentThemeButton();

    if (appState.lastConversion) {
        renderConversionResult(
            DOM,
            appState.lastConversion
        );
    }

    clearFeedback(DOM);
}

/* ==========================================================
   TEMA
========================================================== */

function updateCurrentThemeButton() {
    const theme =
        document.documentElement.dataset.theme
        || getCurrentTheme();

    updateThemeButton(
        DOM,
        getThemeIcon(theme),
        translate(
            getThemeLabelKey(theme)
        )
    );
}

function handleThemeToggle() {
    toggleTheme();
    updateCurrentThemeButton();
}

/* ==========================================================
   HISTORIAL
========================================================== */

function handleClearHistory() {
    const history = clearHistory();

    renderHistory(DOM, history);

    DOM.history.open = false;

    showFeedback(
        DOM,
        translate("messages.historyCleared"),
        "success"
    );
}

/* ==========================================================
   EVENTOS
========================================================== */

function addEvents() {
    DOM.converterForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            handleConversion();
        }
    );

    DOM.swapCurrencies.addEventListener(
        "click",
        handleCurrencySwap
    );

    DOM.swapCurrencies.addEventListener(
        "animationend",
        () => {
            DOM.swapCurrencies.classList.remove(
                "swap-button--animating"
            );
        }
    );

    DOM.fromCurrencyRoot.addEventListener(
        "animationend",
        () => {
            DOM.fromCurrencyRoot.classList.remove(
                "currency-select-root--swap-left"
            );
        }
    );

    DOM.toCurrencyRoot.addEventListener(
        "animationend",
        () => {
            DOM.toCurrencyRoot.classList.remove(
                "currency-select-root--swap-right"
            );
        }
    );

    DOM.languageSelector.addEventListener(
        "change",
        handleLanguageChange
    );

    DOM.themeToggle.addEventListener(
        "click",
        handleThemeToggle
    );

    DOM.clearHistory.addEventListener(
        "click",
        handleClearHistory
    );

    DOM.amountInput.addEventListener(
        "input",
        () => {
            clearAmountError(DOM);
            clearFeedback(DOM);
        }
    );

    window.addEventListener(
        "online",
        async () => {
            await loadRates({
                forceRefresh: true,
                showSuccessMessage: true
            });
        }
    );

    window.addEventListener(
        "offline",
        () => {
            appState.isOffline = true;

            showFeedback(
                DOM,
                translate("messages.offlineRates"),
                "warning"
            );
        }
    );
}

/* ==========================================================
   INICIALIZAR CONFIGURACIÓN
========================================================== */

function initializeSettings() {
    const settings = loadSettings();

    DOM.languageSelector.value =
        settings.language;

    updateLanguageFlag(settings.language);

    translatePage(settings.language);

    initializeCurrencySelectors(settings);

    const theme =
        applyTheme(settings.theme);

    updateThemeButton(
        DOM,
        getThemeIcon(theme),
        translate(
            getThemeLabelKey(theme)
        )
    );
}

/* ==========================================================
   INICIALIZAR HISTORIAL
========================================================== */

function initializeHistory() {
    renderHistory(
        DOM,
        loadHistory()
    );

    DOM.history.open = false;
}

/* ==========================================================
   INICIALIZAR APLICACIÓN
========================================================== */

async function init() {
    initializeSettings();
    initializeHistory();
    addEvents();
    hideConversionResult(DOM);

    await loadRates();
}

init();