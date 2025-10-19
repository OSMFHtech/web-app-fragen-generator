import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeRequest({ topic, language, qtype, difficulty, n }) {
  return {
    topic: topic || "general knowledge",
    language: language || "en",
    qtype: qtype || "multiple-choice",
    difficulty: difficulty || "medium",
    n: n || 1,
  };
}

function validateItem(item) {
  if (!item || !item.id || !item.text) return false;
  if (item.type === "multiple-choice" && !Array.isArray(item.options)) return false;
  if (item.type === "coderunner" && typeof item.answer !== "string") return false;
  return true;
}

function sanitizeText(t) {
  return (t || "").replace(/[\u0000-\u001F]+/g, "").trim();
}

async function callLLM(prompt, wantType, language, difficulty) {
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const url = process.env.OPENROUTER_API_KEY
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  // more structured prompt
  const fullPrompt = `
Regenerate **one** ${wantType} question in ${language}.
Difficulty: ${difficulty}.
Return ONLY pure JSON array with one item:
[
  {
    "id": "uuid",
    "type": "${wantType}",
    "text": "Question text",
    ${wantType === "coderunner"
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
]

Topic/context:
${prompt}
`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
    }),
  });

  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content || "";
  const match = text.match(/\[\s*[\s\S]*\]/);
  if (!match) throw new Error("LLM did not return JSON");

  const arr = JSON.parse(match[0]);
  arr[0].id = crypto.randomUUID();  // <-- assign new ID
  return arr[0];
}


export async function POST(req) {
  try {
    const { id, topic, language, qtype, difficulty } = await req.json();
    const cfg = normalizeRequest({ topic, language, qtype, difficulty, n: 1 });
    const prompt = [
      "Regenerate a single question",
      `topic: ${cfg.topic}`,
      `language: ${cfg.language}`,
      `type: ${cfg.qtype}`,
      `difficulty: ${cfg.difficulty}`,
      "return only the question text",
    ].join("\n");

    const item = await callLLM(prompt, cfg.qtype, cfg.language, cfg.difficulty);

    const valid = validateItem(item);

    return NextResponse.json({ item: valid ? item : null });
  } catch (err) {
    console.error("Regenerate API error:", err);
    return NextResponse.json({ item: null, error: err.message }, { status: 500 });
  }
}
