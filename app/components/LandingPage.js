"use client";

import Header from "./Header";

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <Header />
      
      {/* Hero Section */}
      <div className="hero-section">
            <div className="hero-content">
                <div className="hero-logo-container">
                    <img
                        src="/pic/QuestionForge.jpg"
                        alt="QuestionForge Logo"
                        className="hero-logo"
                    />
                </div>
                <h1 className="hero-title">QuestionForge</h1>
                <p className="hero-subtitle">
                    AI-Assisted Question Bank Generation for Moodle
                </p>
                <p className="hero-description">
                    Your journey to mastering question creation starts here. Empower your teaching with AI-assisted generation and human review.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        window.location.href = "/generator";
                    }}
                >
                    Get Started with Question Generator
                </button>
            </div>
        </div>

        {/* Purpose Section */}
        <div className="purpose-section">
            <div className="purpose-card">
                <p style={{ lineHeight: "1.7", margin: "0" }}>
                    <strong style={{ color: "#2563eb", fontWeight: "700" }}>QuestionForge</strong> empowers educators to efficiently create Moodle-compatible question banks by seamlessly combining AI-assisted generation with rigorous human review. Every AI-generated question undergoes comprehensive validation before classroom deployment, ensuring pedagogical quality while reducing manual workload and maintaining complete transparency and control.
                </p>
            </div>
        </div>

        {/* Workflow Section */}
        <div className="workflow-section">
            <div className="container">
                <h2 className="section-heading">Workflow Overview</h2>
                
                <div className="workflow-grid">
                    <div className="workflow-step">
                        <div className="workflow-icon setup-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1"/><path d="M12 1v6m0 6v6"/><path d="M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24"/><path d="M1 12h6m6 0h6"/><path d="M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24"/>
                            </svg>
                        </div>
                        <h3>Generation Setup</h3>
                        <p className="small">
                            Define topic, language, difficulty level, question type, and quantity.
                        </p>
                    </div>

                    <div className="workflow-step">
                        <div className="workflow-icon generate-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <h3>AI-Assisted Generation</h3>
                        <p className="small">
                            Questions are generated in controlled batches to avoid context loss.
                        </p>
                    </div>

                    <div className="workflow-step">
                        <div className="workflow-icon review-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4M7 20H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2M9 7a2 2 0 014 0m0 0a2 2 0 014 0m-4 0V5a2 2 0 014 0"/>
                            </svg>
                        </div>
                        <h3>Review & Curation</h3>
                        <p className="small">
                            Lecturers approve, edit, or discard each generated question.
                        </p>
                    </div>

                    <div className="workflow-step">
                        <div className="workflow-icon export-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                        </div>
                        <h3>Moodle XML Export</h3>
                        <p className="small">
                            Only approved questions are exported for Moodle import.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
            <div className="container">
                <h2 className="section-heading">Why QuestionForge?</h2>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.253s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z"/>
                            </svg>
                        </div>
                        <h3>Extensive Resources</h3>
                        <p className="small">
                            Access a comprehensive toolkit for question generation with support for multiple question types and languages.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <h3>Organized Planning</h3>
                        <p className="small">
                            Structured review workflows with batch management and question curation tools for efficient assessment design.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><path d="M10 12v4M14 12v4"/>
                            </svg>
                        </div>
                        <h3>Track Your Progress</h3>
                        <p className="small">
                            Monitor question creation metrics and track your assessment development with real-time feedback.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="/" className="footer-link home-link">HOME</a>
              <a href="/about" className="footer-link about-link">ABOUT US</a>
              <a href="/contact" className="footer-link contact-link">CONTACT</a>
            </div>
            <div className="footer-text">
              <strong>© 2025 QuestionForge · Developed by ForgeEd Solutions Team 7</strong>
            </div>
            <div className="footer-subtext">
              University of Applied Sciences Technikum Wien · For academic use only
            </div>
          </div>
        </footer>
      </div>
    );
}
