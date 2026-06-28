# Soufflet 🪗

**MusicXML / .mxl → Knopf-Tablatur (D.E.S.) fürs diatonische Akkordeon — direkt über den Noten, im Browser, komplett lokal.**

🔗 **Live: [wdeu.github.io/soufflet](https://wdeu.github.io/soufflet/)**

Offene, GPL-2.0-lizenzierte Fortschreibung von [Jean-Michel Bencettis](https://jmi.ovh/DiatonicTab) DiatonicTab-Plugins für MuseScore — als eigenständige Web-App, ohne Installation, ohne MuseScore, auf jedem Gerät mit Browser.

-----

## 🇩🇪 Was Soufflet macht

1. Partitur laden (`.mxl`, `.musicxml`, `.xml`) — bleibt komplett im Browser, nichts wird hochgeladen.
1. Knopflayout wählen (26 mitgelieferte Belegungen, oder eigenes `.keyboard` hochladen).
1. Über jeder Note erscheinen die spielbaren Knopf-Kandidaten (D.E.S.-Notation) — Zug ist unterstrichen, Druck nicht.
1. Eine Variante antippen, um sie auszuwählen — die Wahl wird lokal gespeichert.
1. Optional: abspielen lassen (Akkordeon-Klang, grüner Laufbalken, Auto-Scroll) statt nur zu lesen.

### Funktionsumfang (Stand dieser Version)

**Tablatur & Layouts**

- 26 Knopfbelegungen (G/C, Sol/Do u.a.), gruppiert nach Tonart, plus eigenes `.keyboard`-Upload.
- Spielweise wählbar: kreuzweise (Akkord bestimmt Balgrichtung), einreihig G, einreihig C.
- Akkordrichtung für SOL/FA-Akkorde einzeln einstellbar (beide / nur Zug / nur Druck).
- **Akkorderkennung in drei Stufen**, transparent gekennzeichnet:
  - Echtes `<harmony>`-Symbol aus der Partitur (z. B. „Am”) → bestimmt die Balgrichtung direkt.
  - **Variante D** — keine Akkordsymbole im Stück, aber gestapelte Bassnoten vorhanden: Akkordwurzel wird aus dem tiefsten Ton der Bass-Mehrklänge pro Takt abgeleitet und als kleine, kursive „(C)”-Anmerkung sichtbar gemacht — deutlich von echten Symbolen unterschieden.
  - **Variante A** — gar keine Akkordinformation auffindbar: ehrlicher Hinweis in der Statuszeile statt stillem Raten.
- **Stimmen-Auswahl**: Erscheint automatisch, wenn ein System mehrere `<voice>`-Stränge enthält (z. B. Melodie + gehaltene Begleitstimme im selben System) — sonst unsichtbar.
- Mehrsystem-Sicherung: bei Klavier-Layouts (2 Systeme im selben Part) wird automatisch nur das Melodiesystem ausgewertet, der Bass fließt nicht versehentlich in die Tablatur ein.

**Akustische Wiedergabe**

- Eigener Synthesizer, 1:1 aus [Benny Accordion](https://wdeu.github.io/benny-accordion/) portiert (spektral vermessener Akkordeon-Klang, keine generische Synthese).
- Bass-Begleitung mit eigener, großzügigerer Erkennung als die Tablatur (auch einzelne, nicht gestapelte Basstöne werden als Begleitwurzel genutzt — fürs Hören unkritischer als für die Tablatur-Anzeige).
- Grüner Laufbalken über der aktuell klingenden Note, mit Auto-Scroll.
- Echtes Play/Pause/Stop — Fortsetzen läuft exakt an der Pausenstelle weiter.
- Zeitanzeige (verstrichen / gesamt).
- Fest im Bild verankerte Mini-Transportleiste, erreichbar auch wenn die Hauptbuttons durch Auto-Scroll außer Sicht sind.
- Tempo ausschließlich aus dem maschinenlesbaren `<sound tempo>`-Wert (nie aus der optischen Metronomangabe — bei punktierten Vierteln in 6/8 wäre das sonst falsch).

**Bedienung & Teilen**

- Einklappbares Einstellungs-Panel (mehr Platz für die Noten auf dem iPhone).
- Vollständige Persistenz: Layout, Optionen, Zoom, geladene Partitur und getroffene Auswahl überleben einen Browser-Neustart.
- „Alles zurücksetzen” für einen kompletten, sauberen Neustart.
- Teilen-Button (natives iOS-Teilen-Menü bzw. Link in die Zwischenablage) und QR-Code zum schnellen Weitergeben.
- Drucken (eigenes Print-Stylesheet, zeigt nur Noten + Tablatur).
- Viersprachige Oberfläche: 🇩🇪 🇫🇷 🇮🇹 🇬🇧 — per Flaggen-Klick, `?lang=fr` als Deeplink, Spracherkennung beim ersten Besuch.
- Verlinkung zu [Benny Accordion](https://wdeu.github.io/benny-accordion/) (Knopf-Übepartner fürs eigene Instrument).
- Impressum verlinkt im Footer (§5 DDG).

-----

## 🇫🇷 Ce que fait Soufflet

Soufflet convertit un fichier MusicXML / .mxl en tablature à boutons (D.E.S.) affichée au-dessus des notes — entièrement dans le navigateur, sans serveur, sans installation de MuseScore. Continuation libre sous licence GPL-2.0 des plugins DiatonicTab de Jean-Michel Bencetti.

Fonctions principales : 26 plans de clavier, reconnaissance d’accords en trois niveaux (symbole réel → accords de basse empilés → aucune info, signalée honnêtement), sélection de voix pour les partitions polyphoniques sur une même portée, lecture audio avec le timbre réel de l’accordéon (porté depuis Benny Accordion), barre de lecture verte avec défilement automatique, lecture/pause/stop, partage + QR code, impression, panneau de réglages repliable, persistance complète, interface en 4 langues (DE/FR/IT/EN).

🔗 **En ligne : [wdeu.github.io/soufflet](https://wdeu.github.io/soufflet/)**

-----

## Aufbau / Structure

```
index.html               — die App selbst (UI, Logik, Wiedergabe-Engine)
des.js                    — D.E.S.-Notation, .keyboard-Parser (RH)
direction.js              — Balgrichtung aus Akkordsymbolen, .keyboard-Parser (LH)
musicxml.js               — MusicXML-Parser, Timing-/Akkord-Extraktion, transcribe()
layouts.js                — Dropdown-Datenmodell für keyboards.json
audio.js                  — Akkordeon-Synthesizer (aus Benny Accordion portiert)
keyboards.json            — gebündelte 26 Layouts (RH+LH)
package.json
impressum.html
site.webmanifest, *.png   — Favicon/Homescreen-Icons, og-image.png (Sharing-Vorschau)
keyboards/                — Quell-Layouts (.keyboard), nur fürs Bauen relevant
tools/                    — build-keyboards.mjs, validate-keyboards.mjs
raycast/                  — Deploy-Skripte (siehe unten)
```

## Live & Deploy

- **GitHub Pages** (Haupt-Adresse): <https://wdeu.github.io/soufflet/> — automatisch aktiv bei jedem Push auf `main`.
- **IONOS-Spiegel** (`soufflet.wdeu.de`): geplant, noch nicht eingerichtet.

### Deploy per Raycast (am Mac mini)

```
Soufflet · Deploy   (Raycast-Skript, raycast/soufflet-deploy.sh)
```

Baut `keyboards.json` neu, committet, pusht. Optionaler IONOS-Sync über `DEPLOY_IONOS=1` im Skript.

### Deploy per Termius (vom iPhone, ohne Mac-Bildschirm)

SFTP-Upload der geänderten Datei(en) nach `~/Projects/soufflet/`, danach per SSH:

```
cd ~/Projects/soufflet && bash raycast/soufflet-deploy.sh "Commit-Nachricht"
```

Details: siehe `Termius.md`.

### Build-Werkzeuge

```
node tools/build-keyboards.mjs       # keyboards/ -> keyboards.json
node tools/validate-keyboards.mjs    # Konsistenzprüfung
```

## Wichtige technische Entscheidungen

- **`.js` statt `.mjs`**: GitHub Pages (und viele Apache-Konfigurationen) liefern `.mjs` als `application/octet-stream` aus — der Browser verweigert dann den Modul-Import. Alle vier Module sind deshalb bewusst `.js` benannt.
- **Kein `accept`-Attribut an den Datei-Inputs**: iOS graut Dateien aus, deren Endung (`.mxl`, `.keyboard`) es keinem bekannten Typ zuordnen kann — der Picker bleibt sonst leer.
- **Nur `<sound tempo>`, nie die optische Metronomangabe**: bei punktierter Viertel (6/8) wäre der Bezugswert ein anderer; ein falsch gelesener Wert würde konsequent zu schnell/zu langsam abspielen, ohne dass es auffällt.
- **Drei getrennte Genauigkeitsstufen für Akkorde** (echtes Symbol / Variante D / Variante A), nie geraten: eine falsch angezeigte Spielanweisung ist schädlicher als ein ehrlicher „nichts gefunden”-Hinweis.

## Vendoring (kein CDN-Lock-in)

Aktuell via jsDelivr-CDN: OpenSheetMusicDisplay, fflate, QRCode.js. Geplant: lokal einbinden, um die Abhängigkeit von externen CDNs zu reduzieren (offener Punkt, siehe Roadmap).

## Lizenz & Credits / Licence & crédits

GPL-2.0 — siehe `LICENSE`. Fortschreibung der DiatonicTab-Plugins von Jean-Michel Bencetti ([jmi.ovh/DiatonicTab](https://jmi.ovh/DiatonicTab)), mit seiner ausdrücklichen Ermutigung, die Logik zu studieren und sich anzueignen. Akkordeon-Klangsynthese 1:1 aus [Benny Accordion](https://wdeu.github.io/benny-accordion/) portiert (eigenes Projekt, eigene Spektralanalyse des realen Instruments).

Werner Deuer (wdeu) · Bad Emstal