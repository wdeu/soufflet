// des.js — DiatonicTab RH-.keyboard -> D.E.S.-Tablatur (Kernel)
// Reine Funktionen, keine Abhängigkeiten. Browser (ES-Modul) + Node.
// -----------------------------------------------------------------------------
// RH-.keyboard (JSON): { "<Ton><Oktave>[#]": "<Kand>[/<Kand>...]", ..., "description": ... }
//   Kand = <KnopfNr><Reihe><Richtung>
//     Reihe:   ' ->2 | '' ->3 | ''' ->4 (Apostroph-Lauf) ;  Richtung: P=Druck | T=Zug
//   Tolerant: Werte mit Leerzeichen / Schluss-Slash / Tippfehlern -> fehlerhafte Tokens
//   werden übersprungen und in `warnings` gemeldet, statt das Layout zu sprengen.
//   Kreuz-Position egal (F4# wie F#6) -> Schlüssel werden kanonisiert. Oktaven
//   wissenschaftlich (C4 = mittl. C). Tabelle kennt nur #, keine b.
// -----------------------------------------------------------------------------

const BTN_RE = /^(\d+)('+|")?([PT])$/;
const KEY_RE = /^([A-G])(#?)(\d)(#?)$/;

function canonKey(k) {
  const m = KEY_RE.exec(k);
  return m ? m[1] + m[3] + ((m[2] || m[4]) ? "#" : "") : null;   // F#6 == F6#
}

function parseButton(tok) {
  const m = BTN_RE.exec(tok);
  if (!m) return null;
  const [, num, prime, dir] = m;
  let row = 1;
  if (prime) row = prime[0] === '"' ? 3 : prime.length + 1;      // ' ->2, '' ->3, ''' ->4
  return { button: Number(num), row, push: dir === "P" };        // P=Druck, T=Zug
}

export function parseKeyboard(jsonText) {
  const raw = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
  const map = {}, warnings = [];
  for (const [k, v] of Object.entries(raw)) {
    const key = canonKey(k);
    if (!key) continue;                                          // description/tonalite/… weg
    const cands = [];
    for (const tok of String(v).split("/").map(s => s.trim()).filter(Boolean)) {
      const b = parseButton(tok);
      if (b) cands.push(b);
      else warnings.push(`${k}: "${tok}"`);                      // Tippfehler protokollieren
    }
    if (cands.length) map[key] = cands;
  }
  return { description: raw.description ?? "", map, warnings };
}

const STEP_SEMI = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function pitchToKey(step, alter = 0, octave) {
  const semi = STEP_SEMI[step] + alter;
  const cls = ((semi % 12) + 12) % 12;
  const octShift = Math.floor(semi / 12);
  const name = SHARP_NAMES[cls];
  return name[0] + (octave + octShift) + (name.length > 1 ? "#" : "");   // "F4#"/"A3"
}

// 3. Reihe -> '"' , 4. -> '"\'' ; Zug = unterstrichen (Plugin gibt <u>…</u> aus).
export function buttonToDES(b) {
  let prime = "";
  if (b.row === 2) prime = "'";
  else if (b.row >= 3) prime = '"' + "'".repeat(b.row - 3);
  return { text: `${b.button}${prime}`, underline: !b.push };
}
export function buttonToDESText(b) {
  const { text, underline } = buttonToDES(b);
  return underline ? text + "_" : text;
}
