# Softwarearchitektur - AI Question Generator

## 1. Überblick

Die Anwendung ist ein webbasiertes System zur automatisierten Generierung von Fragebänken mit Hilfe von Large Language Models (LLMs). Sie bietet:
- **Frontend-UI** für Fragengenerierung, Überprüfung und Export
- **Backend-API** zur Orchestrierung von LLM-Anfragen
- **Validierungslogik** für Qualitätssicherung
- **Moodle-XML-Export** für Integration in Lernmanagementsysteme

---

## 2. Datei-Mapping (Übersicht)

### **Seiten (Page Routes)**
| Datei | Route | Zweck |
|-------|-------|-------|
| `app/page.js` | `/` | Landing Page - Einstiegspunkt mit Hero & Features |
| `app/generator/page.js` | `/generator` | Hauptgenerator - Topic, Sprache, Typ, Schwierigkeit eingeben & Fragen generieren |
| `app/about/page.js` | `/about` | Über uns - Projektinformation & Ziele |
| `app/contact/page.js` | `/contact` | Kontaktformular - Nachricht an Administrator senden |

### **API-Endpunkte (Route Handler)**
| Datei | Endpunkt | Methode | Zweck |
|-------|----------|---------|-------|
| `app/api/generate/route.js` | `/api/generate` | POST | Neue Fragen mit LLM generieren |
| `app/api/regenerate/route.js` | `/api/regenerate` | POST | Einzelne Frage erneut generieren |
| `app/api/check-answer/route.js` | `/api/check-answer` | POST | Antwort überprüfen (für CodeRunner) |
| `app/api/contact/route.js` | `/api/contact` | POST | Kontaktformular verarbeiten & Email versenden |

### **Komponenten (React Components)**
| Datei | Zweck |
|-------|-------|
| `app/components/Header.js` | Navigation, Language-Toggle, Links zu About/Contact |
| `app/components/LandingPage.js` | Hero-Section, Feature-Beschreibung, CTA-Button |
| `app/components/QuestionCard.js` | Einzelne Frage mit Editor, Accept/Reject/Edit/Regenerate-Buttons |
| `app/components/XMLManager.js` | XML-Upload & Syntax-Highlighting-Preview |
| `app/components/StatusSummary.js` | Überblick: Generiert/Akzeptiert/Abgelehnt |

### **Business-Logik (Library)**
| Datei | Zweck |
|-------|-------|
| `lib/moodleXml.js` | Konvertiert Fragen zu Moodle-XML-Format |
| `lib/translations.js` | Mehrsprachige Texte (EN/DE) |

### **State & Context**
| Datei | Zweck |
|-------|-------|
| `app/context/LanguageContext.js` | Globales Language-State (EN/DE) |

### **Layout & Styling**
| Datei | Zweck |
|-------|-------|
| `app/layout.js` | Root-Layout, LanguageProvider, Metadata |
| `styles/globals.css` | Globale Styles, CSS-Variablen, Komponenten-Klassen |

---

## 3. Detaillierte Komponenten-Beschreibung

### **Frontend (Next.js/React)**

#### **Seiten**
- **`app/page.js`** - Landing Page mit Hero, Features, CTA
- **`app/generator/page.js`** - Hauptoberfläche: Eingabeformular + Fragen-Liste + Export
- **`app/about/page.js`** - Projekt-Information, Vision, Team
- **`app/contact/page.js`** - Kontaktformular mit Validierung

#### **Komponenten**
- **`Header.js`** - Navigation mit Logo, Links, Language-Toggle
- **`LandingPage.js`** - Hero-Section und Feature-Cards
- **`QuestionCard.js`** - Frage-Anzeige mit:
  - Code-Editor (Prism für Syntax-Highlighting)
  - Option-Renderer für verschiedene Fragetypen
  - Accept/Reject/Edit/Regenerate-Buttons
  - Validierungs-Warnungen
- **`XMLManager.js`** - XML-Upload mit Syntax-Highlighting-Preview
- **`StatusSummary.js`** - Statistik-Übersicht

### **Backend (Node.js API Routes)**

#### **`/api/generate`**
```
Empfängt: { topic, language, qtype, difficulty, n, batchSize }
→ Orchestriert LLM-Aufrufe in Batches
→ Validiert Items serverseitig
→ Normalisiert zu Standard-Format
Gibt zurück: JSON-Array von Fragen
```

#### **`/api/regenerate`**
```
Empfängt: { existierende Frage + Parameter }
→ Erzeugt verbesserte Alternative
Gibt zurück: Neue Frage gleichen Typs
```

#### **`/api/check-answer`**
```
Empfängt: { questionText, userAnswer, expectedAnswer }
→ Nutzt LLM für intelligente Bewertung
Gibt zurück: { correct: boolean, feedback: string }
```

#### **`/api/contact`**
```
Empfängt: { name, email, subject, message }
→ Versendet via Gmail-SMTP
Gibt zurück: { success: boolean }
```

### **Business-Logik**

#### **`lib/moodleXml.js`**
- Konvertiert normalisierte Fragen zu Moodle-XML
- Unterstützt: Multiple-Choice, CodeRunner, Select-and-Drag, List-Options
- Handles XML-Escaping & CDATA-Wrapping

