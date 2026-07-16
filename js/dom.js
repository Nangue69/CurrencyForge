/* ==========================================================
   CURRENCYFORGE
   DOM.JS

   Referencias centralizadas a los elementos del DOM
========================================================== */

const DOM = {

   /* ======================================================
      CONTROLES GENERALES
   ====================================================== */

   languageSelector: document.getElementById("language-selector"),
   themeToggle: document.getElementById("theme-toggle"),

   /* ======================================================
      FORMULARIO
   ====================================================== */

   converterForm: document.getElementById("converter-form"),

   amountInput: document.getElementById("amount"),
   amountError: document.getElementById("amount-error"),

   fromCurrencyRoot: document.getElementById("from-currency"),
   toCurrencyRoot: document.getElementById("to-currency"),

   swapCurrencies: document.getElementById("swap-currencies"),
   convertButton: document.getElementById("convert-button"),

   /* ======================================================
      MENSAJES
   ====================================================== */

   feedback: document.getElementById("feedback"),

   /* ======================================================
      RESULTADO
   ====================================================== */

   resultPanel: document.getElementById("result-panel"),
   resultMain: document.getElementById("result-main"),
   resultRoute: document.getElementById("result-route"),
   resultRate: document.getElementById("result-rate"),
   resultUpdated: document.getElementById("result-updated"),
   resultSource: document.getElementById("result-source"),

   /* ======================================================
      HISTORIAL
   ====================================================== */

   history: document.getElementById("history"),
   historyCount: document.getElementById("history-count"),
   historyList: document.getElementById("history-list"),
   historyEmpty: document.getElementById("history-empty"),
   clearHistory: document.getElementById("clear-history")

};

export default DOM;