"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "prismjs/themes/prism-tomorrow.css";

// Editor
const Editor = dynamic(() => import("react-simple-code-editor"), { ssr: false });

// Prism
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";

export default function QuestionCard({
  q,
  status,
  onAccept,
  onReject,
  onEdit,
  onRegenerate,
  onUpdate,
  onSelectionChange,
  onDelete,
}) {
  if (!q) return <div className="card">⚠️ No question data provided.</div>;

  const [question, setQuestion] = useState(q);
  const [selected, setSelected] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [isCorrect, setIsCorrect] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [revealAnswers, setRevealAnswers] = useState(false);
  // select-and-drag state: placements array of length blanks (indices of options or null)
  const [placements, setPlacements] = useState(() => {
    if (q.type === 'select-and-drag') return Array(q.blanks || 3).fill(null);
    return [];
  });
  // list-options state: selection per definition
  const [listSelections, setListSelections] = useState(() => {
    if (q.type === 'list-options') return Array((q.definitions || []).length).fill(null);
    return [];
  });

  const codeLang =
    question.language === "python"
      ? languages.python
      : question.language === "java"
      ? languages.java
      : languages.javascript;

  const statusTag =
    status === "accepted" ? (
      <span className="tag ok">accepted</span>
    ) : status === "rejected" ? (
      <span className="tag bad">rejected</span>
    ) : (
      <span className="tag warn">open</span>
    );

  /* ---------- Multi-answer label ---------- */
  const correctCount = question.options?.filter((o) => o.correct).length || 0;
  const isMultiAnswer = correctCount > 1;
  const multiText =
    question.language === "fr"
      ? "(plusieurs réponses possibles)"
      : question.language === "es"
      ? "(múltiples respuestas posibles)"
      : "(multiple answers possible)";

  /* ---------- Handlers / scoring ---------- */
  const getMaxPoints = (q) => {
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
    return 1; // medium
  };

  const pointsLabel = (q) => (q?.language === "de" ? "punkte" : "points");

  const computeAwardedPoints = (q, selectedOption, llmCorrect = null) => {
    const max = getMaxPoints(q);
    if (q.type === "coderunner") {
      if (llmCorrect === null) return null;
      return llmCorrect ? max : 0;
    }
    // multiple-choice
    const opts = q.options || [];
    const C = opts.filter((o) => o.correct).length || 0;
    if (C <= 1) {
      return selectedOption ? (selectedOption.correct ? max : 0) : null;
    }
    // single selection treated as single-correct selection
    if (!selectedOption) return null;
    const correctSelected = selectedOption.correct ? 1 : 0;
    return (correctSelected / C) * max;
  };

  // compute points for a multi-select combination (selectedIndices: Set of option indices)
  const computeMultiSelectPoints = (q, selIdxSet) => {
    const max = getMaxPoints(q);
    const opts = q.options || [];
    const C = opts.filter((o) => o.correct).length || 0;
    if (C === 0) return 0;
    const selected = Array.from(selIdxSet || []);
    const correctSelected = selected.filter((i) => opts[i] && opts[i].correct).length;
    const wrongSelected = selected.filter((i) => opts[i] && !opts[i].correct).length;
    const denom = C + wrongSelected;
    if (denom === 0) return 0;
    const fraction = correctSelected / denom;
    return Math.max(0, Math.min(1, fraction)) * max;
  };

  // single-select handler
  const handleCheck = (option, index) => {
    setSelected(option);
    setIsCorrect(option.correct);
    const pts = computeAwardedPoints(question, option, null);
    if (pts === null) setFeedback(null);
    else {
      const max = getMaxPoints(question);
      const label = pointsLabel(question);
      setFeedback(option.correct ? `✅ Correct — ${pts}/${max} ${label}` : `❌ Incorrect — ${pts}/${max} ${label}`);
    }
    onSelectionChange?.(question.id, { type: "single", indices: [index] });
  };

  const toggleSelectIndex = (i) => {
    const next = new Set(selectedIndices);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelectedIndices(next);
    // compute preview feedback
    const pts = computeMultiSelectPoints(question, next);
    const max = getMaxPoints(question);
    const pct = max > 0 ? Math.round((pts / max) * 100) : 0;
    const { label: gradeLabel, color: gradeColor } = getGradeFromPercent(pct);
    const label = pointsLabel(question);
    setFeedback(`${pct}% — ${pts}/${max} ${label} — ${gradeLabel}`);
    // report multi selection upward
    onSelectionChange?.(question.id, { type: "multi", indices: Array.from(next) });
  };

  const getGradeFromPercent = (pct) => {
    if (pct >= 90) return { label: "Final Grade 1: Sehr gut", color: "#34d399" }; // green
    if (pct >= 78) return { label: "Gut", color: "#f59e0b" }; // orange
    if (pct >= 65) return { label: "Befriedigend", color: "#60a5fa" }; // blue
    if (pct >= 50) return { label: "Genügend", color: "#a78bfa" }; // purple
    return { label: "Nicht Genügend", color: "#ef4444" }; // red
  };

  /* ---------- Helpers for new types ---------- */
  const computeSelectAndDragPoints = (qq, places) => {
    const perCorrect = 0.5;
    const mapping = qq.mapping || [];
    const blanks = qq.blanks || mapping.length || 0;
    let correct = 0;
    for (let i = 0; i < blanks; i++) {
      if (places && places[i] != null && Number(places[i]) === Number(mapping[i])) correct++;
    }
    const awarded = correct * perCorrect;
    const max = blanks * perCorrect;
    return { awarded, max, correct, blanks };
  };

  const computeListOptionsPoints = (qq, selections) => {
    const perCorrect = 0.5;
    const mapping = qq.mapping || [];
    const defs = qq.definitions || [];
    let correct = 0;
    for (let i = 0; i < defs.length; i++) {
      if (selections && selections[i] != null && Number(selections[i]) === Number(mapping[i])) correct++;
    }
    const awarded = correct * perCorrect;
    const max = defs.length * perCorrect;
    return { awarded, max, correct, blanks: defs.length };
  };

  /* ---------- CodeRunner helper (no automatic LLM checking) ---------- */
  // The project uses a local Helper button for CodeRunner questions instead of
  // automatic LLM correctness checking. The helper reveals the reference
  // solution (the `answer` field) for the question. We intentionally do not
  // call the /api/check-answer endpoint here.
  const showHelper = () => {
    const sol = question.answer || question.expectedAnswer || "";
    if (!sol) {
      setFeedback("ℹ️ No reference solution is available for this question.");
      return;
    }
    // Show the reference solution in the feedback area.
    setFeedback(`🔎 Reference solution:\n${sol}`);
  };

  /* ---------- Option editing ---------- */
  const handleAddOption = () => {
    const newOpt = { text: "New option", correct: false };
    const updated = { ...question, options: [...(question.options || []), newOpt] };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  const handleDeleteOption = (i) => {
    const updated = { ...question, options: question.options.filter((_, idx) => idx !== i) };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  const toggleCorrect = (i) => {
    const updatedOpts = question.options.map((o, idx) => (idx === i ? { ...o, correct: !o.correct } : o));
    const updated = { ...question, options: updatedOpts };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  const editOptionText = (i, value) => {
    const updatedOpts = question.options.map((o, idx) => (idx === i ? { ...o, text: value } : o));
    const updated = { ...question, options: updatedOpts };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  /* ---------- UI ---------- */
  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <strong>{
            question.type === 'coderunner' ? 'CodeRunner'
            : question.type === 'select-and-drag' ? 'Select & Drag'
            : question.type === 'list-options' ? 'Definition Matching'
            : 'Multiple Choice'
          }</strong>
          <div className="small" style={{ marginTop: 4 }}>
            #{question.id?.slice(0, 8)} • {question.difficulty || "medium"} • {question.language || "en"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="small">{statusTag}</div>
          <div className="small" style={{ marginTop: 6 }}>
            {getMaxPoints(question)} {pointsLabel(question)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8 }} dangerouslySetInnerHTML={{ __html: question.text }} />

      {/* MULTIPLE CHOICE */}
      {question.type === "multiple-choice" && (
        <div style={{ marginTop: 10 }}>
          {isMultiAnswer && (
            <p className="small" style={{ color: "var(--accent-2)", marginBottom: 6 }}>{multiText}</p>
          )}

          {question.options?.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {isMultiAnswer ? (
                <label style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                  <input type="checkbox" checked={selectedIndices.has(i)} onChange={() => toggleSelectIndex(i)} style={{ marginRight: 8 }} />
                  <input type="text" value={opt.text} onChange={(e) => editOptionText(i, e.target.value)} style={{ background: "transparent", border: "none", color: "var(--text)", width: "100%", outline: "none" }} />
                </label>
              ) : (
                <button onClick={() => handleCheck(opt, i)} className="btn muted" style={{ flexGrow: 1, textAlign: "left", justifyContent: "flex-start", border: selected === opt ? (opt.correct ? "1px solid var(--ok)" : "1px solid var(--bad)") : "1px solid var(--border)", background: selected === opt ? (opt.correct ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)") : "var(--panel)", color: "var(--text)" }}>
                  <input type="text" value={opt.text} onChange={(e) => editOptionText(i, e.target.value)} style={{ background: "transparent", border: "none", color: "var(--text)", width: "90%", outline: "none" }} />
                </button>
              )}
              <button className="btn ok" onClick={() => toggleCorrect(i)} title="Toggle correct" style={{ padding: "6px 10px", background: opt.correct ? "var(--ok)" : "#1a2344", color: opt.correct ? "#0b1020" : "var(--text)" }}>✓</button>
              <button className="btn bad" onClick={() => handleDeleteOption(i)} title="Delete option" style={{ padding: "6px 10px" }}>✕</button>
            </div>
          ))}

          <button className="btn" style={{ marginTop: 8 }} onClick={handleAddOption}>+ Add Option</button>

          {/* Multi-select live preview */}
          {isMultiAnswer && (
            <div style={{ marginTop: 8, padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "#0e1530" }}>
              {(() => {
                const pts = computeMultiSelectPoints(question, selectedIndices);
                const max = getMaxPoints(question);
                const pct = max > 0 ? Math.round((pts / max) * 100) : 0;
                const grade = getGradeFromPercent(pct);
                return (
                  <div>
                    <div style={{ fontWeight: 600 }}>Preview</div>
                    <div className="small" style={{ marginTop: 6 }}>{pct}% • {pts}/{max} {pointsLabel(question)}</div>
                    <div className="small" style={{ marginTop: 6, color: grade.color }}>{grade.label}</div>
                  </div>
                );
              })()}
            </div>
          )}

          {isCorrect !== null && (
            <p style={{ marginTop: 6, color: isCorrect ? "var(--ok)" : "var(--bad)", fontWeight: 500 }}>{isCorrect ? "✅ Correct!" : "❌ Incorrect, try again."}</p>
          )}
        </div>
      )}

      {/* SELECT AND DRAG */}
      {question.type === 'select-and-drag' && (
        <div style={{ marginTop: 12 }}>
          <div className="small" style={{ marginBottom: 6 }}>Fill the blanks by dragging an answer onto each numbered slot.</div>
          <div style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, background: '#071028' }}>
            <div style={{ marginBottom: 8 }}>
              {/* Render text with blanks as drop targets */}
              {(() => {
                const blanks = question.blanks || question.mapping?.length || 3;
                // split on markers like (1), (2)
                let html = question.text || '';
                // We'll render as React elements below instead of raw html
                return (
                  <div>
                    {String(html).split(/(\(\d+\))/).map((part, idx) => {
                      const m = part.match(/\((\d+)\)/);
                      if (m) {
                        const n = Number(m[1]) - 1;
                        const placed = placements[n];
                        return (
                          <span key={idx} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{
                            const data = e.dataTransfer.getData('text/plain');
                            const optIdx = Number(data);
                            const next = [...placements];
                            next[n] = optIdx;
                            setPlacements(next);
                            const { awarded, max } = computeSelectAndDragPoints(question, next);
                            onSelectionChange?.(question.id, { type: 'select-and-drag', placements: next, awarded, max });
                          }} style={{ display: 'inline-block', minWidth: 120, minHeight: 28, margin: '0 6px', padding: '6px', border: '1px dashed var(--border)', borderRadius: 6, background: placed != null ? 'rgba(99,102,241,0.06)' : 'transparent' }}>{placed != null ? question.options[placed]?.text : `(${m[1]})`}</span>
                        );
                      }
                      return <span key={idx}>{part}</span>;
                    })}
                  </div>
                );
              })()}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Options (drag onto blanks)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {question.options?.map((opt, i) => (
                  <div key={i} draggable onDragStart={(e)=>e.dataTransfer.setData('text/plain', String(i))} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: '#071733', cursor: 'grab' }}>{opt.text}</div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn" onClick={() => { setPlacements(Array(question.blanks || question.mapping?.length || 3).fill(null)); setRevealAnswers(false); setFeedback(null); onSelectionChange?.(question.id, { type: 'select-and-drag', placements: Array(question.blanks || question.mapping?.length || 3).fill(null), awarded: 0, max: (question.blanks||question.mapping?.length||3)*0.5 }); }}>Reset</button>
              <button className="btn muted" onClick={() => { setRevealAnswers(true); const { awarded, max } = computeSelectAndDragPoints(question, placements); setFeedback(`Preview: ${awarded}/${max} points`); onSelectionChange?.(question.id, { type: 'select-and-drag', placements, awarded, max }); }}>Reveal answers</button>
            </div>

            {revealAnswers && (
              <div style={{ marginTop: 8 }} className="small">Correct mapping: { (question.mapping || []).map((mi, idx) => `(${idx+1}) → ${question.options?.[mi]?.text || '—'}`).join(' · ') }</div>
            )}
          </div>
        </div>
      )}

      {/* LIST OPTIONS */}
      {question.type === 'list-options' && (
        <div style={{ marginTop: 12 }}>
          <div className="small" style={{ marginBottom: 6 }}>Select the correct answer for each definition from the dropdown list.</div>
          <div style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, background: '#071028' }}>
            {(question.definitions || []).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1, wordBreak: 'break-word' }}>{d}</div>
                <select style={{ width: 140, minWidth: 140, maxWidth: 140 }} value={listSelections[i] ?? ''} onChange={(e)=>{
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  const next = [...listSelections];
                  next[i] = val;
                  setListSelections(next);
                  const { awarded, max } = computeListOptionsPoints(question, next);
                  onSelectionChange?.(question.id, { type: 'list-options', selections: next, awarded, max });
                }}>
                  <option value="">— choose —</option>
                  {question.options?.map((opt, oi) => (
                    <option key={oi} value={oi}>{opt.text}</option>
                  ))}
                </select>
              </div>
            ))}

            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => { setListSelections(Array((question.definitions||[]).length).fill(null)); onSelectionChange?.(question.id, { type: 'list-options', selections: Array((question.definitions||[]).length).fill(null), awarded: 0, max: (question.definitions||[]).length*0.5 }); }}>Reset</button>
              <button className="btn muted" onClick={() => { setRevealAnswers(true); const { awarded, max } = computeListOptionsPoints(question, listSelections); setFeedback(`Preview: ${awarded}/${max} points`); onSelectionChange?.(question.id, { type: 'list-options', selections: listSelections, awarded, max }); }}>Reveal answers</button>
            </div>

            {revealAnswers && (
              <div style={{ marginTop: 8 }} className="small">Correct mapping: { (question.mapping || []).map((mi, idx) => `(${idx+1}) → ${question.options?.[mi]?.text || '—'}`).join(' · ') }</div>
            )}
          </div>
        </div>
      )}

      {/* CODE RUNNER */}
      {question.type === "coderunner" && (
        <div style={{ marginTop: 16 }}>
          <div className="small" style={{ marginBottom: 6 }}>Write your answer:</div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", background: "#0e1530" }}>
            <Editor value={userCode} onValueChange={setUserCode} highlight={(code) => highlight(code, codeLang, "java")} padding={12} className="font-mono text-sm" style={{ fontFamily: "monospace", color: "var(--text)", minHeight: "120px" }} placeholder="// Write your code here..." />
          </div>
          <button className="btn" style={{ marginTop: 8 }} onClick={showHelper}>🔎 Helper</button>

          {feedback && (
            <p style={{ marginTop: 6, color: isCorrect ? "var(--ok)" : "var(--bad)", fontWeight: 500 }}>{feedback}</p>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn ok" onClick={() => onAccept?.(question)}>Accept</button>
        <button className="btn warn" onClick={() => onReject?.(question.id)}>Reject</button>
        {onEdit && <button className="btn muted" onClick={() => onEdit(question.id)}>Edit</button>}
        <button className="btn" onClick={() => onRegenerate?.(question.id)}>Regenerate</button>
        {onDelete && <button className="btn bad" onClick={() => onDelete?.(question.id)}>Delete</button>}
      </div>
    </div>
  );
}
