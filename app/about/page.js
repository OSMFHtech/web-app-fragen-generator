"use client";

import Header from "../components/Header";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("vision");
  const { t } = useLanguage();

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="about-page">
        <div className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">{t("aboutTitle")}</h1>
            <p className="about-subtitle">
              {t("aboutSubtitle")}
            </p>
          </div>
        </div>

        <div className="about-container">
          <div className="about-tabs">
            <button
              className={`tab-btn ${activeSection === "vision" ? "active" : ""}`}
              onClick={() => setActiveSection("vision")}
            >
              {t("visionTab")}
            </button>
            <button
              className={`tab-btn ${activeSection === "mission" ? "active" : ""}`}
              onClick={() => setActiveSection("mission")}
            >
              {t("missionTab")}
            </button>
            <button
              className={`tab-btn ${activeSection === "team" ? "active" : ""}`}
              onClick={() => setActiveSection("team")}
            >
              {t("teamTab")}
            </button>
          </div>

          <div className="about-content">
            {activeSection === "vision" && (
              <div className="content-section vision-section">
                <h2>{t("vision")}</h2>
                <p>
                  {t("visionIntro")}
                </p>
                
                <div className="vision-cards">
                  <div className="vision-card challenge-card">
                    <svg className="vision-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                      <path d="M12 8v4m0 2v2m-2-6h4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>{t("theChallenge")}</h3>
                    <p>
                      {t("challengeText")}
                    </p>
                  </div>

                  <div className="vision-card solution-card">
                    <svg className="vision-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path d="M9.5 11l2 2 4-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>{t("ourSolution")}</h3>
                    <p>
                      {t("solutionText")}
                    </p>
                  </div>

                  <div className="vision-card value-card">
                    <svg className="vision-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path d="M12 6v6m0 2v2m-3-5h6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3>{t("facultyValue")}</h3>
                    <p>
                      {t("facultyValueText")}
                    </p>
                  </div>
                </div>

                <div className="tech-info">
                  <h3>{t("technicalApproach")}</h3>
                  <ul>
                    <li>{t("smartBatching")}</li>
                    <li>{t("humanInLoop")}</li>
                    <li>{t("flexibleAI")}</li>
                    <li>{t("moodleReady")}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "mission" && (
              <div className="content-section mission-section">
                <h2>{t("ourMission")}</h2>
                <p className="mission-intro">
                  {t("missionIntro")}
                </p>

                <div className="mission-pillars">
                  <div className="pillar">
                    <span className="pillar-number">01</span>
                    <div>
                      <h3>{t("qualityFirst")}</h3>
                      <p>{t("qualityDesc")}</p>
                    </div>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">02</span>
                    <div>
                      <h3>{t("efficiencyTitle")}</h3>
                      <p>{t("efficiencyDesc")}</p>
                    </div>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">03</span>
                    <div>
                      <h3>{t("accessibilityTitle")}</h3>
                      <p>{t("accessibilityDesc")}</p>
                    </div>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">04</span>
                    <div>
                      <h3>{t("continuousTitle")}</h3>
                      <p>{t("continuousDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "team" && (
              <div className="content-section team-section">
                <h2>{t("ourTeam")}</h2>
                <p className="team-intro">
                  {t("teamIntro")}
                </p>

                <div className="team-grid">
                  <div className="team-card">
                    <div className="team-avatar">
                      <span className="avatar-text">CR</span>
                    </div>
                    <h3>Christoph Redl</h3>
                    <p className="team-role">{t("projectSupervisor")}</p>
                    <p className="team-dept">FH Technikum Wien</p>
                    <a href="mailto:redlch@technikum-wien.at" className="team-email">
                      redlch@technikum-wien.at
                    </a>
                  </div>

                  <div className="team-card">
                    <div className="team-avatar">
                      <span className="avatar-text">FS</span>
                    </div>
                    <h3>ForgeEd Solutions</h3>
                    <p className="team-role">{t("developmentTeam")}</p>
                    <p className="team-dept">{t("aiDataAnalytics")}</p>
                    <p className="team-desc">
                      {t("dedicatedTeam")}
                    </p>
                  </div>
                </div>

                <div className="tech-stack">
                  <h3>{t("techAndSkills")}</h3>
                  <div className="tech-tags">
                    <span className="tech-tag">Next.js 14</span>
                    <span className="tech-tag">React</span>
                    <span className="tech-tag">Node.js</span>
                    <span className="tech-tag">OpenRouter API</span>
                    <span className="tech-tag">Moodle XML</span>
                    <span className="tech-tag">Web Development</span>
                    <span className="tech-tag">LLM Integration</span>
                  </div>
                  <p className="tech-note">
                    <strong>{t("techNote").split(":")[0]}:</strong> {t("techNote").split(": ")[1]}
                  </p>
                </div>
              </div>
            )}
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
