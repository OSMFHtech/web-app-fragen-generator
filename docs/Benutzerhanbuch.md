# **Ziel**

Der KI-Fragen-Generator wird verwendet, um mithilfe eines großen Sprachmodells (LLM) automatisch Fragenkataloge zu erstellen. Die generierten Fragen können überprüft, bearbeitet und anschließend als Moodle-XML-Datei exportiert werden. Auf diese Weise lassen sich große Mengen an Übungs- oder Prüfungsfragen effizient generieren und direkt in Moodle importieren.

# **Schnellstart**

Doppelklick auf `start-app.bat` im Projektordner → App lädt unter http://localhost:3000

Oder manuell: Terminal öffnen → `npm install` → `npm run dev`

---

## **Hauptfunktionen**

*   **Automatische Fragengenerierung** mit LLM
    
*  **Unterstützung mehrerer Fragetypen:** Multiple Choice (MC), CodeRunner..
    
*   **Bearbeiten und Bewerten** einzelner Fragen
    
*   **Regeneration** einzelner Fragen 
    
*   **Export in Moodle-kompatibles XML-Format**
    
*   **Importierbar in Moodle-Fragenbanken**

## **Schritte** 

1.  Thema, Sprache (DE/EN), Fragetyp (MC/CodeRunner..), Schwierigkeit, Anzahl auswählen.
2.  Generieren starten.
3.  Einträge prüfen, bearbeiten, regenerieren, akzeptieren.
4.  Export nach Moodle-XML.

# **Ablauf**

# 1. Parameter festlegen

Zunächst wählt man auf der Startseite die gewünschten Einstellungen:
*   **Thema:** Fach oder Themengebiet (z. B. Informatik, Mathematik, Geschichte)
    
*   **Sprache:** Deutsch (DE) oder Englisch (EN)
    
*   **Fragetyp:** z.B Multiple Choice (MC), CodeRunner..
    
*   **Schwierigkeitsgrad:** leicht, mittel oder schwer
    
*   **Anzahl:** gewünschte Gesamtzahl an Fragen
    

# 2. Fragen generieren

Klicken Sie auf **„Generate“**, um die Erstellung der Fragen zu starten. 
 
Die Anwendung sendet die ausgewählten Einstellungen (Topic, Language, Question Type, Difficulty, Count) an das integrierte **LLM** und generiert automatisch passende Fragen mit Antwortoptionen.

Während der Generierung wird im Bereich **„Status“** angezeigt, wie viele Fragen bereits erstellt, akzeptiert oder abgelehnt wurden. Die generierten Fragen erscheinen anschließend im Abschnitt **„Questions“** mit vollständigem Fragetext und möglichen Antworten. Wenn Sie erneut auf **„Generate“** klicken, werden weitere Fragen hinzugefügt, ohne dass die bestehenden verloren gehen. 
 
So können Sie Ihre Fragenbank **Batch für Batch erweitern** (z. B. 5 → 10 → 15 Fragen).

# 3. Fragen prüfen und bearbeiten

Nach der Generierung werden alle erstellten Fragen im Bereich **„Questions“** angezeigt.  
Jede Frage enthält den Fragetyp, die Sprache, den Schwierigkeitsgrad, den Fragetext sowie die möglichen Antwortoptionen.

Sie können nun folgende Aktionen durchführen:

3.1 **Fragen prüfen**  

Überprüfen Sie jede generierte Frage auf Inhalt, Verständlichkeit und Richtigkeit.  
Kontrollieren Sie, ob die korrekten Antworten markiert sind und die Frage sinnvoll formuliert wurde.

3.2 **Fragen bearbeiten**  

Texte und Antwortoptionen können direkt angepasst werden, falls kleinere Korrekturen nötig sind.  
So verbessern Sie gezielt die Qualität der generierten Fragen.

3.3 **Fragen regenerieren**  

Falls eine Frage unpassend oder fehlerhaft ist, können Sie sie auf den Button "Regenerate" klicken, die Frage neu generieren.  Das System erstellt automatisch eine überarbeitete Version der Frage.

3.4 **Fragen annehmen oder ablehnen**  

Mit **Accept all** nehmen Sie alle angezeigten Fragen auf einmal an.  
Mit **Reject all** lehnen Sie alle Fragen ab.  

Nur akzeptierte Fragen werden für den Export berücksichtigt.

## **Import in Moodle**

1.  Kurs öffnen → Fragenbank → Import.
2.  Format: Moodle XML.
3.  Datei wählen → Import starten.