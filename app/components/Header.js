"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  const handleLogoClick = () => {
    // If on landing page, scroll to top; otherwise navigate to landing page
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
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
