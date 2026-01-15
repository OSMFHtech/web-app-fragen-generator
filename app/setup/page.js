"use client";

import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";

export default function SetupPage() {
  const { t, language } = useLanguage();

  return (
    <div className="setup-page">
      <Header />
      
      <div className="setup-section">
        <div className="setup-container">
          <h1 className="setup-title">Setup Guide</h1>
          
          <div className="video-wrapper">
            <video 
              width="100%" 
              height="auto" 
              controls 
              className="setup-video"
              style={{
                maxWidth: "800px",
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)"
              }}
            >
              <source src="/videos/setup.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="setup-description">
            <p>
              Watch this video to learn how to set up and use QuestionForge for generating question banks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
