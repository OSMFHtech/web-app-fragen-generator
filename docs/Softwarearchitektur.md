# Softwarearchitektur - QuestionForge (AI Question Generator)

## <span style="color:#3B689F">1. Überblick</span>

Die Anwendung ist ein webbasiertes System zur automatisierten Generierung von Fragebänken mit Hilfe von Large Language Models (LLMs). Sie bietet:
- **Frontend-UI** für Fragengenerierung, Überprüfung und Export
- **Backend-API** zur Orchestrierung von LLM-Anfragen
- **Validierungslogik** für Qualitätssicherung
- **Moodle-XML-Export** für Integration in Lernmanagementsysteme

---

## <span style="color:#3B689F">2. Komponenten (Vereinfachte Übersicht)</span>

### **UI-Schicht**
- **UI:** <span style="color:#E8944A">app/page.js</span>, <span style="color:#E8944A">app/generator/page.js</span>, <span style="color:#E8944A">app/about/page.js</span>, <span style="color:#E8944A">app/contact/page.js</span>, <span style="color:#E8944A">app/setup/page.js</span>
  - Landing Page mit Hero & Features
  - Hauptgenerator für Topic, Sprache, Fragetyp, Schwierigkeit
  - Fragen-Review mit Accept/Reject/Edit/Regenerate-Buttons
  - Statusübersicht (Generiert/Akzeptiert/Abgelehnt)
  - XML-Upload & Syntax-Highlighting-Preview
  - Video-basierter Setup-Guide

### **API-Schicht**
- **API:** <span style="color:#E8944A">app/api/generate/route.js</span>, <span style="color:#E8944A">app/api/regenerate/route.js</span>, <span style="color:#E8944A">app/api/check-answer/route.js</span>, <span style="color:#E8944A">app/api/contact/route.js</span>
  - **<span style="color:#E8944A">/api/generate</span>:** LLM-orchestrierte Fragengenerierung
  - **<span style="color:#E8944A">/api/regenerate</span>:** Einzelne Frage erneut generieren
  - **<span style="color:#E8944A">/api/check-answer</span>:** CodeRunner-Antwortüberprüfung
  - **<span style="color:#E8944A">/api/contact</span>:** Email-Versand via Gmail-SMTP

### **Logik-Schicht**
- **Logik:** <span style="color:#E8944A">lib/moodleXml.js</span>, <span style="color:#E8944A">lib/translations.js</span>, <span style="color:#E8944A">lib/validators.js</span>
  - <span style="color:#E8944A">lib/moodleXml.js</span> - Konvertierung zu Moodle-XML-Format (MC, CodeRunner, Select-and-Drag, List-Options)
  - <span style="color:#E8944A">lib/translations.js</span> - Mehrsprachige Texte (EN/DE)
  - <span style="color:#E8944A">lib/validators.js</span> - Serverseitige Validierungslogik

### **Zusätzliche Komponenten**
- **React-Komponenten:** <span style="color:#E8944A">Header.js</span>, <span style="color:#E8944A">QuestionCard.js</span>, <span style="color:#E8944A">XMLManager.js</span>, <span style="color:#E8944A">StatusSummary.js</span>, <span style="color:#E8944A">LandingPage.js</span>
- **Context:** <span style="color:#E8944A">LanguageContext.js</span> (Globales EN/DE State)
- **Layout & Styling:** <span style="color:#E8944A">app/layout.js</span>, <span style="color:#E8944A">styles/globals.css</span>

---

## <span style="color:#3B689F">3. Datenfluss</span>

UI sendet POST an /api/generate.
API orchestriert, ruft LLM, validiert Items und liefert Normalform.
UI zeigt Batches, dedupliziert, Nutzer bestätigt Items.
Export nutzt lib/moodleXml.js.

**Details:**
- 1. Nutzer gibt Topic, Sprache, Fragetyp, Schwierigkeit ein
- 2. POST <span style="color:#E8944A">/api/generate</span> wird aufgerufen
- 3. Backend: Parameter validieren
- 4. Backend: LLM in Batches aufrufen (Context-Window-Safe)
- 5. Backend: Serverseitige harte Validierung durchführen
- 6. Backend: Items normalisieren
- 7. Frontend: Fragen anzeigen in Batches
- 8. Frontend: Duplikate herausfiltern
- 9. Nutzer: Accept/Reject/Edit/Regenerate wählen
- 10. Frontend: Clientseitige Validierungswarnungen zeigen
- 11. Export: Akzeptierte Items zu Moodle-XML konvertieren
- 12. Download: .xml-Datei bereitstellen

---

## <span style="color:#3B689F">4. Fragetypen & Normalisierung</span>

Jede Frage wird normalisiert mit: id, type, text, language, difficulty, options (für MC), answer & testcases (für CodeRunner)

---

## <span style="color:#3B689F">5. Validierung</span>

### **Serverseitige HARTE Validierung** (Blocker)

**Multiple-Choice:** 2 Optionen, genau 1 korrekt, keine Platzhalter.

**CodeRunner:** Antwort Pflicht, optionale Testfälle.

**Select-and-Drag:** Mindestens 2 Optionen, Mapping konsistent.

**List-Options:** Länge Definitionen = Länge Optionen.

### **Clientseitige Warnungen** (Non-Blocking)

Serverseitig harte Validierung, clientseitig Warnungen.
- Fehlende oder unvollständige Felder
- Generische Texte
- Nutzer kann trotzdem akzeptieren

---

## <span style="color:#3B689F">6. Konfiguration</span>

### **.env.local** (Nicht committed)

.env.local für API Schlüssel und Modell.

`
OPENROUTER_API_KEY=sk-or-v1-...
LLM_MODEL=gpt-4o-mini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`

### **.env.example** (Committed - Vorlage)

`
OPENROUTER_API_KEY=your-key-here
LLM_MODEL=gpt-4o-mini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`

---

## <span style="color:#3B689F">7. Technologie-Stack</span>

| Layer | Technologie |
|-------|-------------|
| **Frontend** | Next.js 14+, React, CSS3 |
| **Backend** | Node.js (Next.js API Routes) |
| **State** | React Context |
| **LLM** | OpenRouter API |
| **Email** | Nodemailer + Gmail SMTP |
| **Export** | Moodle XML |
| **Code-Highlighting** | Prism.js |

---

## <span style="color:#3B689F">8. Deployment</span>

- **Hosting:** Vercel oder Self-Hosted Node.js
- **Build:** npm run build
- **Start:** npm start (Prod) oder npm run dev (Dev)
- **Env-Vars:** In Hosting-Plattform setzen

---

## <span style="color:#3B689F">9. Sicherheit</span>

- API Keys in <span style="color:#E8944A">.env.local</span> (nie committed)
- Validierung serverseitig (Hard Constraints)
- XSS-Schutz durch React
- XML-Escaping in <span style="color:#E8944A">lib/moodleXml.js</span>
- CORS nur Backend → LLM-Provider
