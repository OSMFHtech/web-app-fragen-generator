// app/api/generate/route.js
export const runtime = "nodejs";

import { v4 as uuidv4 } from "uuid";

/* -----------------------------
  Mock generator (fallback)
-----------------------------*/
function mockQuestions(topic, language, qtype, difficulty, n) {
  const items = Array.from({ length: n }, (_, i) => ({
    id: uuidv4(),
    type: qtype,
    text:
      language === "de"
        ? `Beispiel-Frage ${i + 1} über ${topic}?`
        : `Example question ${i + 1} about ${topic}?`,
    options: [
      { text: "Option A", correct: i % 4 === 0 },
      { text: "Option B", correct: i % 4 === 1 },
      { text: "Option C", correct: i % 4 === 2 },
      { text: "Option D", correct: i % 4 === 3 },
    ],
    language,
    difficulty,
  }));
  return items;
}

/* -----------------------------
  Helper: call OpenRouter API
-----------------------------*/
async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

  const model = process.env.MODEL_NAME || "gpt-4o-mini";
  console.log("➡️ Calling OpenRouter with model:", model);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log("✅ OpenRouter response received");
    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("❌ OpenRouter call failed:", err);
    return null;
  }
}

/* -----------------------------
  Helper: call Ollama (optional fallback)
-----------------------------*/
async function callOllama(prompt, url) {
  console.log("➡️ Calling Ollama...");
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3", prompt }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log("✅ Ollama response received");
    return data.response || "";
  } catch (err) {
    console.error("❌ Ollama call failed:", err);
    return null;
  }
}

/* -----------------------------
  Main handler
-----------------------------*/
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      topic = "",
      language = "en",
      qtype = "multiple-choice",
      difficulty = "medium",
      count = 5,
    } = body;

    if (!topic) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing topic" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const n = count;
    const OLLAMA_URL = process.env.OLLAMA_URL;

    console.log("🔍 Generating questions with:", {
      topic,
      language,
      qtype,
      difficulty,
      n,
      hasOllama: !!OLLAMA_URL,
      usingOpenRouter: true,
    });

    // Build the prompt
    const prompt = `
Generate ${n} ${qtype} questions about "${topic}" in ${language}.
Return only JSON in the format:
[
  {
    "id": "uuid",
    "type": "${qtype}",
    "text": "Question text",
    "options": [
      {"text": "Option A", "correct": true/false},
      {"text": "Option B", "correct": true/false},
      {"text": "Option C", "correct": true/false},
      {"text": "Option D", "correct": true/false}
    ],
    "language": "${language}",
    "difficulty": "${difficulty}"
  }
]
`;

    // Try OpenRouter first
    let raw = await callOpenRouter(prompt);

    // If OpenRouter fails, fallback to Ollama
    if (!raw && OLLAMA_URL) raw = await callOllama(prompt, OLLAMA_URL);

    // Fallback to mock questions
    if (!raw) {
      console.warn("⚠️ LLM response empty, falling back to mock");
      const mock = mockQuestions(topic, language, qtype, difficulty, n);
      return new Response(JSON.stringify({ ok: true, items: mock }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse JSON
    // Extract first JSON array from raw text
let parsed = null;
try {
  const match = raw.match(/\[.*\]/s); // 's' = dot matches newline
  if (match) {
    parsed = JSON.parse(match[0]);
  } else {
    throw new Error("No JSON array found in LLM response");
  }
} catch (err) {
  console.error("⚠️ Could not parse LLM JSON:", err, raw);
  parsed = mockQuestions(topic, language, qtype, difficulty, n);
}


    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.items)
      ? parsed.items
      : mockQuestions(topic, language, qtype, difficulty, n);

    return new Response(JSON.stringify({ ok: true, items }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ API Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
