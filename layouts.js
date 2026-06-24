// layouts.js — Dropdown-Datenmodell für das keyboards.json-Bündel.
// EIN Fetch lädt alle 26 Layouts. Geparst wird über dieselben Parser (Source of Truth).
// -----------------------------------------------------------------------------
import { parseKeyboard }   from "./des.js";
import { parseLHKeyboard } from "./direction.js";

export async function loadKeyboards(url = "./keyboards.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`keyboards.json: HTTP ${res.status}`);
  return res.json();                       // { version, defaults, rh:{}, lh:{}, index:[] }
}

export const rhEntries = b => b.index.filter(e => e.kind === "rh");
export const lhEntries = b => b.index.filter(e => e.kind === "lh");

// nach Tonalität gruppiert (für <optgroup>): Map<tonalite, entry[]>
export function grouped(entries) {
  const m = new Map();
  for (const e of entries) { (m.get(e.tonalite) ?? m.set(e.tonalite, []).get(e.tonalite)).push(e); }
  return m;
}

// menschenlesbares Dropdown-Label
export function labelOf(e) {
  return e.kind === "rh"
    ? `${e.description} — ${e.rows}R${e.warnings ? " \u26A0" : ""}`
    : `${e.description}${e.basses ? ` — ${e.basses} Bass` : ""}`;
}

// geparste Layouts (gehen durch die regulären Parser -> Warnungen inkl.)
export const getRH = (b, id) => parseKeyboard(b.rh[id]);
export const getLH = (b, id) => parseLHKeyboard(b.lh[id]);

// <select> mit <optgroup>s je Tonalität befüllen und Auswahl setzen
export function fillSelect(sel, entries, selectedId) {
  sel.innerHTML = "";
  for (const [ton, list] of grouped(entries)) {
    const og = document.createElement("optgroup");
    og.label = ton;
    for (const e of [...list].sort((a, b) => a.description.localeCompare(b.description))) {
      const o = document.createElement("option");
      o.value = e.id;
      o.textContent = labelOf(e);
      if (e.id === selectedId) o.selected = true;
      og.appendChild(o);
    }
    sel.appendChild(og);
  }
}

// eigenes .keyboard erkennen: LH besitzt Tire/Pousse/2sens, RH nicht.
export function detectKind(rawObj) {
  return ("Tire" in rawObj || "Pousse" in rawObj || "2sens" in rawObj) ? "lh" : "rh";
}
