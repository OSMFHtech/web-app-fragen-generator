/**
 * Build Moodle XML string from accepted questions.
 * Supports 'multiple-choice' and 'coderunner' (short-answer-like wrapper).
 * Each question: { id, type, text, options?: [{text, correct}], answer?: string, language?: 'en'|'de', difficulty?: 'easy'|'medium'|'hard' }
 */
export function buildMoodleXml(questions) {
  const esc = (s='') => (s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  );

  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>`;
  const footer = `</quiz>`;

  const items = questions.map((q, idx) => {
    const name = `Q${idx+1}-${q.type || 'question'}`;

    if ((q.type||'multiple-choice') === 'multiple-choice') {
      const choices = (q.options||[]).map(opt => {
        const fraction = opt.correct ? "100" : "0";
        return `<answer fraction="${fraction}"><text>${esc(opt.text)}</text></answer>`;
      }).join("");

      return `
      <question type="multichoice">
        <name><text>${esc(name)}</text></name>
        <questiontext format="html"><text><![CDATA[${q.text}]]></text></questiontext>
        <single>true</single>
        <shuffleanswers>true</shuffleanswers>
        <answernumbering>abc</answernumbering>
        ${choices}
      </question>`;
    }

    // CodeRunner: wrap as shortanswer with template comment (simple demo)
    if (q.type === 'coderunner') {
      return `
      <question type="shortanswer">
        <name><text>${esc(name)}</text></name>
        <questiontext format="html"><text><![CDATA[${q.text}]]></text></questiontext>
        <answer fraction="100"><text>${esc(q.answer || "")}</text></answer>
        <generalfeedback>
          <text>CodeRunner placeholder – replace with specific question type in Moodle if needed.</text>
        </generalfeedback>
      </question>`;
    }

    // fallback
    return `
    <question type="essay">
      <name><text>${esc(name)}</text></name>
      <questiontext format="html"><text><![CDATA[${q.text}]]></text></questiontext>
    </question>`;
  }).join("\n");

  return [header, items, footer].join("\n");
}

/** Trigger a browser download */
export function download(filename, content, mime="application/xml") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
