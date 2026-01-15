"use client";

import { useState } from "react";

// Syntax highlighter for XML
function highlightXML(xml) {
  const lines = xml.split("\n");
  
  return lines.map((line, idx) => {
    // Split line into tokens
    const tokens = [];
    let remaining = line;
    let pos = 0;

    while (remaining) {
      // Match XML tag start
      const tagMatch = remaining.match(/^(<[^>]*>)/);
      if (tagMatch) {
        const tag = tagMatch[1];
        tokens.push({ type: "tag", content: tag });
        remaining = remaining.slice(tag.length);
        continue;
      }

      // Match text content (anything before next tag)
      const textMatch = remaining.match(/^([^<]+)/);
      if (textMatch) {
        const text = textMatch[1];
        tokens.push({ type: "text", content: text });
        remaining = remaining.slice(text.length);
        continue;
      }

      // Fallback
      tokens.push({ type: "text", content: remaining });
      break;
    }

    // Process tags further to highlight attributes and values
    const processed = tokens.map((token) => {
      if (token.type === "tag") {
        return highlightTag(token.content);
      }
      return token;
    });

    return { lineNum: idx + 1, tokens: processed };
  });
}

// Highlight individual tag: split into < > and internals
function highlightTag(tag) {
  const tokens = [];
  
  // Extract < and >
  const match = tag.match(/^(<)(.*?)(>)$/);
  if (!match) return { type: "tag", content: tag };

  const [, open, inner, close] = match;
  tokens.push({ type: "bracket", content: open });

  // Process inner content: tag name, attributes
  let remaining = inner.trim();
  
  // Extract tag name or closing slash
  const nameMatch = remaining.match(/^(\/?[\w:]+)/);
  if (nameMatch) {
    tokens.push({ type: "tagname", content: nameMatch[1] });
    remaining = remaining.slice(nameMatch[1].length).trim();
  }

  // Extract attributes: name="value"
  const attrRegex = /([\w:]+)="([^"]*)"/g;
  let lastIdx = 0;
  let attrMatch;

  while ((attrMatch = attrRegex.exec(remaining)) !== null) {
    // Text before attribute
    if (attrMatch.index > lastIdx) {
      tokens.push({ type: "text", content: remaining.slice(lastIdx, attrMatch.index) });
    }

    // Attribute name
    tokens.push({ type: "attr", content: attrMatch[1] });
    tokens.push({ type: "text", content: "=" });

    // Quoted value
    tokens.push({ type: "text", content: '"' });
    tokens.push({ type: "value", content: attrMatch[2] });
    tokens.push({ type: "text", content: '"' });

    lastIdx = attrRegex.lastIndex;
  }

  // Remaining text (self-closing slash, whitespace)
  if (lastIdx < remaining.length) {
    tokens.push({ type: "text", content: remaining.slice(lastIdx) });
  }

  tokens.push({ type: "bracket", content: close });

  return { type: "tag-parts", tokens };
}

// Render highlighted line
function renderLine(line) {
  return (
    <div key={line.lineNum} className="xml-line">
      <span className="xml-line-num">{line.lineNum}</span>
      <span className="xml-line-content">
        {line.tokens.map((token, idx) => renderToken(token, idx))}
      </span>
    </div>
  );
}

function renderToken(token, idx) {
  if (token.type === "tag-parts") {
    return (
      <span key={idx}>
        {token.tokens.map((t, i) => renderToken(t, i))}
      </span>
    );
  }

  switch (token.type) {
    case "bracket":
      return <span key={idx} className="xml-bracket">{token.content}</span>;
    case "tagname":
      return <span key={idx} className="xml-tagname">{token.content}</span>;
    case "attr":
      return <span key={idx} className="xml-attr">{token.content}</span>;
    case "value":
      return <span key={idx} className="xml-value">{token.content}</span>;
    case "text":
      return <span key={idx} className="xml-text">{token.content}</span>;
    default:
      return <span key={idx}>{token.content}</span>;
  }
}

export default function XMLManager() {
  const [xmlContent, setXmlContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [highlightedLines, setHighlightedLines] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xml")) {
      setError("Please select an XML file");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;
      setXmlContent(content);
      setHighlightedLines(highlightXML(content));
      setError("");
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const clearFile = () => {
    setXmlContent("");
    setFileName("");
    setError("");
    setHighlightedLines([]);
  };


  return (
    <div className="xml-manager">
      <div className="xml-manager-header">
        <h3>📄 XML File Manager</h3>
        <p className="xml-subtitle">Upload and preview Moodle XML files</p>
      </div>

      <div className="xml-upload-area">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileUpload}
          className="xml-file-input"
          id="xml-file-input"
        />
        <label htmlFor="xml-file-input" className="xml-upload-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Choose XML File</span>
        </label>

        {fileName && (
          <div className="xml-file-info">
            <span className="xml-file-name">📎 {fileName}</span>
            <button onClick={clearFile} className="xml-clear-btn">
              ✕
            </button>
          </div>
        )}

        {error && <div className="xml-error">{error}</div>}
      </div>

      {xmlContent && (
        <div className="xml-preview">
          <div className="xml-preview-header">
            <span>Preview</span>
            <span className="xml-line-count">
              {xmlContent.split("\n").length} lines
            </span>
          </div>
          <div className="xml-highlight">
            {highlightedLines.map(renderLine)}
          </div>
        </div>
      )}
    </div>
  );
}
