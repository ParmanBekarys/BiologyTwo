const CONFIG = {
    // Gemini кілті браузерде тұрмауы керек.
    // Кілт Node.js серверінде (.env) тұрады, браузер тек proxy endpoint-ке сұрайды.
    API_BASE_URL: "http://localhost:3000"
};

// Модульдер мен басқа скриптерге қолжетімді ету үшін.
window.CONFIG = CONFIG;
globalThis.CONFIG = CONFIG;