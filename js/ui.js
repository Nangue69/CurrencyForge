/* ==========================================================
   CURRENCYFORGE
   UI.JS

   Renderizado y actualización de la interfaz
========================================================== */

import {
    getCurrencyByCode,
    getCurrencyName,
    getCurrencyFlagPath
} from "./currencies.js";

import {
    getCurrentLanguage,
    translate
} from "./i18n.js";

import {
    formatNumber,
    formatRate
} from "./format.js";

/* ==========================================================
   CREAR BANDERA
========================================================== */

function createCurrencyFlag(
    currency,
    className
) {
    const image = document.createElement("img");

    image.classList.add(className);
    image.src = getCurrencyFlagPath(currency);
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";

    image.setAttribute(
        "aria-hidden",
        "true"
    );

    return image;
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

    DOM.feedback.classList.add(
        "feedback--visible"
    );
}

export function clearFeedback(DOM) {
    DOM.feedback.textContent = "";

    DOM.feedback.removeAttribute(
        "data-type"
    );

    DOM.feedback.classList.remove(
        "feedback--visible"
    );
}

/* ==========================================================
   VALIDACIÓN DE CANTIDAD
========================================================== */

export function showAmountError(
    DOM,
    message
) {
    DOM.amountError.textContent = message;

    DOM.amountInput.setAttribute(
        "aria-invalid",
        "true"
    );
}

export function clearAmountError(DOM) {
    DOM.amountError.textContent = "";

    DOM.amountInput.removeAttribute(
        "aria-invalid"
    );
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

    const language =
        getCurrentLanguage();

    const fromCurrency =
        getCurrencyByCode(from);

    const toCurrency =
        getCurrencyByCode(to);

    if (
        !fromCurrency
        || !toCurrency
    ) {
        return;
    }

    DOM.resultMain.textContent =
        `${formatNumber(amount, language)} ${from} = `
        + `${formatNumber(result, language)} ${to}`;

    renderResultRoute(
        DOM,
        fromCurrency,
        toCurrency,
        language
    );

    DOM.resultRate.textContent =
        `1 ${from} = `
        + `${formatRate(unitRate, language)} ${to}`;

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
   RUTA DEL RESULTADO
========================================================== */

function renderResultRoute(
    DOM,
    fromCurrency,
    toCurrency,
    language
) {
    DOM.resultRoute.replaceChildren();

    const fromFlag = createCurrencyFlag(
        fromCurrency,
        "result__flag"
    );

    const fromName =
        document.createElement("span");

    fromName.textContent =
        getCurrencyName(
            fromCurrency,
            language
        );

    const routeArrow =
        document.createElement("span");

    routeArrow.classList.add(
        "result__arrow"
    );

    routeArrow.textContent = "→";

    routeArrow.setAttribute(
        "aria-hidden",
        "true"
    );

    const toFlag = createCurrencyFlag(
        toCurrency,
        "result__flag"
    );

    const toName =
        document.createElement("span");

    toName.textContent =
        getCurrencyName(
            toCurrency,
            language
        );

    DOM.resultRoute.appendChild(fromFlag);
    DOM.resultRoute.appendChild(fromName);
    DOM.resultRoute.appendChild(routeArrow);
    DOM.resultRoute.appendChild(toFlag);
    DOM.resultRoute.appendChild(toName);
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
    const language =
        getCurrentLanguage();

    DOM.historyList.replaceChildren();

    DOM.historyCount.textContent =
        String(history.length);

    DOM.historyCount.setAttribute(
        "aria-label",
        translate("history.countLabel")
    );

    const hasHistory =
        history.length > 0;

    DOM.historyEmpty.hidden =
        hasHistory;

    DOM.clearHistory.hidden =
        !hasHistory;

    if (!hasHistory) {
        return;
    }

    history.forEach((item) => {
        const listItem =
            createHistoryItem(
                item,
                language
            );

        DOM.historyList.appendChild(
            listItem
        );
    });
}

/* ==========================================================
   CREAR ELEMENTO DEL HISTORIAL
========================================================== */

function createHistoryItem(
    item,
    language
) {
    const listItem =
        document.createElement("li");

    listItem.classList.add(
        "history__item"
    );

    const mainContent =
        createHistoryMainContent(
            item,
            language
        );

    const rateText =
        document.createElement("p");

    rateText.classList.add(
        "history__rate"
    );

    rateText.textContent =
        `1 ${item.from} = `
        + `${formatRate(item.unitRate, language)} `
        + `${item.to}`;

    const dateText =
        document.createElement("time");

    dateText.classList.add(
        "history__date"
    );

    dateText.dateTime =
        item.createdAt;

    dateText.textContent =
        formatDateTime(
            item.createdAt,
            language
        );

    listItem.appendChild(mainContent);
    listItem.appendChild(rateText);
    listItem.appendChild(dateText);

    return listItem;
}

/* ==========================================================
   CONTENIDO PRINCIPAL DEL HISTORIAL
========================================================== */

function createHistoryMainContent(
    item,
    language
) {
    const mainContent =
        document.createElement("div");

    mainContent.classList.add(
        "history__main"
    );

    const fromCurrency =
        getCurrencyByCode(item.from);

    const toCurrency =
        getCurrencyByCode(item.to);

    const fromGroup =
        createHistoryCurrencyGroup({
            currency: fromCurrency,
            value:
                `${formatNumber(
                    item.amount,
                    language
                )} ${item.from}`
        });

    const historyArrow =
        document.createElement("span");

    historyArrow.classList.add(
        "history__arrow"
    );

    historyArrow.textContent = "→";

    historyArrow.setAttribute(
        "aria-hidden",
        "true"
    );

    const toGroup =
        createHistoryCurrencyGroup({
            currency: toCurrency,
            value:
                `${formatNumber(
                    item.result,
                    language
                )} ${item.to}`
        });

    mainContent.appendChild(fromGroup);
    mainContent.appendChild(historyArrow);
    mainContent.appendChild(toGroup);

    return mainContent;
}

/* ==========================================================
   GRUPO DE MONEDA DEL HISTORIAL
========================================================== */

function createHistoryCurrencyGroup({
    currency,
    value
}) {
    const group =
        document.createElement("span");

    group.classList.add(
        "history__currency"
    );

    if (currency) {
        group.appendChild(
            createCurrencyFlag(
                currency,
                "history__flag"
            )
        );
    }

    const valueElement =
        document.createElement("strong");

    valueElement.textContent = value;

    group.appendChild(valueElement);

    return group;
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
    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        language === "es"
            ? "es-ES"
            : "en-GB",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}