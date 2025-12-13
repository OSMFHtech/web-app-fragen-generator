"use client";

import { useState, useMemo } from "react";
import QuestionCard from "../components/QuestionCard";
import StatusSummary from "../components/StatusSummary";
import { buildMoodleXml, download } from "../../lib/moodleXml";

export default function GeneratorPage() {
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
  // track per-question reviewer selections (for live aggregate grading)
  const [selections, setSelections] = useState({}); // { [questionId]: { type: 'single'|'multi', indices: [nums] } }

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

  /* ---------- Selection handling & aggregate grade ---------- */
  const getMaxPoints = (q) => {
    // For special types, max is number_of_subitems * 0.5 (each sub-answer = 0.5)
    if (!q) return 1;
    if (q.type === 'select-and-drag') {
      const blanks = q.blanks || (Array.isArray(q.mapping) ? q.mapping.length : 0);
      return (blanks || 0) * 0.5;
    }
    if (q.type === 'list-options') {
      const defs = Array.isArray(q.definitions) ? q.definitions.length : 0;
      return (defs || 0) * 0.5;
    }
    const diff = (q?.difficulty || "medium").toLowerCase();
    if (diff === "easy") return 0.5;
    if (diff === "hard") return 2;
    return 1;
  };

  const computeMultiSelectPoints = (q, selIdxArr) => {
    const max = getMaxPoints(q);
    const opts = q.options || [];
    const C = opts.filter((o) => o.correct).length || 0;
    if (C === 0) return 0;
    const selected = selIdxArr || [];
    const correctSelected = selected.filter((i) => opts[i] && opts[i].correct).length;
    const wrongSelected = selected.filter((i) => opts[i] && !opts[i].correct).length;
    const denom = C + wrongSelected;
    if (denom === 0) return 0;
    const fraction = correctSelected / denom;
    return Math.max(0, Math.min(1, fraction)) * max;
  };

  const computeAwardedPoints = (q, sel) => {
    const max = getMaxPoints(q);
    if (!sel) return null;
    if (sel.type === "coderunner") {
      // coderunner answers report awarded points from QuestionCard
      return typeof sel.awarded === "number" ? sel.awarded : null;
    }
    if (sel.type === 'select-and-drag') {
      if (typeof sel.awarded === 'number') return sel.awarded;
      // fallback: compute from placements vs mapping (each correct = 0.5)
      const mapping = q.mapping || [];
      const places = sel.placements || [];
      let correct = 0;
      for (let i = 0; i < mapping.length; i++) if (places[i] != null && Number(places[i]) === Number(mapping[i])) correct++;
      return correct * 0.5;
    }
    if (sel.type === 'list-options') {
      if (typeof sel.awarded === 'number') return sel.awarded;
      const mapping = q.mapping || [];
      const sels = sel.selections || [];
      let correct = 0;
      for (let i = 0; i < mapping.length; i++) if (sels[i] != null && Number(sels[i]) === Number(mapping[i])) correct++;
      return correct * 0.5;
    }
    if (!sel.indices || sel.indices.length === 0) return null;
    const opts = q.options || [];
    const C = opts.filter((o) => o.correct).length || 0;
    if (C <= 1) {
      // single-correct style
      const idx = sel.indices[0];
      const opt = opts[idx];
      if (!opt) return null;
      return opt.correct ? max : 0;
    }
    // multi-correct
    return computeMultiSelectPoints(q, sel.indices);
  };

  const getGradeFromPercent = (pct) => {
    if (pct >= 90) return { label: "Final Grade 1: Sehr gut", color: "#34d399" };
    if (pct >= 78) return { label: "Gut", color: "#f59e0b" };
    if (pct >= 65) return { label: "Befriedigend", color: "#60a5fa" };
    if (pct >= 50) return { label: "Genügend", color: "#a78bfa" };
    return { label: "Nicht Genügend", color: "#ef4444" };
  };

  function handleSelectionChange(id, payload) {
    setSelections((prev) => {
      const copy = { ...prev };
      if (!payload) delete copy[id];
      else if (payload.type === "coderunner") copy[id] = payload;
      else if (payload.type === 'select-and-drag' || payload.type === 'list-options') {
        // these payloads provide awarded/max or placements/selections
        if (typeof payload.awarded === 'number' || Array.isArray(payload.placements) || Array.isArray(payload.selections)) {
          copy[id] = payload;
        } else {
          delete copy[id];
        }
      }
      else if (!payload.indices || payload.indices.length === 0) delete copy[id];
      else copy[id] = payload;
      return copy;
    });
  }

  const aggregate = useMemo(() => {
    let awarded = 0;
    let max = 0;
    for (const [id, sel] of Object.entries(selections)) {
      const q = questions.find((x) => x.id === id);
      if (!q) continue;
      const m = getMaxPoints(q);
      const a = computeAwardedPoints(q, sel);
      if (a === null) continue;
      awarded += a;
      max += m;
    }
    const pct = max > 0 ? Math.round((awarded / max) * 100) : 0;
    const grade = getGradeFromPercent(pct);
    return { awarded, max, pct, grade };
  }, [selections, questions]);

  /* -----------------------------
      Generate AI questions
  -----------------------------*/
  async function generate() {
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, language, qtype, difficulty, count }),
      });
      const data = await res.json();
      if (data.ok) {
        // Append new questions to existing ones instead of replacing
        setQuestions((prev) => [...prev, ...data.items]);
      } else {
        alert(data.error || "Generation failed");
      }
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
      Accept / Reject ALL
  -----------------------------*/
  function acceptAll() {
    // mark all current questions as accepted, clear rejections
    const ids = new Set(questions.map((q) => q.id));
    setAcceptedIds(ids);
    setRejectedIds(new Set());
  }

  function rejectAll() {
    // mark all current questions as rejected, clear acceptances
    const ids = new Set(questions.map((q) => q.id));
    setRejectedIds(ids);
    setAcceptedIds(new Set());
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
              <option value="select-and-drag">Select & Drag</option>
              <option value="list-options">Definition Matching</option>
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
          <button className="btn ok" onClick={acceptAll} disabled={questions.length === 0}>
            Accept all
          </button>
          <button className="btn warn" onClick={rejectAll} disabled={questions.length === 0}>
            Reject all
          </button>
          <button className="btn ok" onClick={exportXml} disabled={accepted.length === 0 || exporting}>
            {exporting ? "Exporting…" : "Export accepted to Moodle XML"}
          </button>
          <span className="small">{accepted.length} selected for export</span>
        </div>
      </div>

      <StatusSummary total={questions.length} accepted={acceptedIds.size} rejected={rejectedIds.size} />

      <div className="card" style={{ marginTop: 12 }}>
        <div className="section-title">Grading Legend / Bewertung</div>
        <div className="small" style={{ display: "grid", gap: 8 }}>
          <div><span className="tag ok" style={{ marginRight: 8 }}></span> ≥ 90% — Final Grade 1: Sehr gut (green)</div>
          <div><span className="tag warn" style={{ marginRight: 8 }}></span> 78–89% — Gut (orange)</div>
          <div><span className="tag blue" style={{ marginRight: 8 }}></span> 65–77% — Befriedigend (blue)</div>
          <div><span className="tag purple" style={{ marginRight: 8 }}></span> 50–64% — Genügend (purple)</div>
          <div><span className="tag bad" style={{ marginRight: 8 }}></span> &lt; 50% — Nicht Genügend (red)</div>
        </div>
      </div>

      {aggregate.max > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="section-title">Live Selection Preview</div>
          <div className="small" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{aggregate.pct}%</div>
              <div style={{ marginTop: 4 }}>{aggregate.awarded}/{aggregate.max} points</div>
            </div>
            <div style={{ color: aggregate.grade.color, fontWeight: 600 }}>{aggregate.grade.label}</div>
          </div>
        </div>
      )}

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
            onSelectionChange={handleSelectionChange}
          />
        ))}
        {!questions.length && !loading ? (
          <div className="small">No questions yet. Enter a topic and click Generate.</div>
        ) : null}
      </div>

      <div className="footer">
        <a href="/">← Back to QuestionForge Home</a>
      </div>
    </div>
  );
}
