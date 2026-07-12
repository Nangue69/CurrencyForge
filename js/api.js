
/* ==========================================================
   CURRENCYFORGE
   API.JS

   Obtención y almacenamiento local de tipos de cambio
========================================================== */

import {
    load,
    save,
    STORAGE_KEYS
} from "./storage.js";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const API_URL =
    "https://cdn.moneyconvert.net/api/latest.json";

const BASE_CURRENCY = "USD";

/*
 * Evita realizar peticiones repetidas si las tasas guardadas
 * tienen menos de cinco minutos.
 */
const CACHE_DURATION_MS = 5 * 60 * 1000;

/* ==========================================================
   VALIDAR RESPUESTA DE LA API
========================================================== */

function isValidApiResponse(data) {
    return Boolean(
        data
        && data.base === BASE_CURRENCY
        && data.rates
        && typeof data.rates === "object"
        && Object.keys(data.rates).length > 0
    );
}

/* ==========================================================
   NORMALIZAR FECHA DE ACTUALIZACIÓN
========================================================== */

function normalizeUpdatedAt(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString();
    }

    return date.toISOString();
}

/* ==========================================================
   GUARDAR TASAS
========================================================== */

function saveRates(rates, updatedAt) {
    save(
        STORAGE_KEYS.LAST_RATES,
        rates
    );

    save(
        STORAGE_KEYS.LAST_UPDATE,
        updatedAt
    );
}

/* ==========================================================
   CARGAR TASAS GUARDADAS
========================================================== */

export function loadStoredRates() {
    const rates = load(
        STORAGE_KEYS.LAST_RATES,
        null
    );

    const updatedAt = load(
        STORAGE_KEYS.LAST_UPDATE,
        null
    );

    if (
        !rates
        || typeof rates !== "object"
        || Object.keys(rates).length === 0
    ) {
        return null;
    }

    return {
        base: BASE_CURRENCY,
        rates,
        updatedAt,
        isOffline: true,
        source: "storage"
    };
}

/* ==========================================================
   COMPROBAR SI LA CACHÉ SIGUE VIGENTE
========================================================== */

function isStoredDataFresh(storedData) {
    if (!storedData?.updatedAt) {
        return false;
    }

    const updatedTime =
        new Date(storedData.updatedAt).getTime();

    if (Number.isNaN(updatedTime)) {
        return false;
    }

    return (
        Date.now() - updatedTime
        < CACHE_DURATION_MS
    );
}

/* ==========================================================
   PETICIÓN A LA API
========================================================== */

async function fetchRatesFromApi() {
    const response = await fetch(
        API_URL,
        {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Exchange rate request failed: ${response.status}`
        );
    }

    const data = await response.json();

    if (!isValidApiResponse(data)) {
        throw new Error(
            "Invalid exchange rate response."
        );
    }

    const updatedAt = normalizeUpdatedAt(
        data.ts
    );

    saveRates(
        data.rates,
        updatedAt
    );

    return {
        base: data.base,
        rates: data.rates,
        updatedAt,
        isOffline: false,
        source: "api"
    };
}

/* ==========================================================
   OBTENER TASAS
========================================================== */

export async function getExchangeRates({
    forceRefresh = false
} = {}) {
    const storedData = loadStoredRates();

    /*
     * Si las tasas guardadas siguen vigentes, se reutilizan
     * para evitar una petición innecesaria.
     */
    if (
        !forceRefresh
        && storedData
        && isStoredDataFresh(storedData)
    ) {
        return {
            ...storedData,
            isOffline: !navigator.onLine,
            source: "fresh-storage"
        };
    }

    try {
        return await fetchRatesFromApi();

    } catch (error) {
        console.error(
            "Exchange rate API error:",
            error
        );

        /*
         * Si la API falla pero existen tasas guardadas,
         * CurrencyForge sigue funcionando en modo offline.
         */
        if (storedData) {
            return {
                ...storedData,
                isOffline: true,
                source: "fallback-storage"
            };
        }

        throw error;
    }
}

/* ==========================================================
   COMPROBAR DISPONIBILIDAD DE UNA TASA
========================================================== */

export function hasRate(rates, currencyCode) {
    return Boolean(
        rates
        && typeof rates[currencyCode] === "number"
        && Number.isFinite(rates[currencyCode])
        && rates[currencyCode] > 0
    );
}

/* ==========================================================
   CONSTANTES PÚBLICAS
========================================================== */

export {
    API_URL,
    BASE_CURRENCY
};