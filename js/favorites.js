/* ==========================================================
   CURRENCYFORGE
   FAVORITES.JS

   Gestión persistente de monedas favoritas
========================================================== */

import {
    load,
    save,
    STORAGE_KEYS
} from "./storage.js";

/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const MAX_FAVORITES = 5;

/* ==========================================================
   CARGAR FAVORITOS
========================================================== */

export function loadFavorites() {
    const favorites = load(
        STORAGE_KEYS.FAVORITES,
        []
    );

    if (!Array.isArray(favorites)) {
        return [];
    }

    return favorites.filter(
        (code) => typeof code === "string"
    );
}

/* ==========================================================
   GUARDAR FAVORITOS
========================================================== */

function saveFavorites(favorites) {
    save(
        STORAGE_KEYS.FAVORITES,
        favorites
    );
}

/* ==========================================================
   COMPROBAR FAVORITO
========================================================== */

export function isFavorite(currencyCode) {
    return loadFavorites().includes(
        currencyCode
    );
}

/* ==========================================================
   ALTERNAR FAVORITO
========================================================== */

export function toggleFavorite(currencyCode) {
    const favorites = loadFavorites();

    if (favorites.includes(currencyCode)) {
        const updatedFavorites =
            favorites.filter(
                (code) => code !== currencyCode
            );

        saveFavorites(updatedFavorites);

        return {
            success: true,
            isFavorite: false,
            favorites: updatedFavorites
        };
    }

    if (favorites.length >= MAX_FAVORITES) {
        return {
            success: false,
            isFavorite: false,
            favorites,
            errorKey: "messages.favoriteLimit"
        };
    }

    const updatedFavorites = [
        ...favorites,
        currencyCode
    ];

    saveFavorites(updatedFavorites);

    return {
        success: true,
        isFavorite: true,
        favorites: updatedFavorites
    };
}

/* ==========================================================
   ORDENAR MONEDAS
========================================================== */

export function sortCurrenciesByFavorites(
    currencies,
    favorites = loadFavorites()
) {
    const favoriteSet =
        new Set(favorites);

    const favoriteCurrencies =
        currencies.filter(
            (currency) =>
                favoriteSet.has(currency.code)
        );

    const remainingCurrencies =
        currencies.filter(
            (currency) =>
                !favoriteSet.has(currency.code)
        );

    return [
        ...favoriteCurrencies,
        ...remainingCurrencies
    ];
}

/* ==========================================================
   CONSTANTES PÚBLICAS
========================================================== */

export {
    MAX_FAVORITES
};