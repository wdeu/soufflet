// musicxml.mjs — MusicXML -> Melodie-mit-Akkorden-Strom -> D.E.S. (über resolve()).
// Abhängigkeitsfrei: eigener Mini-XML-Parser, läuft in Node und im Browser gleich.
// .mxl (ZIP) wird NICHT hier entpackt — siehe loadMxl-Hinweis unten; readMusicXML
// erwartet bereits den entpackten MusicXML-Text (string).
// -----------------------------------------------------------------------------

import { resolve } from "./direction.mjs";

// ---------- 1. Mini-XML-Parser ----------------------------------------------
const ENT = { amp:"&", lt:"<", gt:">", quot:'"', apos:"'" };
function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(parseInt(e[1] === "x" ? e.slice(2) : e.slice(1), e[1] === "x" ? 16 : 10));
    return ENT[e] ?? m;
  });
}
function parseTag(raw) {
  const sp = raw.search(/\s/);
  const tag = sp < 0 ? raw : raw.slice(0, sp);
  const attrs = {};
  if (sp >= 0) {
    const re = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = re.exec(raw))) attrs[m[1]] = decode(m[3] ?? m[4] ?? "");
  }
  return { tag, attrs };
}
export function parseXML(xml) {
  xml = xml.replace(/^\uFEFF/, "");
  const root = { tag: "#root", attrs: {}, children: [], text: "" };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let i = 0;
  const n = xml.length;
  while (i < n) {
    if (xml[i] === "<") {
      if (xml.startsWith("<!--", i)) { const e = xml.indexOf("-->", i + 4); i = e < 0 ? n : e + 3; continue; }
      if (xml.startsWith("<?", i))   { const e = xml.indexOf("?>", i + 2);  i = e < 0 ? n : e + 2; continue; }
      if (xml.startsWith("<![CDATA[", i)) { const e = xml.indexOf("]]>", i + 9); top().text += xml.slice(i + 9, e < 0 ? n : e); i = e < 0 ? n : e + 3; continue; }
      if (xml.startsWith("<!", i)) { let d = 0, j = i + 2; for (; j < n; j++) { const c = xml[j]; if (c === "[") d++; else if (c === "]") d--; else if (c === ">" && d <= 0) { j++; break; } } i = j; continue; }
      if (xml[i + 1] === "/") { const e = xml.indexOf(">", i); if (stack.length > 1) stack.pop(); i = e + 1; continue; }
      const e = xml.indexOf(">", i);
      let raw = xml.slice(i + 1, e).trim();
      const self = raw.endsWith("/");
      if (self) raw = raw.slice(0, -1).trim();
      const { tag, attrs } = parseTag(raw);
      const node = { tag, attrs, children: [], text: "" };
      top().children.push(node);
      if (!self) stack.push(node);
      i = e + 1;
    } else {
      const e = xml.indexOf("<", i);
      top().text += decode(xml.slice(i, e < 0 ? n : e));
      i = e < 0 ? n : e;
    }
  }
  return root;
}
const kids = (node, tag) => node ? node.children.filter(c => c.tag === tag) : [];
const kid  = (node, tag) => node ? node.children.find(c => c.tag === tag) : undefined;
const txt  = node => node ? node.text.trim() : "";
function findFirst(node, tag) {
  if (!node) return undefined;
  for (const c of node.children) { if (c.tag === tag) return c; const r = findFirst(c, tag); if (r) return r; }
}

// ---------- 2. Akkord aus <harmony> -----------------------------------------
// Liefert ein Symbol wie "C", "Bb", "F#" (Grundton + Versetzung), das resolve()/
// chordRoot weiterverarbeitet. kind="none" / N.C. -> null (kein Akkord).
function harmonyToSymbol(h) {
  const kind = txt(kid(h, "kind")) || kid(h, "kind")?.attrs.text || "";
  if (kind === "none") return null;
  const root = kid(h, "root");
  if (!root) return null;                         // z.B. <function>-Akkorde -> ignorieren
  const step = txt(kid(root, "root-step"));
  if (!step) return null;
  const alter = Number(txt(kid(root, "root-alter")) || 0);
  return step + (alter > 0 ? "#".repeat(alter) : alter < 0 ? "b".repeat(-alter) : "");
}

