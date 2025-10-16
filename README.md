# AI Question Generator (Frontend Demo, JS-only)

**Stack**: Next.js (App Router) + **JavaScript** (no TypeScript) + minimal CSS.  
**Scope now**: Frontend demo with mock API and **Moodle XML export**.

## Run
```bash
npm i
npm run dev
# open http://localhost:3000
```

> Cleanup first if needed: delete old TS template and build folders:  
> `web-app-fragen_generator/`, `.next/`, `node_modules/`, `.git/`

## What to show (Customer)
- Enter topic → **Generate** → list appears.  
- Click **Accept/Reject** (or **Edit**); try **Regenerate** on a weak item.  
- Click **Export accepted to Moodle XML** → downloads `Fragenpool_<topic>_<date>.xml`.  
- Explain next step: connect LLM + **batch by 10** to avoid context drift.

## User Stories (Epic 2: Review & Confirm) Beispiele von User Stories:
- **US1 – Fragen im UI anzeigen**: List shows text, options, solutions (per type). ✔️
- **US2 – Fragen akzeptieren**: Each card has **Accept**; accepted are marked/tagged; only accepted are exported. ✔️
- **US3 – Fragen ablehnen**: Each card has **Reject**; rejected stay visible and tagged; excluded from export. ✔️
- **US4 – Fragen neu generieren**: Each card has **Regenerate**; replacement keeps same params (topic/lang/type). ✔️
- **US5 – Übersicht über Auswahl**: Live summary (accepted/rejected/open) and export counter. ✔️

## User Stories (Epic 3: Export to Moodle)
- **US1 – Export starten**: Explicit **Export** button with progress label. ✔️
- **US2 – XML konvertieren**: Only accepted → valid Moodle XML (`lib/exportXml.js`). ✔️
- **US3 – Moodle-Import**: XML imports in Moodle (MC correct; CodeRunner as shortanswer placeholder). ✔️
- **US4 – Datei herunterladen**: Auto-download with good name: `Fragenpool_<topic>_<date>.xml`. ✔️

## Files
- `app/page.js` – Main UI (form, list, accept/reject/edit/regenerate, export).
- `app/api/generate/route.js` – Mock generator (Edge). Swap with real LLM later.
- `lib/exportXml.js` – Builds Moodle XML + download helper.
- `app/components/QuestionCard.js`, `StatusSummary.js` – UI parts.
- `styles/globals.css` – Minimal CSS.

## Later: connect a real LLM
- Call provider in `app/api/generate/route.js`.
- Generate in **batches of 10**; validate each batch; retry if constraints drift.
- Keep the exact same UI and export.




-------------------------------------------------------------------------------------------------------------------
Sie haben Frontend-Sprache, Frontend-Framework für Web-Anwendungen empfohlen + Mithilfe unserer Epic- und User-Stories sowie des Interviews mit Ihnen haben wir die Grundstruktur unserer App erstellt.==>
Wir haben ein Web-Projekt mit js bzw. Node &  Next.js gestartet. "Web App Fragen Generator" "WFG" **(verfügbar auf "https://github.com/OSMFHtech/web-app-fragen-generator")**
node : Node.js: Server-Laufzeitumgebung → Es kann nicht direkt ändern, was in Ihrem Browser angezeigt wird, sondern nur Daten senden.
Alle Änderungen sind temporär und werden im React-Status  (useState) ==> next : Verarbeitet API-Endpunkte und Server.
Ermöglicht die interaktive UI.

Next.js ist ein Frontend-Framework für Web-Anwendungen.
Damit kann man Webseiten mit JavaScript bauen, die modern und schnell sind.

In unserem Projekt: wir bauen eine Quiz-Web-App, die später mit KI Fragen generiert.
Momentan habe ich die Grundstruktur erstellt (Frontend, noch keine KI).

-----------------------------------------------------------------------------------------------------------------
## Mehr Fragen über das, was unser Kunde wirklich braucht: 

wir haben mit der Entwicklung der Web-App mit JavaScript, Node.js und Next.js begonnen und wollten ein paar Details mit Ihnen klären, damit wir genau nach Ihren Vorstellungen weiterarbeiten können.

**Frontend & UX:**

Welche zusätzlichen Attribute sollen für jede Frage konfigurierbar sein? Zum Beispiel Schwierigkeitsgrad, Tags oder Zeitlimits?

Sollen die generierten Fragen nachträglich bearbeitet werden können, oder reicht es, sie nur zu prüfen und zu bestätigen?

**Chunking & LLM-Interaktion:**

Wie viele Fragen sollen pro Block generiert werden, bevor wir den nächsten Block anstoßen? (ca. 300 Prüfungsfragen insgesamt ?? )

Gibt es Regeln, wie wir mit Fragen umgehen sollen, die nicht den Anforderungen entsprechen? Sollen wir sie erneut generieren oder manuell korrigieren lassen?

**CodeRunner-Fragen:**

Welche Programmiersprachen müssen wir unbedingt unterstützen?

Soll der Nutzer die Testfälle anpassen können, oder reicht es, dass sie automatisch vom System generiert werden?

**Moodle Export:**

Gibt es Pflichtfelder im Moodle-XML, die unbedingt berücksichtigt werden müssen?

Möchten Sie vor dem Export eine Vorschau der XML-Datei sehen?

**Projektmanagement & Feedback:**

Wie häufig sollen wir Ihnen den Fortschritt zeigen und Feedback zu User Stories oder Tasks einholen?

Gibt es ein bevorzugtes Format, wie wir Tasks und User Stories in Azure DevOps dokumentieren sollen?

**Technik & Deployment:**

Gibt es Anforderungen an das Hosting oder an die Serverinfrastruktur?

Gibt es Einschränkungen, wie viele parallele LLM-Anfragen laufen dürfen?

Wir wollen sicherstellen, dass wir Ihre Anforderungen genau treffen und die App so bauen, dass sie für Sie optimal funktioniert.

Sprint 2 : 

Benutzerhandbuch , LLM

1 Start your dev server: 
npm install uuid
npm run dev

2 How to get an OpenAI API key:

https://platform.openai.com/account/api-keys

Click “+ Create new secret key”
Name : Group4WebApi
key: ....

3 run dev server : 

npm install uuid
npm run dev

for code runner editor dependencies : 

npm install react-simple-code-editor prismjs
