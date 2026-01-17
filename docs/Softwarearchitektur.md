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

## <span style="color:#3B689F">3. Datenfluss & Kernlogik</span>

### **Problem (aus Aufgabenstellung)**
LLMs haben begrenzte Context Windows. Bei Anforderung von 300 Fragen vergisst das Modell Thema, Sprache, Schwierigkeit während der Generierung.

### **Lösung: Batch-Verarbeitung**

1. **User Input** → Topic, Sprache, Fragetyp, Schwierigkeit, Anzahl
2. **Backend splittet in kleine Batches** (z. B. 5 Fragen pro Anfrage) → Context-Window sicher
3. **Jede Batch einzeln an LLM** → Validierung & Normalisierung
4. **Frontend sammelt & zeigt Batches** → Deduplication
5. **User Review** → Accept/Reject/Edit/Regenerate pro Frage
6. **Export** → Akzeptierte Fragen → Moodle-XML
7. **Download** → .xml-Datei

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

```
OPENROUTER_API_KEY=sk-or-v1-...
LLM_MODEL=gpt-4o-mini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **.env.example** (Committed - Vorlage)

```
OPENROUTER_API_KEY=your-key-here
LLM_MODEL=gpt-4o-mini
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## <span style="color:#3B689F">7. Technologie-Stack</span>

<table>
<tr>
<th>Layer</th>
<th>Technologie</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14+, React, CSS3</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Node.js (Next.js API Routes)</td>
</tr>
<tr>
<td><strong>State</strong></td>
<td>React Context</td>
</tr>
<tr>
<td><strong>LLM</strong></td>
<td>OpenRouter API</td>
</tr>
<tr>
<td><strong>Email</strong></td>
<td>Nodemailer + Gmail SMTP</td>
</tr>
<tr>
<td><strong>Export</strong></td>
<td>Moodle XML</td>
</tr>
<tr>
<td><strong>Code-Highlighting</strong></td>
<td>Prism.js</td>
</tr>
</table>

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
