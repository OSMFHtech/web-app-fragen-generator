"use client";

import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function SetupPage() {
  const { t, language } = useLanguage();
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="setup-page">
      <Header />
      
      <div className="setup-section">
        <div className="setup-container">
          <h1 className="setup-title">Setup Guide</h1>
          
          {!videoError && (
            <div className="video-wrapper">
              <video 
                width="100%" 
                height="auto" 
                controls 
                className="setup-video"
                style={{
                  maxWidth: "1200px",
                  width: "100%",
                  height: "auto",
                  minHeight: "700px",
                  borderRadius: "16px",
                  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)"
                }}
                onError={() => setVideoError(true)}
              >
                <source src="/Video/Benutzer-Setup.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="setup-description">
            <p>
              {language === 'de' 
                ? "Sehen Sie sich dieses Video an, um zu erfahren, wie Sie QuestionForge zur Generierung von Fragen verwenden."
                : "Watch this video to learn how to set up and use QuestionForge for generating question banks."
              }
            </p>
            
            <div style={{
              marginTop: "32px",
              padding: "20px",
              backgroundColor: "#f0f9ff",
              borderRadius: "12px",
              borderLeft: "4px solid #5aa9ff"
            }}>
              <p style={{ 
                margin: "0 0 16px 0", 
                fontWeight: "700",
                fontSize: "16px",
                color: "#000000"
              }}>
                📹 {language === 'de' ? "Video auch auf YouTube verfügbar:" : "Video also available on YouTube:"}
              </p>
              <a 
                href="https://youtu.be/sJiZapOYNdk" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "12px 20px",
                  backgroundColor: "#ff0000",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "15px",
                  transition: "background-color 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#cc0000"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#ff0000"}
              >
                {language === 'de' ? "Auf YouTube ansehen →" : "Watch on YouTube →"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
