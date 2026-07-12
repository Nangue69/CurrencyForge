/* ==========================================================
   CURRENCYFORGE
   HISTORY.JS

   Gestión del historial de conversiones
========================================================== */

import {
    load,
    save,
    remove,
    STORAGE_KEYS
} from "./storage.js";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const MAX_HISTORY_ITEMS = 10;

/* ==========================================================
   CARGAR HISTORIAL
========================================================== */

export function loadHistory() {
    const history = load(
        STORAGE_KEYS.HISTORY,
        []
    );

    if (!Array.isArray(history)) {
        return [];
    }

    return history;
}

/* ==========================================================
   GUARDAR HISTORIAL
========================================================== */

function saveHistory(history) {
    save(
        STORAGE_KEYS.HISTORY,
        history
    );
}

/* ==========================================================
   AÑADIR CONVERSIÓN
========================================================== */

export function addConversionToHistory(record) {
    if (!isValidRecord(record)) {
        return loadHistory();
    }

    const history = loadHistory();

    const updatedHistory = [
        record,
        ...history
    ].slice(0, MAX_HISTORY_ITEMS);

    saveHistory(updatedHistory);

    return updatedHistory;
}

/* ==========================================================
   ELIMINAR HISTORIAL
========================================================== */

export function clearHistory() {
    remove(
        STORAGE_KEYS.HISTORY
    );

    return [];
}

/* ==========================================================
   VALIDAR REGISTRO
========================================================== */

function isValidRecord(record) {
    return Boolean(
        record
        && typeof record.id === "string"
        && Number.isFinite(record.amount)
        && typeof record.from === "string"
        && typeof record.to === "string"
        && Number.isFinite(record.result)
        && Number.isFinite(record.unitRate)
        && typeof record.createdAt === "string"
    );
}

/* ==========================================================
   OBTENER NÚMERO DE REGISTROS
========================================================== */

export function getHistoryCount() {
    return loadHistory().length;
}

/* ==========================================================
   CONSTANTES PÚBLICAS
========================================================== */

export {
    MAX_HISTORY_ITEMS
};