"use client";

import Header from "../components/Header";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "message") {
      if (value.length <= 1000) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setCharCount(value.length);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:wi22b047@technikum-wien.at?subject=${encodeURIComponent(`QuestionForge Contact: ${formData.subject}`)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\nSubject: ${formData.subject}\n\n${formData.message}`)}`;
    
    window.location.href = mailtoLink;
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setCharCount(0);
    setStatus("success");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="page-wrapper">
      <Header />

      <div className="contact-page">
        <div className="contact-hero">
          <div className="contact-hero-content">
            <h1 className="contact-title">{t("getInTouch")}</h1>
            <p className="contact-subtitle">
              {t("suggestionsSubtitle")}
            </p>
          </div>
        </div>

        <div className="contact-container">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon email-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3>{t("emailUs")}</h3>
                <p>wi22b047@technikum-wien.at</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon feedback-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3>{t("weValueInput")}</h3>
                <p>
                  {t("inputDesc")}
                </p>
              </div>

              <div className="contact-card">
                <div className="contact-icon hours-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>{t("responseTime")}</h3>
                <p>{t("responseTimeDesc")}</p>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">{t("yourName")}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder={t("namePlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t("yourEmail")}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t("subject")}</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">{t("selectTopic")}</option>
                    <option value="feature">{t("featureRequest")}</option>
                    <option value="improvement">{t("improvementSuggestion")}</option>
                    <option value="bug">{t("bugReport")}</option>
                    <option value="feedback">{t("generalFeedback")}</option>
                    <option value="other">{t("other")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    {t("message")}
                    <span className="char-counter">
                      {charCount}/1000
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                    placeholder={t("messagePlaceholder")}
                    rows="8"
                  />
                </div>

                <button
                  type="submit"
                  className="form-submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? t("sending") : t("send")}
                </button>

                {status === "success" && (
                  <div className="form-message success">
                    ✓ {t("successMessage")}
                  </div>
                )}
                {status === "error" && (
                  <div className="form-message error">
                    ✗ Sorry, something went wrong. Please try again or email us directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="/" className="footer-link home-link">{t("home")}</a>
              <a href="/about" className="footer-link about-link">{t("aboutUs").toUpperCase()}</a>
              <a href="/contact" className="footer-link contact-link">{t("contact").toUpperCase()}</a>
            </div>
            <div className="footer-text">
              <strong>{t("footerText")}</strong>
            </div>
            <div className="footer-subtext">
              {t("footerSubtext")}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
