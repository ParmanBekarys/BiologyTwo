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
  // Gemini key: конфигте GEMINI_API_KEY болса — соны, жоқ болса — бұрынғы OPENAI_API_KEY-ті қолданамыз.
  const apiKey = globalThis.CONFIG?.GEMINI_API_KEY || globalThis.CONFIG?.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API key табылмады. aiChat/config.js ішіне Gemini кілтін қосыңыз.");

  const model =
    globalThis.CONFIG?.GEMINI_MODEL ||
    "gemini-3-flash-preview";

  // Gemini raw endpoint
  // https://ai.google.dev/gemini-api/docs/quickstart  (generateContent v1beta)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;

  // contents: history + current userText
  const nextHistory = [...conversationHistory, { role: "user", content: userText }];
  const contents = nextHistory.map((m, idx) => {
    const text =
      idx === 0 && m.role === "user" ? `${SYSTEM_PROMPT}\n\n${m.content}` : m.content;
    return {
      role: mapRoleForGemini(m.role),
      parts: [{ text }],
    };
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.4 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error ${response.status}: ${errText || "no body"}`);
  }

  const data = await response.json();
  const aiText =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("")?.trim() ||
    "Жауап келмеді.";

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
    addMessage("Қате болды. Кейінірек қайталап көріңіз.", "ai");
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

