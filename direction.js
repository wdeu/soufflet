// direction.js — Akkord -> Balgrichtung -> Kandidaten filtern.
// Portiert aus DiatonicTab v1.06.06 (J.-M. Bencetti, GPL-2.0), Zeilen ~760-895.
// -----------------------------------------------------------------------------
// Die Richtung ist DATENGETRIEBEN: sie kommt aus der LH-(Bass-)Datei, nicht aus
// einer festen Tabelle. LH-.keyboard:  { "2sens":"-G-", "Pousse":"-C-E-...",
// "Tire":"-A-D-F-", "tonalite":"GC", "description":... }  (Bindestrich-Listen.)
// Akkord-Reduktion wie im Plugin: Bass nach "/" weg, b->#, auf Grundton kürzen,
// Qualität (dur/moll/7/sus...) ignorieren. Nur der GRUNDTON bestimmt die Richtung.
// Reihenfolge wie im Plugin: Tire vor Pousse vor 2sens.
// -----------------------------------------------------------------------------

import { buttonToDESText, pitchToKey } from "./des.js";

export function parseLHKeyboard(jsonText) {
  const raw = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
  const toSet = s => new Set(String(s || "").split("-").map(x => x.trim()).filter(Boolean));
  return {
    description: raw.description ?? "",
    tonalite: raw.tonalite ?? "",
    tire:   toSet(raw["Tire"]),
    pousse: toSet(raw["Pousse"]),
    twoSens: toSet(raw["2sens"]),
  };
}

const FLAT2SHARP = { AB:"G#", BB:"A#", CB:"B", DB:"C#", EB:"D#", FB:"E", GB:"F#" };
export function chordRoot(symbol) {
  let a = String(symbol).toUpperCase().trim().split("/")[0];   // "AM/C" -> "AM"
  if (/^[A-G]B/.test(a)) a = FLAT2SHARP[a[0] + "B"];           // bémol -> dièse
  return a.includes("#") ? a[0] + "#" : a[0];                  // -> Grundton
}

// options: { sensFa, sensSol } je 1=Zug / 2=Druck / 3=beide (Default 3); gilt nur für F bzw. G.
export function chordDirection(root, lh, options = {}) {
  if (lh.tire.has(root))   return "pull";        // Tire zuerst (Plugin-Reihenfolge)
  if (lh.pousse.has(root)) return "push";
  if (lh.twoSens.has(root)) {
    const sens = root[0] === "F" ? (options.sensFa ?? 3)
               : root[0] === "G" ? (options.sensSol ?? 3) : 3;
    return sens === 1 ? "pull" : sens === 2 ? "push" : "both";
  }
  return "both";                                 // unbekannter Grundton
}

export function filterByDirection(candidates, direction) {
  if (direction === "both") return candidates;
  const wantPush = direction === "push";
  return candidates.filter(c => c.push === wantPush);
}

// Einreihiges Spiel: bevorzugte Reihe (typeJeu 1 = G-Reihe/1, 2 = C-Reihe/2).
export function preferRow(candidates, row) {
  const hit = candidates.filter(c => c.row === row);
  return hit.length ? hit : candidates;
}

// High-Level. note:{step,alter,octave}; chordSymbol:string|null
// options: { typeJeu:1|2|3(=croisé,Default), sensFa, sensSol, onePossibility }
export function resolve(rh, lh, note, chordSymbol, options = {}) {
  const typeJeu = options.typeJeu ?? 3;
  const key = pitchToKey(note.step, note.alter ?? 0, note.octave);
  let cands = rh.map[key] ?? [];
  let direction = "both";

  if (typeJeu === 1)      cands = preferRow(cands, 1);
  else if (typeJeu === 2) cands = preferRow(cands, 2);
  else if (chordSymbol && lh) {                        // croisé: Akkord bestimmt Richtung
    direction = chordDirection(chordRoot(chordSymbol), lh, options);
    cands = filterByDirection(cands, direction);
  }
  if (options.onePossibility) cands = cands.slice(0, 1);
  return { key, direction, candidates: cands, des: cands.map(buttonToDESText) };
}
