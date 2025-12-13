"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => router.push("/")}>
          <span className="logo-icon">🔨</span>
          <span className="logo-text">QuestionForge</span>
        </div>
        
        <nav className="header-nav">
          <button
            className={`nav-btn home-btn ${pathname === "/" ? "active" : ""}`}
            onClick={() => router.push("/")}
          >
            Home
          </button>
          <button
            className={`nav-btn about-btn ${pathname === "/about" ? "active" : ""}`}
            onClick={() => router.push("/about")}
          >
            About Us
          </button>
          <button
            className={`nav-btn contact-btn ${pathname === "/contact" ? "active" : ""}`}
            onClick={() => router.push("/contact")}
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
}
