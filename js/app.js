/* ==========================================================
   CURRENCYFORGE
   APP.JS

   Coordinación general de la aplicación
========================================================== */

import DOM from "./dom.js";

import {
    CURRENCIES
} from "./currencies.js";

import {
    loadSettings,
    saveSelectedCurrencies
} from "./settings.js";

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
    renderCurrencyOptions,
    refreshCurrencyOptions,
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
    lastConversion: null
};

/* ==========================================================
   CARGAR TASAS
========================================================== */

async function loadRates({
    forceRefresh = false,
    showSuccessMessage = false
} = {}) {
    setLoadingState(
        DOM,
        true
    );

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
        setLoadingState(
            DOM,
            false
        );
    }
}

/* ==========================================================
   CONVERSIÓN
========================================================== */

async function handleConversion() {
    clearFeedback(DOM);
    clearAmountError(DOM);

    const amount = DOM.amountInput.value;
    const fromCurrency = DOM.fromCurrency.value;
    const toCurrency = DOM.toCurrency.value;

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
        const ratesAvailable = await loadRates();

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
        const message = translate(
            result.errorKey
        );

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

    renderHistory(
        DOM,
        history
    );

    saveSelectedCurrencies(
        fromCurrency,
        toCurrency
    );
}

/* ==========================================================
   INTERCAMBIAR MONEDAS
========================================================== */

function handleCurrencySwap() {
    const currentFrom =
        DOM.fromCurrency.value;

    const currentTo =
        DOM.toCurrency.value;

    DOM.fromCurrency.value =
        currentTo;

    DOM.toCurrency.value =
        currentFrom;

    saveSelectedCurrencies(
        DOM.fromCurrency.value,
        DOM.toCurrency.value
    );

    clearFeedback(DOM);
    clearAmountError(DOM);
    hideConversionResult(DOM);
}

/* ==========================================================
   GUARDAR MONEDAS SELECCIONADAS
========================================================== */

function handleCurrencySelectionChange() {
    saveSelectedCurrencies(
        DOM.fromCurrency.value,
        DOM.toCurrency.value
    );

    clearFeedback(DOM);
    hideConversionResult(DOM);
}

/* ==========================================================
   IDIOMA
========================================================== */

function handleLanguageChange() {
    const language =
        setLanguage(
            DOM.languageSelector.value
        );

    DOM.languageSelector.value =
        language;

    refreshCurrencyOptions(
        DOM,
        CURRENCIES
    );

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
    const history =
        clearHistory();

    renderHistory(
        DOM,
        history
    );

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

    DOM.fromCurrency.addEventListener(
        "change",
        handleCurrencySelectionChange
    );

    DOM.toCurrency.addEventListener(
        "change",
        handleCurrencySelectionChange
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
    const settings =
        loadSettings();

    DOM.languageSelector.value =
        settings.language;

    translatePage(
        settings.language
    );

    renderCurrencyOptions(
        DOM,
        CURRENCIES,
        settings.fromCurrency,
        settings.toCurrency
    );

    const theme =
        applyTheme(
            settings.theme
        );

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
    const history =
        loadHistory();

    renderHistory(
        DOM,
        history
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