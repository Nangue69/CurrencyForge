/* ==========================================================
   CURRENCYFORGE
   STORAGE.JS

   Gestión centralizada del LocalStorage
========================================================== */

/* ==========================================================
   CLAVES DE ALMACENAMIENTO
========================================================== */

const STORAGE_KEYS = {

    LANGUAGE: "currencyforge-language",

    THEME: "currencyforge-theme",

    HISTORY: "currencyforge-history",

    FAVORITES: "currencyforge-favorites",

    LAST_RATES: "currencyforge-last-rates",

    LAST_UPDATE: "currencyforge-last-update"

};

/* ==========================================================
   GUARDAR
========================================================== */

export function save(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.error(
            "Storage save error:",
            error
        );

    }

}

/* ==========================================================
   LEER
========================================================== */

export function load(key, defaultValue = null) {

    try {

        const value = localStorage.getItem(key);

        if (value === null) {

            return defaultValue;

        }

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "Storage load error:",
            error
        );

        return defaultValue;

    }

}

/* ==========================================================
   ELIMINAR
========================================================== */

export function remove(key) {

    localStorage.removeItem(key);

}

/* ==========================================================
   LIMPIAR TODO
========================================================== */

export function clear() {

    localStorage.clear();

}

/* ==========================================================
   EXPORTAR CLAVES
========================================================== */

export {

    STORAGE_KEYS

};