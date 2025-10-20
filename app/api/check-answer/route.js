// app/api/check-answer/route.js
export const runtime = "nodejs";

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { error: "Missing OPENROUTER_API_KEY" };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "openai/gpt-4o-mini",
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
    const { questionText, userAnswer, expectedAnswer, language } = body;

    if (!questionText || !userAnswer) {
      return new Response(
        JSON.stringify({ error: "Missing question or answer" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
      Question: ${questionText}
      Expected answer: ${expectedAnswer}
      User submitted: ${userAnswer}
      Reply ONLY with JSON: {"correct": true/false, "feedback": "short feedback"}
    `;

    const { content, error } = await callOpenRouter(prompt);
    if (error) return new Response(JSON.stringify({ error }), { status: 502, headers: { "Content-Type": "application/json" } });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { correct: false, feedback: "Could not parse LLM response" };
    }

    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
