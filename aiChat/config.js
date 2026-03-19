// OpenAI API кілті — осы файлда тұрғаны дұрыс.
// ЕСКЕРТУ: бұл клиент тарапында болғандықтан, кілт ашылып кетеді. Кейін сервер арқылы жасаған дұрыс.
// Бірақ қазіргі мақсат үшін жұмыс істетуге қойылды.
const CONFIG = {
    GEMINI_API_KEY: "AIzaSyDtTVc6IdRVZpi6SY6dFhBVwJS6i06Irfg",
    // Қолдамай жатса, мына модельді өзгертуге болады.
    // Мысалы: gemini-1.5-flash-preview, gemini-1.5-pro, т.б.
    GEMINI_MODEL: "gemini-3-flash-preview"
};

// Модульдер мен басқа скриптерге қолжетімді ету үшін.
window.CONFIG = CONFIG;
globalThis.CONFIG = CONFIG;