import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

async function callLLM(prompt, wantType) {
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const url = process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const body = { model, messages: [{ role: "user", content: prompt }], n: 1, temperature: 0.7 };
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  const text = sanitizeText(j?.choices?.[0]?.message?.content || "");
  if (wantType === "coderunner") {
    return { id: crypto.randomUUID(), type: "coderunner", text, answer: "print('OK')", testcases: [{ input: "", expected: "" }] };
  }
  return {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    text,
    options: [
      { text: "A", correct: true },
      { text: "B", correct: false },
      { text: "C", correct: false },
      { text: "D", correct: false }
    ]
  };
}

export async function POST(req) {
  const { id, topic, language, qtype, difficulty } = await req.json();
  const cfg = normalizeRequest({ topic, language, qtype, difficulty, n: 1 });
  const prompt = [
    "Regenerate a single question",
    `topic: ${cfg.topic}`,
    `language: ${cfg.language}`,
    `type: ${cfg.qtype}`,
    `difficulty: ${cfg.difficulty}`,
    "return only the question text"
  ].join("\n");
  const item = await callLLM(prompt, cfg.qtype);
  const valid = validateItem(item);
  return NextResponse.json({ item: valid ? item : null });
}
