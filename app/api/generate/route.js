// app/api/generate/route.js
export const runtime = "nodejs";

// hard-require LLM (no mock fallback)
const REQUIRE_LLM = true;

function extractJsonArray(raw) {
  if (!raw) return null;
  // try direct parse
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; if (Array.isArray(p?.items)) return p.items; } catch {}
  // extract the first JSON array from text
  const m = raw.match(/\[\s*[\s\S]*\]/);
  if (!m) return null;
  try { const p = JSON.parse(m[0]); return Array.isArray(p) ? p : null; } catch {}
  return null;
}

function normItem(it, qtype, language, difficulty) {
  const base = {
    id: it?.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    type: it?.type || qtype,
    text: it?.text || "",
    language: it?.language || language,
    difficulty: it?.difficulty || difficulty,
  };
  if (base.type === "coderunner") {
    return {
      ...base,
      answer: it?.answer || "print('OK')",
testcases: it?.testcases?.length
  ? it.testcases
  : [
      { input: "1+1", expected: "2" },
      { input: "2*3", expected: "6" }
    ],
    };
  }
  return {
    ...base,
    options: Array.isArray(it?.options)
      ? it.options
      : [
          { text: "Option A", correct: true },
          { text: "Option B", correct: false },
          { text: "Option C", correct: false },
          { text: "Option D", correct: false },
        ],
  };
}

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { error: "Missing OPENROUTER_API_KEY" };
  const model = process.env.LLM_MODEL || "openai/gpt-4o-mini";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Question Generator",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return { error: `OpenRouter HTTP ${res.status}` };
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    return { content };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body?.topic || "").trim();
    const language = body?.language || "en";
    const qtype = body?.qtype || body?.type || "multiple-choice";
    const difficulty = body?.difficulty || "medium";
    const target = Math.max(1, Math.min(300, Number(body?.count ?? body?.n ?? 1)));
    const per = Math.max(1, Math.min(Number(body?.batchSize || 10), 50));

    if (!topic) {
      return new Response(JSON.stringify({ ok: false, error: "Missing topic" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const out = [];
    const seen = new Set();
    let attempts = 0;
    const maxAttempts = 60;

    while (out.length < target && attempts < maxAttempts) {
      const need = Math.min(per, target - out.length);
      let prompt = '';
      if (qtype === 'multiple-choice') {
        // Instruct the LLM to produce a mix: ~50% multi-correct and ~50% single-correct MC questions
        prompt =
`Generate ${need} multiple-choice questions about "${topic}" in ${language}.
Make approximately half of the returned questions have multiple correct options (more than one option with "correct": true) and half have exactly one correct option.
Be explicit in the JSON: for multi-answer questions include multiple options with "correct": true; for single-answer questions include exactly one option with "correct": true.
Return ONLY a pure JSON array, no prose:

[
  {
    "id": "uuid",
    "type": "multiple-choice",
    "text": "Question text",
    "options": [
      {"text":"Option A","correct":true/false},
      {"text":"Option B","correct":true/false},
      {"text":"Option C","correct":true/false},
      {"text":"Option D","correct":true/false}
    ],
    "language": "${language}",
    "difficulty": "${difficulty}"
  }
]`;
      } else {
        prompt =
`Generate ${need} ${qtype} questions about "${topic}" in ${language}.
Return ONLY a pure JSON array, no prose:

[
  {
    "id": "uuid",
    "type": "${qtype}",
    "text": "Question text",
    ${qtype === "coderunner"
      ? `"answer": "reference answer", "testcases": [{"input":"","expected":""}]`
      : `"options": [
          {"text":"Option A","correct":true/false},
          {"text":"Option B","correct":true/false},
          {"text":"Option C","correct":true/false},
          {"text":"Option D","correct":true/false}
        ]`
    },
    "language": "${language}",
    "difficulty": "${difficulty}"
  }
]`;
      }

      const { content, error } = await callOpenRouter(prompt);
      if (error && REQUIRE_LLM) {
        return new Response(JSON.stringify({ ok: false, error }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      const items = extractJsonArray(content || "");
      if (!items && REQUIRE_LLM) {
        return new Response(JSON.stringify({ ok: false, error: "LLM returned non-JSON content" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      const arr = Array.isArray(items) ? items : [];
      for (const it of arr) {
        const key = String(it?.text || "").toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(normItem(it, qtype, language, difficulty));
        if (out.length >= target) break;
      }
      attempts++;
    }

    return new Response(JSON.stringify({ ok: true, items: out }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