#### **`lib/translations.js`**
- Mehrsprachige UI-Texte (Deutsch/English)

---

## 4. Datenfluss

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (UI)                         │
├─────────────────────────────────────────────────────────┤
│ Nutzer gibt ein: Topic, Sprache, Typ, Schwierigkeit   │
│ → Klick "Generate"                                      │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/generate
                     ▼
┌─────────────────────────────────────────────────────────┐
│            BACKEND API (Orchestration)                  │
├─────────────────────────────────────────────────────────┤
│ 1. Parameter validieren                                 │
│ 2. LLM in Batches aufrufen (Context-Fenster-Safe)      │
│ 3. JSON-Array extrahieren                               │
│ 4. Serverseitige Validierung                            │
│ 5. Normalisieren (ID, Typ, Text, Optionen, etc.)       │
└────────────────────┬────────────────────────────────────┘
                     │ JSON-Array (normalisiert)
                     ▼
┌─────────────────────────────────────────────────────────┐
│          FRONTEND (Anzeige & Überprüfung)              │
├─────────────────────────────────────────────────────────┤
│ 1. Fragen in Batches anzeigen                           │
│ 2. Duplikate herausfiltern                              │
│ 3. Nutzer reviewed: Accept/Reject/Edit/Regenerate      │
│ 4. Clientseitige Validierungswarnungen                  │
└────────────────────┬────────────────────────────────────┘
                     │ Nur akzeptierte Items
                     ▼
┌─────────────────────────────────────────────────────────┐
│              EXPORT (lib/moodleXml.js)                  │
├─────────────────────────────────────────────────────────┤
│ 1. Items zu Moodle-XML konvertieren                     │
│ 2. Dateidownload auslösen (.xml)                        │
│ 3. In Moodle importierbar                               │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Fragetypen & Normalisierung

Jede Frage wird auf folgendes Format normalisiert:

```javascript
{
  id: "UUID",
  type: "multiple-choice" | "coderunner" | "select-and-drag" | "list-options",
  text: "Frage-Text",
  language: "en" | "de",
  difficulty: "easy" | "medium" | "hard",
  
  // Für Multiple-Choice, Select-and-Drag, List-Options:
  options: [
    { text: "Option 1", correct: true },
    { text: "Option 2", correct: false }
  ],
  
  // Für CodeRunner:
  answer: "Reference Solution (Code)",
  testcases: [
    { input: "Test Input", expected: "Erwarteter Output" }
  ]
}
```

---

## 6. Validierung

### **Serverseitig** (In `app/api/generate/route.js`)
- **Multiple-Choice:**
  - ✓ ≥ 2 Optionen
  - ✓ Genau 1 korrekte Antwort
  - ✗ Keine Platzhalter-Texte

- **CodeRunner:**
  - ✓ Antwort (Reference Solution) Pflicht
  - ✓ Optionale Testfälle
  - ~ Code-Syntax nicht validiert

- **Select-and-Drag:**
  - ✓ Mindestens 2 Optionen
  - ✓ Mapping für Blanks vorhanden

- **List-Options:**
  - ✓ Definitionsliste = Optionsliste (Länge)
  - ✓ Eindeutige Zuordnung möglich

### **Clientseitig** (In `app/components/QuestionCard.js`)
- Warnungen für fehlende/unvollständige Felder
- Vorschau mit Fehlermarkierung
- Nutzer kann trotzdem akzeptieren (⚠️ Achtung)

---

## 7. LLM-Integration

- **Provider:** OpenRouter oder OpenAI API
- **Modell:** Konfigurierbar (default: `gpt-4o-mini`)
- **Batch-Strategie:**
  - Mehrere kleinere Prompts statt einer großen
  - Verhindert Kontext-Fenster-Überlauf
  - Verbessert Konsistenz

---

## 8. Konfiguration

### **`.env.local`** (Nicht committed)

```bash
# LLM-Konfiguration
OPENROUTER_API_KEY=sk-or-v1-...
LLM_MODEL=gpt-4o-mini

# Email (Kontaktformular)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **`.env.example`**
```bash
OPENROUTER_API_KEY=your-key-here
LLM_MODEL=gpt-4o-mini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 9. Technologie-Stack

| Layer | Technologie |
|-------|-------------|
| **Frontend** | Next.js 14+, React, CSS3 |
| **Backend** | Node.js (Next.js API Routes) |
| **State** | React Context (Language) |
| **LLM** | OpenRouter API |
| **Email** | Nodemailer + Gmail SMTP |
| **Export** | Native JavaScript + XML |
| **Code-Highlighting** | Prism.js |

---

## 10. Deployment

- **Hosting:** Vercel (Next.js optimiert) oder Self-Hosted Node.js
- **Build:** `npm run build`
- **Start:** `npm start` (Prod) oder `npm run dev` (Dev)
- **Umgebungsvariablen:** In Hosting-Plattform setzen

---

## 11. Sicherheit

- ✓ API Keys in `.env.local` (nie committed)
- ✓ Validierung serverseitig (Hard Constraints)
- ✓ XSS-Schutz durch React
- ✓ XML-Escaping in `lib/moodleXml.js`
- ✓ CORS nur Backend → LLM-Provider
