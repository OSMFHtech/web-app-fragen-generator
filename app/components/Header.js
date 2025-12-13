"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => router.push("/")}>
          <span className="logo-icon">🔨</span>
          <span className="logo-text">QuestionForge</span>
        </div>
        
        <nav className="header-nav">
          <button
            className={`nav-btn about-btn ${pathname === "/about" ? "active" : ""}`}
            onClick={() => router.push("/about")}
          >
            {t("aboutUs")}
          </button>
          <button
            className={`nav-btn contact-btn ${pathname === "/contact" ? "active" : ""}`}
            onClick={() => router.push("/contact")}
          >
            {t("contact")}
          </button>
          <button
            className="nav-btn lang-btn"
            onClick={toggleLanguage}
            title="Toggle language"
          >
            {language === "en" ? "EN" : "DE"}
          </button>
        </nav>
      </div>
    </header>
  );
}
