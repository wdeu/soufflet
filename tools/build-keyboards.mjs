// tools/build-keyboards.mjs — erzeugt ../keyboards.json aus ../keyboards/*.keyboard
// Aufruf aus dem Repo-Root:  node tools/build-keyboards.mjs
import fs from "fs";
import { fileURLToPath } from "url";
import { parseKeyboard }   from "../des.mjs";
import { parseLHKeyboard } from "../direction.mjs";

const srcDir  = fileURLToPath(new URL("../keyboards/", import.meta.url));
const outFile = fileURLToPath(new URL("../keyboards.json", import.meta.url));

const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".keyboard")).sort();
const bundle = { version: 1, generated: new Date().toISOString().slice(0,10),
                 defaults: { rh: "RH_GCStd2R21", lh: "LH_Sol-Do_GC_8Bass" },
                 rh: {}, lh: {}, index: [] };
const tonRH  = f => (f.match(/^RH_(GCF|GC|BC|CdD)/) || [,"?"])[1];
const basses = f => (f.match(/(\d+)\s*Bass/i) || [,null])[1];

for (const f of files) {
  const id  = f.replace(/\.keyboard$/, "");
  const raw = JSON.parse(fs.readFileSync(srcDir + f, "utf8"));
  if (f.startsWith("RH_")) {
    const kb = parseKeyboard(raw);
    const rows = [...new Set(Object.values(kb.map).flat().map(c => c.row))];
    bundle.rh[id] = raw;
    bundle.index.push({ id, kind:"rh", file:f, description: kb.description,
      tonalite: tonRH(f), rows: rows.length ? Math.max(...rows) : 0,
      notes: Object.keys(kb.map).length,
      ...(kb.warnings.length ? { warnings: kb.warnings.length } : {}) });
  } else if (f.startsWith("LH_")) {
    const k = parseLHKeyboard(raw);
    bundle.lh[id] = raw;
    bundle.index.push({ id, kind:"lh", file:f, description: k.description,
      tonalite: k.tonalite || "?", basses: basses(f) ? Number(basses(f)) : null });
  }
}
bundle.index.sort((a,b) =>
  a.kind.localeCompare(b.kind) || a.tonalite.localeCompare(b.tonalite) || a.description.localeCompare(b.description));
fs.writeFileSync(outFile, JSON.stringify(bundle, null, 1));
const rh = bundle.index.filter(e=>e.kind==="rh").length, lh = bundle.index.length - rh;
console.log(`keyboards.json geschrieben: ${rh} RH + ${lh} LH = ${bundle.index.length} Layouts (${fs.statSync(outFile).size} B)`);
