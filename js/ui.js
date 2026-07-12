/* ==========================================================
   CURRENCYFORGE
   UI.JS

   Renderizado y actualización de la interfaz
========================================================== */

import {
    getCurrencyByCode,
    getCurrencyLabel,
    getCurrencyName
} from "./currencies.js";

import {
    getCurrentLanguage,
    translate
} from "./i18n.js";

/* ==========================================================
   RENDERIZAR SELECTORES DE MONEDAS
========================================================== */

export function renderCurrencyOptions(
    DOM,
    currencies,
    selectedFrom = "EUR",
    selectedTo = "USD"
) {
    const language = getCurrentLanguage();

    DOM.fromCurrency.replaceChildren();
    DOM.toCurrency.replaceChildren();

    currencies.forEach((currency) => {
        const fromOption = document.createElement("option");
        const toOption = document.createElement("option");

        const label = getCurrencyLabel(
            currency,
            language
        );

        fromOption.value = currency.code;
        fromOption.textContent = label;
        fromOption.selected = currency.code === selectedFrom;

        toOption.value = currency.code;
        toOption.textContent = label;
        toOption.selected = currency.code === selectedTo;

        DOM.fromCurrency.appendChild(fromOption);
        DOM.toCurrency.appendChild(toOption);
    });
}

/* ==========================================================
   ACTUALIZAR SELECTORES AL CAMBIAR IDIOMA
========================================================== */

export function refreshCurrencyOptions(
    DOM,
    currencies
) {
    renderCurrencyOptions(
        DOM,
        currencies,
        DOM.fromCurrency.value,
        DOM.toCurrency.value
    );
}

/* ==========================================================
   MOSTRAR MENSAJES
========================================================== */

export function showFeedback(
    DOM,
    message,
    type = "info"
) {
    DOM.feedback.textContent = message;

    DOM.feedback.dataset.type = type;

    DOM.feedback.classList.add("feedback--visible");
}

export function clearFeedback(DOM) {
    DOM.feedback.textContent = "";
    DOM.feedback.removeAttribute("data-type");
    DOM.feedback.classList.remove("feedback--visible");
}

/* ==========================================================
   VALIDACIÓN DE CANTIDAD
========================================================== */

export function showAmountError(
    DOM,
    message
) {
    DOM.amountError.textContent = message;
    DOM.amountInput.setAttribute("aria-invalid", "true");
}

export function clearAmountError(DOM) {
    DOM.amountError.textContent = "";
    DOM.amountInput.removeAttribute("aria-invalid");
}

/* ==========================================================
   ESTADO DE CARGA
========================================================== */

export function setLoadingState(
    DOM,
    isLoading
) {
    DOM.convertButton.disabled = isLoading;
    DOM.swapCurrencies.disabled = isLoading;
    DOM.fromCurrency.disabled = isLoading;
    DOM.toCurrency.disabled = isLoading;
    DOM.amountInput.disabled = isLoading;

    DOM.convertButton.setAttribute(
        "aria-busy",
        String(isLoading)
    );

    DOM.convertButton.textContent = isLoading
        ? translate("messages.loadingRates")
        : translate("buttons.convert");
}

/* ==========================================================
   MOSTRAR RESULTADO
========================================================== */

export function renderConversionResult(
    DOM,
    conversion
) {
    const {
        amount,
        from,
        to,
        result,
        unitRate,
        updatedAt,
        isOffline
    } = conversion;

    const language = getCurrentLanguage();

    const fromCurrency = getCurrencyByCode(from);
    const toCurrency = getCurrencyByCode(to);

    if (!fromCurrency || !toCurrency) {
        return;
    }

    const amountFormatter = new Intl.NumberFormat(
        language === "es" ? "es-ES" : "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

    const rateFormatter = new Intl.NumberFormat(
        language === "es" ? "es-ES" : "en-US",
        {
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        }
    );

    DOM.resultMain.textContent =
        `${amountFormatter.format(amount)} ${from} = `
        + `${amountFormatter.format(result)} ${to}`;

    DOM.resultRoute.textContent =
        `${fromCurrency.flag} `
        + `${getCurrencyName(fromCurrency, language)} `
        + `→ `
        + `${toCurrency.flag} `
        + `${getCurrencyName(toCurrency, language)}`;

    DOM.resultRate.textContent =
        `1 ${from} = `
        + `${rateFormatter.format(unitRate)} ${to}`;

    DOM.resultUpdated.textContent =
        `${translate("result.updated")}: `
        + formatDateTime(
            updatedAt,
            language
        );

    DOM.resultSource.textContent =
        translate("result.source");

    DOM.resultPanel.hidden = false;

    if (isOffline) {
        showFeedback(
            DOM,
            translate("result.offline"),
            "warning"
        );
    }
}

/* ==========================================================
   OCULTAR RESULTADO
========================================================== */

export function hideConversionResult(DOM) {
    DOM.resultPanel.hidden = true;
}

/* ==========================================================
   HISTORIAL
========================================================== */

export function renderHistory(
    DOM,
    history
) {
    const language = getCurrentLanguage();

    DOM.historyList.replaceChildren();

    DOM.historyCount.textContent =
        String(history.length);

    DOM.historyCount.setAttribute(
        "aria-label",
        translate("history.countLabel")
    );

    const hasHistory = history.length > 0;

    DOM.historyEmpty.hidden = hasHistory;
    DOM.clearHistory.hidden = !hasHistory;

    if (!hasHistory) {
        return;
    }

    history.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.classList.add("history__item");

        const mainText = document.createElement("p");
        mainText.classList.add("history__main");

        const amountFormatter = new Intl.NumberFormat(
            language === "es" ? "es-ES" : "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

        mainText.textContent =
            `${amountFormatter.format(item.amount)} `
            + `${item.from} → `
            + `${amountFormatter.format(item.result)} `
            + `${item.to}`;

        const rateText = document.createElement("p");
        rateText.classList.add("history__rate");

        const rateFormatter = new Intl.NumberFormat(
            language === "es" ? "es-ES" : "en-US",
            {
                minimumFractionDigits: 4,
                maximumFractionDigits: 6
            }
        );

        rateText.textContent =
            `1 ${item.from} = `
            + `${rateFormatter.format(item.unitRate)} `
            + `${item.to}`;

        const dateText = document.createElement("time");
        dateText.classList.add("history__date");

        dateText.dateTime = item.createdAt;

        dateText.textContent = formatDateTime(
            item.createdAt,
            language
        );

        listItem.appendChild(mainText);
        listItem.appendChild(rateText);
        listItem.appendChild(dateText);

        DOM.historyList.appendChild(listItem);
    });
}

/* ==========================================================
   BOTÓN DE TEMA
========================================================== */

export function updateThemeButton(
    DOM,
    icon,
    label
) {
    DOM.themeToggle.textContent = icon;
    DOM.themeToggle.setAttribute(
        "aria-label",
        label
    );
}

/* ==========================================================
   FORMATEAR FECHA
========================================================== */

function formatDateTime(
    dateValue,
    language
) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        language === "es" ? "es-ES" : "en-GB",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC"
        }
    ).format(date);
}