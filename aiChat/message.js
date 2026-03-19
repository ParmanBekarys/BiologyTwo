const chatMessagesEl = document.getElementById("chatMessages");
const userInputEl = document.getElementById("userInput");
const sendBtnEl = document.getElementById("sendBtn");
const chatHintEl = document.getElementById("chatHint");

function escapeText(text) {
  // Тек текстпен шығарамыз (innerHTML емес), бірақ қажет болса болашақта.
  return text;
}

function addMessage(text, role) {
  const msg = document.createElement("div");
  msg.className = role === "user" ? "message user-message" : "message ai-message";
  msg.textContent = escapeText(text);
  chatMessagesEl.appendChild(msg);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function createTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "message ai-message";
  wrap.innerHTML = `
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  chatMessagesEl.appendChild(wrap);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return wrap;
}

const SYSTEM_PROMPT =
  "You are a helpful biology teacher assistant specializing in bilingual support. Carefully detect the language used by the user. If the user writes in Kazakh, respond in Kazakh. If they write in English, respond in English. If they write in Russian, respond in Russian. Provide accurate, scientifically sound biology information.";

// assistant -> Gemini role "model", user -> role "user"
const conversationHistory = [];

function mapRoleForGemini(role) {
  return role === "assistant" ? "model" : "user";
}

async function getAiResponseStub(userText) {
  // API браузерде ашылмауы үшін Gemini сұрағын backend(proxy) арқылы жасаймыз.
  const apiBaseUrl = globalThis.CONFIG?.API_BASE_URL || "http://localhost:3000";
  const url = `${apiBaseUrl.replace(/\/$/, "")}/api/gemini`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userText,
      history: conversationHistory,
    }),
  });

  if (!response.ok) {
    let errText = "";
    try {
      errText = await response.text();
    } catch {}
    const error = new Error(
      `Gemini proxy error ${response.status}: ${errText || "no body"}`
    );
    error.status = response.status;
    error.details = errText || "";
    throw error;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {}

  const aiText = data?.text?.trim() || "Жауап келмеді.";

  conversationHistory.push({ role: "assistant", content: aiText });
  if (conversationHistory.length > 10) {
    // тым көп болып кетпеу үшін соңғы 10 жазбаны ұстаймыз
    conversationHistory.splice(0, conversationHistory.length - 10);
  }

  return aiText;
}

async function handleSend() {
  const text = (userInputEl.value || "").trim();
  if (!text) return;

  addMessage(text, "user");
  userInputEl.value = "";

  const typingEl = createTypingIndicator();
  try {
    if (chatHintEl) chatHintEl.textContent = "";
    const responseText = await getAiResponseStub(text);
    chatMessagesEl.removeChild(typingEl);
    addMessage(responseText, "ai");
  } catch (e) {
    console.error(e);
    chatMessagesEl.removeChild(typingEl);
    const status = e?.status;
    const details = e?.details || e?.message || "";

    addMessage(
      `AI қате болды (${status || "?"}). Кейінірек қайталап көріңіз.`,
      "ai"
    );
  }
}

function initChat() {
  if (!chatMessagesEl || !userInputEl || !sendBtnEl) return;

  // Бастапқы greeting
  addMessage(
    "Сәлем! Биология бойынша сұрақтарыңызды жаза беріңіз. (Gemini қосылған)",
    "ai"
  );

  sendBtnEl.addEventListener("click", handleSend);

  userInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
}

initChat();

