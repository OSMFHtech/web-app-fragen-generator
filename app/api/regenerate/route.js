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
  // select-and-drag must have options array and mapping for blanks
  if (item.type === "select-and-drag") {
    if (!Array.isArray(item.options) || !Array.isArray(item.mapping)) return false;
    if (typeof item.blanks !== 'number' && !Array.isArray(item.mapping)) return false;
  }
  // list-options must have definitions array, options array and mapping same length as definitions
  if (item.type === "list-options") {
    if (!Array.isArray(item.definitions) || !Array.isArray(item.options) || !Array.isArray(item.mapping)) return false;
    if (item.mapping.length !== item.definitions.length) return false;
  }
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
      : wantType === 'select-and-drag'
        ? `"options": [{"text":"Answer A"},{"text":"Answer B"},{"text":"Answer C"},{"text":"Answer D"},{"text":"Answer E"}],\n    \"mapping\": [0,1,2], \n    \"blanks\": 3`
        : wantType === 'list-options'
        ? `"definitions": ["Definition 1","Definition 2","Definition 3","Definition 4","Definition 5"],\n    \"options\": [{"text":"Answer A"},{"text":"Answer B"},{"text":"Answer C"},{"text":"Answer D"},{"text":"Answer E"}],\n    \"mapping\": [0,1,2,3,4]`
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

    let item = await callLLM(prompt, cfg.qtype, cfg.language, cfg.difficulty);

    // Post-process to ensure required fields for special types
    if (item?.type === 'select-and-drag') {
      const options = Array.isArray(item.options) && item.options.length ? item.options : [
        { text: 'Answer A' }, { text: 'Answer B' }, { text: 'Answer C' }, { text: 'Answer D' }, { text: 'Answer E' }
      ];
      const blanksFromMapping = Array.isArray(item.mapping) ? item.mapping.length : null;
      const blanks = Number.isFinite(Number(item.blanks)) ? Math.max(3, Math.min(6, Number(item.blanks))) : (blanksFromMapping ? Math.max(3, Math.min(6, blanksFromMapping)) : 3);
      const mapping = Array.isArray(item.mapping) ? item.mapping.slice(0) : Array.from({ length: blanks }).map((_, i) => i % options.length);
      while (mapping.length < blanks) mapping.push(mapping.length % options.length);
      // ensure text contains numbered placeholders (1..n) and that placeholders aren't the only content
      let text = item.text || '';
      const hasPlaceholder = /\(\d+\)/.test(text);
      const onlyPlaceholders = /^\s*(\(\d+\)\s*)+$/.test(text);
      const placeholders = Array.from({ length: blanks }).map((_, i) => `(${i+1})`).join(' ');
      if (!hasPlaceholder) {
        text = (text + ' ' + placeholders).trim();
      } else if (onlyPlaceholders || !text.replace(/\s+/g, '').length) {
        text = `Fill in the blanks: ${placeholders}`;
      }
      item = { ...item, text, options, mapping, blanks };
    }

    if (item?.type === 'list-options') {
      const definitions = Array.isArray(item.definitions) && item.definitions.length ? item.definitions : [ 'Definition 1', 'Definition 2', 'Definition 3', 'Definition 4' ];
      const options = Array.isArray(item.options) && item.options.length ? item.options : [ { text: 'Answer A' }, { text: 'Answer B' }, { text: 'Answer C' }, { text: 'Answer D' }, { text: 'Answer E' } ];
      const mapping = Array.isArray(item.mapping) ? item.mapping.slice(0) : definitions.map((_, i) => i % options.length);
      while (mapping.length < definitions.length) mapping.push(mapping.length % options.length);
      const text = item.text || definitions.slice(0, Math.min(3, definitions.length)).join(' · ');
      item = { ...item, text, definitions, options, mapping };
    }

    const valid = validateItem(item);

    return NextResponse.json({ item: valid ? item : null });
  } catch (err) {
    console.error("Regenerate API error:", err);
    return NextResponse.json({ item: null, error: err.message }, { status: 500 });
  }
}
