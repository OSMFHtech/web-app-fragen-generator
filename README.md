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
