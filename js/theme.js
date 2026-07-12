/* ==========================================================
   CURRENCYFORGE
   THEME.JS

   Gestión del tema claro y oscuro
========================================================== */

import {
    loadSettings,
    saveTheme
} from "./settings.js";

/* ==========================================================
   CONSTANTES
========================================================== */

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

/* ==========================================================
   APLICAR TEMA
========================================================== */

export function applyTheme(theme) {

    const selectedTheme = theme === DARK_THEME
        ? DARK_THEME
        : LIGHT_THEME;

    document.documentElement.dataset.theme = selectedTheme;

    return selectedTheme;

}

/* ==========================================================
   OBTENER TEMA ACTUAL
========================================================== */

export function getCurrentTheme() {

    const settings = loadSettings();

    return settings.theme;

}

/* ==========================================================
   CAMBIAR TEMA
========================================================== */

export function toggleTheme() {

    const currentTheme =
        document.documentElement.dataset.theme || LIGHT_THEME;

    const nextTheme = currentTheme === LIGHT_THEME
        ? DARK_THEME
        : LIGHT_THEME;

    applyTheme(nextTheme);

    saveTheme(nextTheme);

    return nextTheme;

}

/* ==========================================================
   OBTENER ICONO DEL BOTÓN
========================================================== */

export function getThemeIcon(theme) {

    return theme === DARK_THEME
        ? "☀️"
        : "🌙";

}

/* ==========================================================
   OBTENER CLAVE DE ACCESIBILIDAD
========================================================== */

export function getThemeLabelKey(theme) {

    return theme === DARK_THEME
        ? "controls.enableLightTheme"
        : "controls.enableDarkTheme";

}