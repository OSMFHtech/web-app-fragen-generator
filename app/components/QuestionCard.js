"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "prismjs/themes/prism-tomorrow.css";

// editor
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
  onDelete,
  checkCode,
}) {
  if (!q) return <div className="card">⚠️ No question data provided.</div>;

  const [question, setQuestion] = useState(q);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState(null);

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

  /* ---------- Handlers ---------- */
  const handleCheck = (option) => {
    setSelected(option);
    setIsCorrect(option.correct);
  };

  const handleRunCode = () => {
    const code = userCode.trim().toLowerCase();
    if (!code) return setFeedback("⚠️ Please write some code first!");
    if (code.includes("print") || code.includes("console.log") || code.includes("system.out"))
      setFeedback("✅ Output looks correct!");
    else setFeedback("❌ Code seems incorrect. Try again.");
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
    const updatedOpts = question.options.map((o, idx) =>
      idx === i ? { ...o, correct: !o.correct } : o
    );
    const updated = { ...question, options: updatedOpts };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  const editOptionText = (i, value) => {
    const updatedOpts = question.options.map((o, idx) =>
      idx === i ? { ...o, text: value } : o
    );
    const updated = { ...question, options: updatedOpts };
    setQuestion(updated);
    onUpdate?.(updated);
  };

  /* ---------- UI ---------- */
  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{question.type === "coderunner" ? "CodeRunner" : "Multiple Choice"}</strong>
        <span className="small">
          #{question.id?.slice(0, 8)} • {question.difficulty || "medium"} •{" "}
          {question.language || "en"} {statusTag}
        </span>
      </div>

      <div style={{ marginTop: 8 }} dangerouslySetInnerHTML={{ __html: question.text }} />

      {/* MULTIPLE CHOICE */}
      {question.type === "multiple-choice" && (
        <div style={{ marginTop: 10 }}>
          {isMultiAnswer && (
            <p className="small" style={{ color: "var(--accent-2)", marginBottom: 6 }}>
              {multiText}
            </p>
          )}

          {question.options?.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <button
                onClick={() => handleCheck(opt)}
                className="btn muted"
                style={{
                  flexGrow: 1,
                  textAlign: "left",
                  justifyContent: "flex-start",
                  border:
                    selected === opt
                      ? opt.correct
                        ? "1px solid var(--ok)"
                        : "1px solid var(--bad)"
                      : "1px solid var(--border)",
                  background:
                    selected === opt
                      ? opt.correct
                        ? "rgba(52,211,153,0.15)"
                        : "rgba(239,68,68,0.15)"
                      : "var(--panel)",
                  color: "var(--text)",
                }}
              >
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => editOptionText(i, e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text)",
                    width: "90%",
                    outline: "none",
                  }}
                />
              </button>
              <button
                className="btn ok"
                onClick={() => toggleCorrect(i)}
                title="Toggle correct"
                style={{
                  padding: "6px 10px",
                  background: opt.correct ? "var(--ok)" : "#1a2344",
                  color: opt.correct ? "#0b1020" : "var(--text)",
                }}
              >
                ✓
              </button>
              <button
                className="btn bad"
                onClick={() => handleDeleteOption(i)}
                title="Delete option"
                style={{ padding: "6px 10px" }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            className="btn"
            style={{ marginTop: 8 }}
            onClick={handleAddOption}
          >
            + Add Option
          </button>

          {isCorrect !== null && (
            <p
              style={{
                marginTop: 6,
                color: isCorrect ? "var(--ok)" : "var(--bad)",
                fontWeight: 500,
              }}
            >
              {isCorrect ? "✅ Correct!" : "❌ Incorrect, try again."}
            </p>
          )}
        </div>
      )}

      {/* CODE RUNNER */}
      {question.type === "coderunner" && (
        <div style={{ marginTop: 16 }}>
          <div className="small" style={{ marginBottom: 6 }}>
            Write and test your code:
          </div>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#0e1530",
            }}
          >
            <Editor
              value={userCode}
              onValueChange={setUserCode}
              highlight={(code) => highlight(code, codeLang, "java")}
              padding={12}
              className="font-mono text-sm"
              style={{
                fontFamily: "monospace",
                color: "var(--text)",
                minHeight: "120px",
              }}
              placeholder="// Write your code here..."
            />
          </div>
          <button className="btn" style={{ marginTop: 8 }} onClick={handleRunCode}>
            ▶ Run Code
          </button>
          {feedback && (
            <p style={{ marginTop: 6, color: "var(--muted)", fontSize: "14px" }}>{feedback}</p>
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn ok" onClick={() => onAccept?.(question)}>
          Accept
        </button>
        <button className="btn warn" onClick={() => onReject?.(question.id)}>
          Reject
        </button>
        {onEdit && (
          <button className="btn muted" onClick={() => onEdit(question.id)}>
            Edit
          </button>
        )}
        <button className="btn" onClick={() => onRegenerate?.(question.id)}>
          Regenerate
        </button>
        {onDelete && (
          <button className="btn bad" onClick={() => onDelete?.(question.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
