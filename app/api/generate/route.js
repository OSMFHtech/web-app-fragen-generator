export const runtime = "edge";

function mcq(topic, lang, difficulty, id) {
  const stem = lang === "de"
    ? `Welche Aussage über <b>${topic}</b> ist korrekt?`
    : `Which statement about <b>${topic}</b> is correct?`;

  const opts = [
    { text: lang === "de" ? "Option A" : "Option A", correct: false },
    { text: lang === "de" ? "Option B" : "Option B", correct: true },
    { text: lang === "de" ? "Option C" : "Option C", correct: false },
    { text: lang === "de" ? "Option D" : "Option D", correct: false }
  ];

  return { id, type: "multiple-choice", text: stem, options: opts, language: lang, difficulty };
}

function coderunner(topic, lang, difficulty, id) {
  const stem = lang === "de"
    ? `Schreiben Sie eine Funktion <code>solve()</code>, die eine Eingabe zu <b>${topic}</b> verarbeitet und die erwartete Ausgabe zurückgibt.`
    : `Write a function <code>solve()</code> that processes an input related to <b>${topic}</b> and returns the expected output.`;
  const answer = lang === "de"
    ? `def solve():\n    # TODO: implementieren\n    pass`
    : `def solve():\n    # TODO: implement\n    pass`;

  return { id, type: "coderunner", text: stem, answer, language: lang, difficulty };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic="AI", language="en", qtype="multiple-choice", difficulty="medium", count=5 } = body || {};
    const n = Math.max(1, Math.min(50, parseInt(count, 10) || 5));

    const items = Array.from({length:n}, (_, i) => {
      const id = `${Date.now()}-${i+1}`;
      return qtype === "coderunner"
        ? coderunner(topic, language, difficulty, id)
        : mcq(topic, language, difficulty, id);
    });

    return new Response(JSON.stringify({ ok: true, items }), {
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e) }), { status: 400 });
  }
}
