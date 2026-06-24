# Soufflet 🪗

**DE** · Tablatur für diatonisches Akkordeon, direkt aus MusicXML — komplett lokal im Browser.
**FR** · Tablature pour accordéon diatonique, directement depuis MusicXML — entièrement local, dans le navigateur.

Eine offene Fortschreibung der MuseScore-3-Plugins **DiatonicTab** von Jean-Michel Bencetti, die unter MuseScore 4 nicht mehr laufen. Soufflet rendert die Partitur mit OpenSheetMusicDisplay und legt die Knopf-Tablatur (D.E.S.) als Overlay über die Noten. Keine Installation, kein Server, keine Cloud — die Partitur verlässt das Gerät nie.

*Une continuation libre des plugins MuseScore 3 **DiatonicTab** de Jean-Michel Bencetti, qui ne fonctionnent plus sous MuseScore 4. Soufflet affiche la partition avec OpenSheetMusicDisplay et superpose la tablature à boutons (D.E.S.) au-dessus des notes. Aucune installation, aucun serveur, aucun cloud — la partition ne quitte jamais l'appareil.*

---

## 🇩🇪 Deutsch

**Was es macht.** MusicXML-Datei (`.mxl`, `.musicxml`, `.xml`) wählen → die Melodie wird mit den Akkordsymbolen analysiert, je Note werden die passenden Knöpfe bestimmt, und über jeder Note erscheint die D.E.S.-Tablatur. Knöpfe in **Zug** sind unterstrichen, in **Druck** normal. Wo mehrere Knöpfe möglich sind, **tippst du die passende Variante an** statt sie wie im Plugin zu löschen.

**Funktionen.**
- 26 Tastatur-Layouts eingebaut (G/C, B/C, C#/D, G/C/F; 2-, 3- und Mehrreiher), eigene `.keyboard` ladbar.
- Akkord bestimmt die Balgrichtung — datengetrieben aus der Bass-Datei (`Tire`/`Pousse`/`2sens`).
- Optionen: kreuzweise vs. einreihig (G- oder C-Reihe), SOL/FA-Richtung erzwingen, nur eine Möglichkeit zeigen.
- Toleranter Parser: Tippfehler in Community-Layouts werden übersprungen und gemeldet, nicht verschluckt.

**Schnellstart.** ES-Module brauchen einen Webserver (kein `file://`):
```
python3 -m http.server 8000     # dann http://localhost:8000/ öffnen
```
Oder das Raycast-Skript **Soufflet · Serve** benutzen.

---

## 🇫🇷 Français

**Ce que ça fait.** Choisis un fichier MusicXML (`.mxl`, `.musicxml`, `.xml`) → la mélodie est analysée avec les symboles d'accords, les boutons adéquats sont déterminés pour chaque note, et la tablature D.E.S. s'affiche au-dessus. Les boutons **tirés** sont soulignés, **poussés** non. Quand plusieurs boutons sont possibles, **tu touches la bonne variante** au lieu de l'effacer comme dans le plugin.

**Fonctions.**
- 26 plans de clavier inclus (G/C, B/C, Do#/Ré, G/C/F ; 2, 3 rangs et plus), import de tes propres `.keyboard`.
- L'accord détermine le sens du soufflet — piloté par le fichier de basses (`Tire`/`Pousse`/`2sens`).
- Options : jeu croisé ou en ligne (rang de G ou de C), forcer le sens de SOL/FA, n'afficher qu'une possibilité.
- Analyseur tolérant : les fautes de frappe des plans communautaires sont ignorées et signalées, pas avalées.

**Démarrage rapide.** Les modules ES nécessitent un serveur web (pas `file://`) :
```
python3 -m http.server 8000     # puis ouvrir http://localhost:8000/
```
Ou utiliser le script Raycast **Soufflet · Serve**.

---

## Aufbau / Structure

```
soufflet/
├─ index.html              App (OSMD + fflate via CDN; siehe Vendoring unten)
├─ des.mjs                 Kernel: RH-.keyboard parsen, Knopf → D.E.S.
├─ direction.mjs           Akkord → Balgrichtung (aus LH-Bass-Datei), Filter
├─ musicxml.mjs            Mini-XML-Parser + Melodie-mit-Akkorden + transcribe()
├─ layouts.mjs             Dropdown-Datenmodell (lädt keyboards.json, 1 Fetch)
├─ keyboards.json          Build-Artefakt: alle Layouts + Index (eingecheckt)
├─ keyboards/              Quell-Layouts (.keyboard) — Community-Beiträge hierher
│  ├─ RH_*.keyboard (17)   rechte Hand / main droite
│  └─ LH_*.keyboard  (9)   linke Hand-Bässe / basses main gauche
├─ tools/
│  ├─ build-keyboards.mjs  keyboards/ → keyboards.json
│  ├─ validate-keyboards.mjs  Layouts prüfen, Tippfehler melden
│  └─ setup.sh             einmalig: GPL-2.0-Text holen, Skripte +x
└─ raycast/                Raycast Script Commands (s. u.)
```

**keyboards.json neu bauen / régénérer** (nach Änderungen in `keyboards/`):
```
node tools/build-keyboards.mjs
node tools/validate-keyboards.mjs    # Layouts prüfen
```

## Raycast-Skripte / Scripts Raycast

Ordner als Raycast *Script Commands directory* hinzufügen. Repo-Pfad einmalig setzen:
`export SOUFFLET_REPO=~/Projects/soufflet` (oder im Skript anpassen).

| Befehl | Wirkung |
| --- | --- |
| **Soufflet · Serve**  | Lokalen Server starten + Browser öffnen (Tuning-Loop). |
| **Soufflet · Build keyboards.json** | Bündel aus `keyboards/` neu erzeugen. |
| **Soufflet · Check layouts** | Alle Layouts parsen, Tippfehler melden. |
| **Soufflet · Deploy** | Build + commit + push (GitHub Pages). IONOS-Variante im Skript. |

> Für `soufflet.wdeu.de` via IONOS: in `raycast/soufflet-deploy.sh` `git push` durch deinen
> `ionos-sync.sh`-Aufruf ersetzen (wie bei `inserate.wdeu.de`).

## Vendoring (kein CDN-Lock-in)

`index.html` lädt OSMD und fflate vorerst vom jsDelivr-CDN. Für Offline/Privacy beide ins Repo legen
(`vendor/`) und die zwei `<script src=…>`-Zeilen umstellen; Versionen dabei pinnen.

## Lizenz & Credits / Licence & crédits

**GPL-2.0-only.** Soufflet trägt dieselbe Lizenz wie das Ursprungswerk. Vollständigen Text holen:
`bash tools/setup.sh`.

**DiatonicTab** © Jean-Michel Bencetti — die Logik (Akkord → Balgrichtung, Tastaturdaten-Format)
ist aus seinen MuseScore-Plugins portiert. Repo: <https://github.com/JMiB-Fr-2020/DiatonicTab> ·
Doku: <https://jmi.ovh/DiatonicTab>. Vor Veröffentlichung schriftliche Freigabe einholen und
Bencetti hier prominent nennen.

*La logique (sens du soufflet selon l'accord, format des plans de clavier) est portée de ses
plugins MuseScore. Obtenir son accord écrit avant publication et le créditer ici.*

**Datenherkunft / Provenance des données.** Die `.keyboard`-Plandateien stammen aus dem
DiatonicTab-Umfeld und beschreiben reale Instrumenten-Layouts. MusicXML ist ein offenes
W3C-Format; konvertiere nur legal erworbene Stücke — der Inhalt einzelner Partituren kann
urheberrechtlich geschützt sein.
