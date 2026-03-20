const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/** Origin header-де соңғы / болмайды, бірақ қауіпсіздік үшін нормализация */
function normalizeOrigin(origin) {
  if (!origin || typeof origin !== "string") return origin;
  return origin.trim().replace(/\/+$/, "");
}

/** Render-дағы ALLOWED_ORIGINS тек қосымша тізім; базалық домендер әрқашан қалады */
const BASE_ALLOWED_ORIGINS = [
  "http://localhost:5503",
  "http://127.0.0.1:5503",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://biologysmart.parmanbekaris.workers.dev",
  "https://biologysmart.org",
  "https://www.biologysmart.org",
];

const extraFromEnv = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => normalizeOrigin(o))
  .filter(Boolean);

const allowedOriginsSet = new Set([
  ...BASE_ALLOWED_ORIGINS.map(normalizeOrigin),
  ...extraFromEnv,
]);

const corsOptions = {
  origin(origin, callback) {
    // Server-to-server calls (no Origin header) should still work.
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    if (allowedOriginsSet.has(normalized)) return callback(null, true);
    // Error емес false: кейбір ортада OPTIONS 500 болып CORS headerсыз қалуы мүмкін
    return callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  optionsSuccessStatus: 204,
};

app.use(
  cors(corsOptions)
);
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const SYSTEM_PROMPT =
  "You are a helpful biology teacher assistant specializing in bilingual support. Carefully detect the language used by the user. If the user writes in Kazakh, respond in Kazakh. If they write in English, respond in English. If they write in Russian, respond in Russian. Provide accurate, scientifically sound biology information.";

function mapRoleForGemini(role) {
  return role === "assistant" ? "model" : "user";
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "BiologyTwo API server is running",
    endpoints: ["GET /health", "POST /api/gemini"],
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing in .env" });
    }

    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    const userText =
      typeof req.body?.userText === "string" ? req.body.userText.trim() : "";
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!userText) {
      return res.status(400).json({ error: "userText is required" });
    }

    const nextHistory = [...history, { role: "user", content: userText }];

    const contents = nextHistory.map((m, idx) => {
      const text =
        idx === 0 && m.role === "user"
          ? `${SYSTEM_PROMPT}\n\n${m.content}`
          : m.content;

      return {
        role: mapRoleForGemini(m.role),
        parts: [{ text }],
      };
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent`;

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
      let errText = "";
      try {
        errText = await response.text();
      } catch {}
      return res.status(response.status).json({
        error: "Gemini request failed",
        details: errText || "",
      });
    }

    const data = await response.json();

    const aiText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("")
        ?.trim() || "Жауап келмеді.";

    return res.json({ text: aiText });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

