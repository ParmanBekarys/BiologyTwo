const LOCAL_API_BASE_URL = "http://localhost:3000";
const PROD_API_BASE_URL = "https://biologytwo.onrender.com";

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const CONFIG = {
  // Gemini кілті браузерде тұрмауы керек.
  // Кілт Node.js серверінде (.env) тұрады, браузер тек proxy endpoint-ке сұрайды.
  API_BASE_URL: isLocalHost ? LOCAL_API_BASE_URL : PROD_API_BASE_URL,
};

// Модульдер мен басқа скриптерге қолжетімді ету үшін.
window.CONFIG = CONFIG;
globalThis.CONFIG = CONFIG;