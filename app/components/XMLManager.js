"use client";

import { useState } from "react";

export default function XMLManager() {
  const [xmlContent, setXmlContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

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
      setXmlContent(event.target.result);
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
          <pre className="xml-content">{xmlContent}</pre>
        </div>
      )}
    </div>
  );
}
