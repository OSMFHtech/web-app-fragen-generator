# Softwarearchitektur

## Komponenten
- UI: `app/page.js`
- API: `app/api/generate/route.js`, `app/api/regenerate/route.js`
- Logik: `lib/moodleXml.js`, `lib/validators.js`

## Datenfluss
1. UI sendet POST an `/api/generate`.
2. API orchestriert, ruft LLM, validiert Items und liefert Normalform.
3. UI zeigt Batches, dedupliziert, Nutzer bestätigt Items.
4. Export nutzt `lib/moodleXml.js`.

## Validierung
- Multiple-Choice: ≥2 Optionen, genau 1 korrekt, keine Platzhalter.
- CodeRunner: Antwort Pflicht, optionale Testfälle.
- Serverseitig harte Validierung, clientseitig Warnungen.

## Konfiguration
- `.env.local` für API Schlüssel und Modell.
