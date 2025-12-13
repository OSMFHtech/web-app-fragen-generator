"use client";

import Header from "../components/Header";
import { useState } from "react";

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("vision");

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="about-page">
        <div className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">About ForgeEd Solutions</h1>
            <p className="about-subtitle">
              Empowering Education Through AI-Driven Innovation
            </p>
          </div>
        </div>

        <div className="about-container">
          <div className="about-tabs">
            <button
              className={`tab-btn ${activeSection === "vision" ? "active" : ""}`}
              onClick={() => setActiveSection("vision")}
            >
              Our Vision
            </button>
            <button
              className={`tab-btn ${activeSection === "mission" ? "active" : ""}`}
              onClick={() => setActiveSection("mission")}
            >
              Our Mission
            </button>
            <button
              className={`tab-btn ${activeSection === "team" ? "active" : ""}`}
              onClick={() => setActiveSection("team")}
            >
              Our Team
            </button>
          </div>

          <div className="about-content">
            {activeSection === "vision" && (
              <div className="content-section vision-section">
                <h2>Vision</h2>
                <p>
                  QuestionForge aims to revolutionize the way educators create assessment materials
                  by leveraging cutting-edge AI technology. Our Web-App sits on top of AI-Tools,
                  supporting the automated generation of question banks for Moodle and other
                  learning management systems.
                </p>
                
                <div className="vision-cards">
                  <div className="vision-card">
                    <div className="vision-icon">🎯</div>
                    <h3>The Challenge</h3>
                    <p>
                      Manual question generation is time-consuming. Moodle courses require extensive
                      question banks for self-assessment and official tests. Direct use of AI tools
                      like ChatGPT faces limitations: context window constraints cause topic drift,
                      forgotten constraints, and quality issues requiring human review.
                    </p>
                  </div>

                  <div className="vision-card">
                    <div className="vision-icon">💡</div>
                    <h3>Our Solution</h3>
                    <p>
                      QuestionForge internally prompts AI as needed, making multiple calls to avoid
                      context exhaustion. Results are presented in an intuitive UI for human
                      evaluation. Approved questions are exported in Moodle's XML format, ensuring
                      quality while dramatically reducing manual workload.
                    </p>
                  </div>

                  <div className="vision-card">
                    <div className="vision-icon">🏆</div>
                    <h3>Faculty Value</h3>
                    <p>
                      Our tool enables more efficient course development, allowing educators to focus
                      on teaching rather than tedious question creation. Every generated question
                      undergoes comprehensive validation before classroom deployment, ensuring
                      pedagogical quality while maintaining complete transparency and control.
                    </p>
                  </div>
                </div>

                <div className="tech-info">
                  <h3>Technical Approach</h3>
                  <ul>
                    <li>
                      <strong>Smart Batching:</strong> Questions generated in controlled batches to
                      prevent AI context loss
                    </li>
                    <li>
                      <strong>Human-in-the-Loop:</strong> Structured review workflow for quality
                      assurance
                    </li>
                    <li>
                      <strong>Flexible AI Integration:</strong> Works with existing AI tools via web
                      interfaces - no AI expertise needed
                    </li>
                    <li>
                      <strong>Moodle-Ready Export:</strong> Direct XML output for seamless LMS
                      integration
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === "mission" && (
              <div className="content-section mission-section">
                <h2>Our Mission</h2>
                <p className="mission-intro">
                  At ForgeEd Solutions, we are committed to bridging the gap between cutting-edge
                  AI technology and practical educational needs. Our mission encompasses:
                </p>

                <div className="mission-pillars">
                  <div className="pillar">
                    <span className="pillar-number">01</span>
                    <h3>Quality First</h3>
                    <p>
                      Ensure every AI-generated question undergoes rigorous human review before
                      deployment. We believe in AI as an assistant, not a replacement for educator
                      expertise.
                    </p>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">02</span>
                    <h3>Efficiency Through Innovation</h3>
                    <p>
                      Reduce manual workload by 70% while maintaining full transparency and control.
                      Educators should spend time teaching, not writing hundreds of test questions.
                    </p>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">03</span>
                    <h3>Accessibility & Ease of Use</h3>
                    <p>
                      Build web-based tools that require minimal technical knowledge. No AI expertise
                      needed - just your domain knowledge and teaching goals.
                    </p>
                  </div>

                  <div className="pillar">
                    <span className="pillar-number">04</span>
                    <h3>Continuous Improvement</h3>
                    <p>
                      Listen to educator feedback and iterate rapidly. Our platform evolves with the
                      needs of the academic community we serve.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "team" && (
              <div className="content-section team-section">
                <h2>Our Team</h2>
                <p className="team-intro">
                  QuestionForge is developed under the organizational and thematic responsibility of
                  the <strong>KF Artificial Intelligence & Data Analytics</strong> department at FH
                  Technikum Wien.
                </p>

                <div className="team-grid">
                  <div className="team-card">
                    <div className="team-avatar">
                      <span className="avatar-text">CR</span>
                    </div>
                    <h3>Christoph Redl</h3>
                    <p className="team-role">Project Supervisor</p>
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
                    <p className="team-role">Development Team</p>
                    <p className="team-dept">AI & Data Analytics</p>
                    <p className="team-desc">
                      Dedicated to building innovative educational tools
                    </p>
                  </div>
                </div>

                <div className="tech-stack">
                  <h3>Technologies & Skills</h3>
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
                    <strong>Note:</strong> No deep AI expertise required - we leverage existing AI
                    tools through web interfaces, focusing on practical application development.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
