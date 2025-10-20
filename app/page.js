"use client";

import { useState, useMemo } from "react";
import QuestionCard from "./components/QuestionCard";
import StatusSummary from "./components/StatusSummary";
import { buildMoodleXml, download } from "../lib/moodleXml";

export default function Page() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("en");
  const [qtype, setQtype] = useState("multiple-choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [rejectedIds, setRejectedIds] = useState(new Set());

  const accepted = useMemo(
    () => questions.filter(q => acceptedIds.has(q.id)),
    [questions, acceptedIds]
  );

  const statusOf = (id) =>
    acceptedIds.has(id)
      ? "accepted"
      : rejectedIds.has(id)
      ? "rejected"
      : "open";

  /* -----------------------------
      Generate AI questions
  -----------------------------*/
  async function generate() {
    setLoading(true);
    setQuestions([]);
    setAcceptedIds(new Set());
    setRejectedIds(new Set());

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, language, qtype, difficulty, count }),
      });
      const data = await res.json();
      if (data.ok) setQuestions(data.items);
      else alert(data.error || "Generation failed");
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------
      Accept / Reject
  -----------------------------*/
  function onAccept(q) {
    const next = new Set(acceptedIds);
    next.add(q.id);
    const rej = new Set(rejectedIds);
    rej.delete(q.id);
    setAcceptedIds(next);
    setRejectedIds(rej);
  }

  function onReject(id) {
    const next = new Set(rejectedIds);
    next.add(id);
    const acc = new Set(acceptedIds);
    acc.delete(id);
    setRejectedIds(next);
    setAcceptedIds(acc);
  }

  /* -----------------------------
      Edit / Regenerate / Update / Delete
  -----------------------------*/
  function onEdit(id) {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const q = questions[idx];
    const text = prompt("Edit question text (HTML allowed):", q.text);
    if (text === null) return;
    const copy = [...questions];
    copy[idx] = { ...q, text };
    setQuestions(copy);
  }

  async function onRegenerate(id) {
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, topic, language, qtype, difficulty }),
      });
      const data = await res.json();
      const replacement = data?.item;
      if (!replacement) throw new Error("Regeneration failed");

      const idx = questions.findIndex((q) => q.id === id);
      if (idx === -1) return;
      const copy = [...questions];
      copy[idx] = replacement;

      const acc = new Set(acceptedIds);
      const rej = new Set(rejectedIds);
      acc.delete(id);
      rej.delete(id);

      setQuestions(copy);
      setAcceptedIds(acc);
      setRejectedIds(rej);
    } catch (e) {
      alert(String(e));
    }
  }

  function onUpdate(id, updated) {
    const copy = questions.map((q) => (q.id === id ? updated : q));
    setQuestions(copy);
  }

  function onDelete(id) {
    const copy = questions.filter((q) => q.id !== id);
    setQuestions(copy);
    const acc = new Set(acceptedIds);
    const rej = new Set(rejectedIds);
    acc.delete(id);
    rej.delete(id);
    setAcceptedIds(acc);
    setRejectedIds(rej);
  }

  /* -----------------------------
      Export
  -----------------------------*/
  function exportXml() {
    setExporting(true);
    try {
      const xml = buildMoodleXml(accepted);
      const date = new Date().toISOString().slice(0, 10);
      const cleanTopic = (topic || "Fragenpool").replace(/[^\w\-]+/g, "_");
      const name = `Fragenpool_${cleanTopic}_${date}.xml`;
      download(name, xml);
    } finally {
      setTimeout(() => setExporting(false), 400);
    }
  }

  return (
    <div className="container">
      <h1>AI Question Generator</h1>
      <p className="small">Frontend demo • Generate → Review → Export (Moodle XML)</p>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <div>
            <label>Topic</label>
            <input
              className="input"
              placeholder="e.g., Linear Regression"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="row3" style={{ marginTop: 12 }}>
          <div>
            <label>Question Type</label>
            <select value={qtype} onChange={(e) => setQtype(e.target.value)}>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="coderunner">CodeRunner</option>
            </select>
          </div>
          <div>
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label>Count</label>
            <input
              className="input"
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
          <button className="btn" onClick={generate} disabled={loading || !topic}>
            {loading ? "Generating…" : "Generate"}
          </button>
          <button className="btn ok" onClick={exportXml} disabled={accepted.length === 0 || exporting}>
            {exporting ? "Exporting…" : "Export accepted to Moodle XML"}
          </button>
          <span className="small">{accepted.length} selected for export</span>
        </div>
      </div>

      <StatusSummary total={questions.length} accepted={acceptedIds.size} rejected={rejectedIds.size} />

      <div className="section-title">Questions</div>
      <div className="list">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            status={statusOf(q.id)}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {!questions.length && !loading ? (
          <div className="small">No questions yet. Enter a topic and click Generate.</div>
        ) : null}
      </div>

      <div className="footer">
        <div className="small">Tip: Accept only high-quality items. You can edit text, mark correct answers, or regenerate low-quality items before export.</div>
      </div>
    </div>
  );
}
