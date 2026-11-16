Bau bitte die Bedienungsanleitung in Soufflet ein (Repo ~/Projects/soufflet). Die fertigen Seiten liegen in ~/Downloads/soufflet-guide.zip (Ordner guide/: index.html = EN, de.html = DE, img/*.webp mit annotierten iPhone-Screenshots). Arbeite Schritt für Schritt und berichte nach jedem Schritt kurz. Vor dem Push warte auf mein OK.

1. Ausgangslage: Arbeitsverzeichnis sauber, `git pull`. Gibt es schon einen Ordner guide/ oder eine bestehende Hilfe-Seite? Melden, nichts überschreiben.

2. Entpacken: guide/ aus dem ZIP ins Repo-Root kopieren.

3. Faktencheck gegen den Code (wichtigster Schritt). Die Texte wurden nur anhand von Screenshots geschrieben. Prüfe in guide/de.html und guide/index.html jede Aussage gegen den Code und die bestehende ?-Hilfe. Korrigiere sie in beiden Sprachen und liste mir jede Änderung auf. Insbesondere:
   - Tabelle „Zeichen / Bedeutung“: Bedeutet ' bzw. '' wirklich zweite bzw. dritte Reihe? Bedeutet unterstrichen = Zug und nicht unterstrichen = Druck? Falls es andersherum ist oder es weitere Zeichen gibt, korrigieren.
   - Zwei übereinanderstehende Tab-Zeilen = zwei Varianten, Antippen wählt eine. Stimmt das?
   - Spielweise: Welche Optionen gibt es, und was bedeutet „Kreuzweise (Akkord bestimmt Richtung)“ genau?
   - Sol-/Fa-Akkord: Was steuern die Optionen (z. B. beide / Zug / Druck)?
   - .keyboard: Welches Format ist das (DiatonicTab-Keyboard-Datei)?
   - Übungstempo: Bereich (50–115 %?).
   - „Zu Benny →“ im Notenkopf: nur Wechsel, oder wird das Stück an Benny übergeben?
   - Repertoire: Wonach filtert die Suche? Werden Übungsstand-Gruppen und Benny-Fit-Ampel mit Benny geteilt? Was bedeuten die Ampelfarben?
   - Eingeklappte Einstellungen: Wie lautet der Statustext auf DE und EN genau?
   Die Nummern in den Listen müssen zu den Nummern in den Bildern passen, also keine Einträge umsortieren oder löschen. Ist ein Bildlabel falsch, sag es mir, dann rendere ich das Bild neu.

4. Einbinden in die App: In der ?-Hilfe einen Link „Ausführliche Anleitung“ ergänzen (EN „User guide“, FR „Mode d’emploi“, IT „Guida“), über den vorhandenen i18n-Mechanismus. Ziel relativ: bei DE `guide/de.html`, sonst `guide/`, mit target="_blank" rel="noopener". Er muss auf GitHub Pages und auf dem IONOS-Mirror funktionieren.

5. Guide-Seiten anpassen: Favicon/Apple-Touch-Icon von Soufflet relativ (../…) in den <head> beider Seiten einbinden. „← Zurück zu Soufflet“ zeigt auf ../ und muss passen.

6. Versionierung nach Soufflet-Konvention: Minor-Bump an allen Stellen, an denen die Version steht. Dazu ein CHANGELOG-Eintrag und im README ein Link auf die Anleitung plus guide/ in der Repo-Übersicht.

7. Lokal testen mit `python3 -m http.server 8000`: Den Hilfe-Link in allen 4 Sprachen durchklicken (DE muss de.html öffnen, sonst index.html). Alle Bilder müssen laden, der Zurück-Link muss funktionieren, und die Konsole muss fehlerfrei sein.

8. Deploy prüfen: Nehmen soufflet-deploy.sh und ionos-sync den Ordner guide/ mit, ohne ihn zu löschen? Wenn nicht, sag mir, was angepasst werden muss.

9. Commit. Push und IONOS-Sync erst nach meinem OK.

10. Aufräumen: ZIP und diesen Prompt aus ~/Downloads entfernen.