// ---------- 3. Melodie-mit-Akkorden-Strom -----------------------------------
// options: { partId, voice, staff, includeRests }
export function melodyWithChords(xmlString, options = {}) {
  const root = parseXML(xmlString);
  const score = findFirst(root, "score-partwise");
  if (!score) {
    if (findFirst(root, "score-timewise")) throw new Error("score-timewise wird nicht unterstützt (bitte als partwise exportieren).");
    throw new Error("Kein <score-partwise> gefunden.");
  }
  // Teilliste
  const partList = kid(score, "part-list");
  const partNames = {};
  for (const sp of kids(partList, "score-part")) partNames[sp.attrs.id] = txt(kid(sp, "part-name"));
  const parts = kids(score, "part");
  const part = options.partId ? parts.find(p => p.attrs.id === options.partId) : parts[0];
  if (!part) throw new Error(`Part "${options.partId}" nicht gefunden.`);

  const events = [];
  let currentChord = null;
  let mIndex = 0;
  for (const measure of kids(part, "measure")) {
    mIndex++;
    for (const el of measure.children) {
      if (el.tag === "harmony") { currentChord = harmonyToSymbol(el); continue; }
      if (el.tag !== "note") continue;
      const voice = txt(kid(el, "voice"));
      const staff = txt(kid(el, "staff"));
      if (options.voice && voice && voice !== String(options.voice)) continue;
      if (options.staff && staff && staff !== String(options.staff)) continue;
      const isRest = !!kid(el, "rest");
      const inChord = !!kid(el, "chord");          // mit Vornote gestapelt (Mehrklang)
      if (isRest) { if (options.includeRests) events.push({ measure: mIndex, rest: true, chord: currentChord }); continue; }
      const pitch = kid(el, "pitch");
      if (!pitch) continue;                        // unpitched/percussion überspringen
      events.push({
        measure: mIndex,
        step: txt(kid(pitch, "step")),
        alter: Number(txt(kid(pitch, "alter")) || 0),
        octave: Number(txt(kid(pitch, "octave"))),
        chord: currentChord,
        inChord, voice, staff,
        duration: Number(txt(kid(el, "duration")) || 0),
      });
    }
  }
  return { title: txt(findFirst(score, "movement-title")) || txt(findFirst(score, "credit-words")),
           parts: parts.map(p => ({ id: p.attrs.id, name: partNames[p.attrs.id] || "" })),
           events };
}

// ---------- 4. Komplett-Durchlauf: MusicXML -> D.E.S. -----------------------
// rh: parseKeyboard(); lh: parseLHKeyboard()|null; opts -> melodyWithChords + resolve.
export function transcribe(rh, lh, xmlString, opts = {}) {
  const { title, parts, events } = melodyWithChords(xmlString, opts);
  const tab = events.map(ev => {
    if (ev.rest) return { ...ev, des: [] };
    const r = resolve(rh, lh, { step: ev.step, alter: ev.alter, octave: ev.octave }, ev.chord, opts);
    return { ...ev, key: r.key, direction: r.direction, des: r.des };
  });
  return { title, parts, tab };
}

// ---------- .mxl-Hinweis (Browser-Glue, kein Node-Test) ---------------------
// .mxl ist ein ZIP. Im Browser z.B. mit fflate:
//   import { unzipSync, strFromU8 } from "fflate";
//   const files = unzipSync(new Uint8Array(arrayBuffer));
//   const container = strFromU8(files["META-INF/container.xml"]);
//   const rootfile = container.match(/full-path="([^"]+)"/)[1];   // meist score.xml
//   const xml = strFromU8(files[rootfile]);
//   transcribe(rh, lh, xml, opts);
