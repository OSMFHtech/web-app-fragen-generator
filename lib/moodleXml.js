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

  const stripCtl = (s='') => (s || '').replace(/[\u0000-\u001F]+/g, '').trim();

  const items = questions.map((q, idx) => {
    const name = `Q${idx+1}-${q.type || 'question'}`;

    const getMaxPoints = (qq) => {
      const diff = (qq?.difficulty || "medium").toLowerCase();
      if (diff === "easy") return 0.5;
      if (diff === "hard") return 2;
      return 1;
    };

    const maxPoints = getMaxPoints(q);

    if ((q.type||'multiple-choice') === 'multiple-choice') {
      const opts = q.options || [];
      const C = opts.filter((o) => o.correct).length || 0;
      const choices = opts.map((opt, i) => {
        let fraction = 0;
        if (C <= 1) fraction = opt.correct ? 100 : 0;
        else fraction = (opt.correct ? (100 / C) : 0);
        return `<answer fraction="${fraction}"><text>${esc(opt.text)}</text></answer>`;
      }).join("");

      return `
      <question type="multichoice">
        <name><text>${esc(name)}</text></name>
        <defaultgrade>${maxPoints}</defaultgrade>
        <questiontext format="html"><text><![CDATA[${q.text}]]></text></questiontext>
        <single>${C <= 1 ? 'true' : 'false'}</single>
        <shuffleanswers>true</shuffleanswers>
        <answernumbering>abc</answernumbering>
        ${choices}
      </question>`;
    }

    // CodeRunner: export as essay-only so submissions are always manual
    // (lecturer must grade). Provide a larger response area using
    // <responsefieldlines> and include reference in <graderinfo>.
    if (q.type === 'coderunner') {
      const manualName = `${name}`;
      return `
      <question type="essay">
        <name><text>${esc(manualName)}</text></name>
        <defaultgrade>${maxPoints}</defaultgrade>
        <questiontext format="html"><text><![CDATA[${q.text}]]></text></questiontext>
        <generalfeedback>
          <text><![CDATA[Reference solution:
${q.answer || ""}]]></text>
        </generalfeedback>
        <graderinfo>
          <text><![CDATA[Reference solution for lecturer:\n${q.answer || ""}]]></text>
        </graderinfo>
        <responseformat>editor</responseformat>
        <responsefieldlines>15</responsefieldlines>
        <attachments>0</attachments>
      </question>`;
    }

    // Select-and-drag: export as ddwtos using <dragbox> + <dropzone>
    // Use the dropzone format which your Moodle accepts — this emits
    // explicit <dragbox> items and matching <dropzone dragitem="N"/>
    // entries. The question text uses [[1]] tokens for drop positions.
    if (q.type === 'select-and-drag') {
      const blanks = q.blanks || (Array.isArray(q.mapping) ? q.mapping.length : 0) || 0;
      const options = Array.isArray(q.options) ? q.options : [];
      const mapping = Array.isArray(q.mapping) ? q.mapping : [];
      let qtext = stripCtl(q.text || '');

      // Normalize placeholders: prefer [[1]] style used by Moodle dropzone.
      for (let i = 0; i < blanks; i++) {
        const square = `[[${i + 1}]]`;
        const paren = `(${i + 1})`;
        if (qtext.includes(paren) && !qtext.includes(square)) {
          qtext = qtext.replace(paren, square);
        }
      }
      // If no placeholders found, append numbered placeholders
      if (!qtext.includes('[[')) {
        const appended = Array.from({ length: blanks }).map((_, i) => `[[${i+1}]]`).join(' ');
        qtext = (qtext || 'Fill in the blanks:') + ' ' + appended;
      }

      // Build dragbox XML (one per option)
      const dragboxXml = options.length
        ? options.map(o => `\n        <dragbox>\n          <text>${esc((o.text || '').trim())}</text>\n        </dragbox>`).join('')
        : '';

      // Build dropzone XML using mapping: dropzone dragitem indexes are 1-based
      const dropzoneXml = Array.from({ length: blanks }).map((_, i) => {
        const correctIdx = mapping[i] != null ? mapping[i] : null;
        const dragitem = correctIdx != null ? (correctIdx + 1) : 0;
        return `\n        <dropzone dragitem="${dragitem}" />`;
      }).join('');

      // Human readable mapping for generalfeedback
      const mappingLines = Array.from({ length: blanks }).map((_, i) => {
        const correctIdx = mapping[i] != null ? mapping[i] : null;
        const correctText = correctIdx != null && options[correctIdx] ? (options[correctIdx].text || '').trim() : '';
        return `(${i+1}) ${correctText}`;
      }).join('\n');
      const generalFeedbackXml = `\n        <generalfeedback><text><![CDATA[${mappingLines}]]></text></generalfeedback>`;

      // Per-blank readable answers
      const answers = Array.from({ length: blanks }).map((_, i) => {
        const correctIdx = mapping[i] != null ? mapping[i] : null;
        const correctText = correctIdx != null && options[correctIdx] ? (options[correctIdx].text || '').trim() : '';
        return `<answer fraction="100"><text><![CDATA[(${i+1}) ${esc(correctText)}]]></text></answer>`;
      }).join('\n        ');

      const max = Math.max(0.5, blanks * 0.5);
      const mainQ = `<![CDATA[${qtext}]]>`;

      const ddwtosQuestion = `\n      <question type="ddwtos">\n        <name><text>${esc(name)}</text></name>\n        <defaultgrade>${max}</defaultgrade>\n        <questiontext format="html"><text>${mainQ}</text></questiontext>${generalFeedbackXml}\n        <shuffleanswers>true</shuffleanswers>\n        ${dragboxXml}\n        ${dropzoneXml}\n        ${answers}\n      </question>`;

      return ddwtosQuestion;
    }

    if (q.type === 'list-options') {
      const defs = Array.isArray(q.definitions) ? q.definitions : [];
      const per = 0.5;
      const max = defs.length * per;
      const mapping = Array.isArray(q.mapping) ? q.mapping : [];
      const options = Array.isArray(q.options) ? q.options : [];

      // Build an HTML list of options for clarity in the question body
      const optionsHtml = options.length
        ? '<ul>' + options.map(o => `<li>${esc(o.text || '')}</li>`).join('') + '</ul>'
        : '';

      const subqs = defs.map((d, i) => {
        const correctIdx = mapping[i] != null ? mapping[i] : null;
        const correctText = correctIdx != null && options[correctIdx] ? options[correctIdx].text : '';
        return `<subquestion>\n          <text><![CDATA[${d}]]></text>\n          <answer><text><![CDATA[${correctText}]]></text></answer>\n        </subquestion>`;
      }).join('\n');

      const mainQ = `<![CDATA[Select the correct match for each definition.<br/><br/>Available options:${optionsHtml}]]>`;

      return `\n      <question type="matching">\n        <name><text>${esc(name)}</text></name>\n        <defaultgrade>${max}</defaultgrade>\n        <questiontext format="html"><text>${mainQ}</text></questiontext>\n        <generalfeedback><text></text></generalfeedback>\n        <shuffleanswers>true</shuffleanswers>\n        ${subqs}\n      </question>`;
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
