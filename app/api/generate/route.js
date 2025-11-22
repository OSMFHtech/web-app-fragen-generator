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
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
  // Normalize special types: select-and-drag and list-options
  if (base.type === 'select-and-drag') {
    // expected fields: text with placeholders like (1), (2)..., options: [{text, correct}], mapping: [optionIndexForBlank]
    const options = Array.isArray(it?.options)
      ? it.options
      : [
          { text: "Answer A", correct: false },
          { text: "Answer B", correct: false },
          { text: "Answer C", correct: false },
          { text: "Answer D", correct: false },
          { text: "Answer E", correct: false },
        ];
    const blanksRaw = it?.blanks;
    const blanksFromMapping = Array.isArray(it?.mapping) ? it.mapping.length : null;
    const blanks = Number.isFinite(Number(blanksRaw))
      ? Math.max(3, Math.min(6, Number(blanksRaw)))
      : (blanksFromMapping ? Math.max(3, Math.min(6, blanksFromMapping)) : randInt(3, 6));
    const mapping = Array.isArray(it?.mapping)
      ? it.mapping
      : Array.from({ length: blanks }).map((_, i) => i % options.length);
    // ensure mapping length equals blanks
    if (mapping.length < blanks) {
      for (let i = mapping.length; i < blanks; i++) mapping.push(i % options.length);
    }
    // mark correctness on options (any option marked as correct if appears in mapping)
    const opts = options.map((o, idx) => ({ text: o.text || `Option ${idx+1}`, correct: mapping.includes(idx) }));
    // Ensure the question text contains numbered placeholders like (1), (2), ...
    const hasPlaceholder = /\(\d+\)/.test(base.text || '');
    const onlyPlaceholders = /^\s*(\(\d+\)\s*)+$/.test(base.text || '');
    let textWithPlaceholders = base.text || '';
    const placeholders = Array.from({ length: blanks }).map((_, i) => `(${i+1})`).join(' ');
    if (!hasPlaceholder) {
      // no placeholders at all — append them after the text
      textWithPlaceholders = (textWithPlaceholders + ' ' + placeholders).trim();
    } else if (onlyPlaceholders || !textWithPlaceholders.replace(/\s+/g, '').length) {
      // text consists only of placeholders or is empty — add a short contextual prefix
      textWithPlaceholders = `Fill in the blanks: ${placeholders}`;
    }
    return { ...base, text: textWithPlaceholders, options: opts, mapping, blanks };
  }

  if (base.type === 'list-options') {
    // expected: definitions: ["..."], options: [{text}], mapping: [optionIndex per definition]
    const defsRaw = it?.definitions;
    const defsCount = Array.isArray(defsRaw) && defsRaw.length ? defsRaw.length : null;
    const defsN = defsCount || randInt(4, 7);
    const definitions = Array.isArray(defsRaw) && defsRaw.length > 0
      ? defsRaw
      : Array.from({ length: defsN }).map((_, i) => `Definition ${i+1}`);

    const optsRaw = it?.options;
    const optsCount = Array.isArray(optsRaw) && optsRaw.length ? optsRaw.length : null;
    const optsN = optsCount || randInt(5, 8);
    const options = Array.isArray(optsRaw)
      ? optsRaw
      : Array.from({ length: optsN }).map((_, i) => ({ text: `Answer ${String.fromCharCode(65 + i)}`, correct: false }));

    const mapping = Array.isArray(it?.mapping)
      ? it.mapping
      : definitions.map((_, i) => i % options.length).slice(0, definitions.length);
    const opts = options.map((o, idx) => ({ text: o.text || `Option ${idx+1}`, correct: mapping.includes(idx) }));
    // ensure question.text is present so deduplication/keying works
    const textFallback = definitions.slice(0, Math.min(3, definitions.length)).join(' · ');
    return { ...base, text: base.text || textFallback, definitions, options: opts, mapping };
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
        if (qtype === 'select-and-drag') {
          prompt =
`Generate ${need} "select-and-drag" style questions about "${topic}" in ${language}.
Each question should be a short text containing between 3 and 6 blanks labelled (1), (2), (3) ... where the student must drag a provided answer into each blank. Vary the number of blanks randomly between 3 and 6 across the returned items.
Provide a pool of 5-8 possible answers; some distractors may not be used. Each correct placement is worth 0.5 points. Do NOT vary that per difficulty.
Return ONLY a pure JSON array with objects shaped like:
[
  {
    "id": "uuid",
    "type": "select-and-drag",
    "text": "The sentence with blanks like: 'Fill the blanks (1), (2) and (3).',",
    "options": [{"text":"Answer A"},{"text":"Answer B"}, ...],
    "mapping": [2,0,1],    // array of option indices indicating the correct option for each blank (0-based)
    "blanks": 3,
    "language": "${language}",
    "difficulty": "${difficulty}"
  }
]
`;
        } else if (qtype === 'list-options') {
          prompt =
`Generate ${need} "list-options" questions about "${topic}" in ${language}.
Each question should contain between 4 and 7 short definitions. At the end of each definition provide an index placeholder like (1), (2), ... The student should pick the correct option for each definition from a shared list of possible answers. Vary the number of definitions randomly between 4 and 7.
Provide a pool of possible answers (5-8 entries). Each correct match is worth 0.5 points. Do NOT vary that per difficulty.
Return ONLY a pure JSON array with objects shaped like:
[
  {
    "id": "uuid",
    "type": "list-options",
    "definitions": ["Definition text 1","Definition text 2", ...],
    "options": [{"text":"Answer A"},{"text":"Answer B"}, ...],
    "mapping": [0,2,1,4,3], // indices of the correct option for each definition
    "language": "${language}",
    "difficulty": "${difficulty}"
  }
]
`;
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
        const effectiveType = it?.type || qtype;
        let key = "";
        if (effectiveType === 'list-options') {
          key = String((it?.definitions && it.definitions[0]) || it?.text || JSON.stringify(it)).toLowerCase().trim();
        } else if (effectiveType === 'select-and-drag') {
          key = String(it?.text || (it?.options && it.options[0]?.text) || JSON.stringify(it)).toLowerCase().trim();
        } else {
          key = String(it?.text || "").toLowerCase().trim();
        }
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
