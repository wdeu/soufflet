// tools/validate-keyboards.mjs — parst alle keyboards/*.keyboard und meldet übersprungene Tokens.
// Aufruf aus dem Repo-Root:  node tools/validate-keyboards.mjs
import fs from "fs";
import { fileURLToPath } from "url";
import { parseKeyboard }   from "../des.js";
import { parseLHKeyboard } from "../direction.js";

const srcDir = fileURLToPath(new URL("../keyboards/", import.meta.url));
const files  = fs.readdirSync(srcDir).filter(f => f.endsWith(".keyboard")).sort();
let warnTotal = 0;
for (const f of files) {
  const raw = JSON.parse(fs.readFileSync(srcDir + f, "utf8"));
  if (f.startsWith("RH_")) {
    const kb = parseKeyboard(raw);
    const tag = kb.warnings.length ? `\u26A0  ${kb.warnings.length}` : "OK ";
    console.log(`${tag}  ${f.padEnd(32)} ${Object.keys(kb.map).length} Töne`);
    if (kb.warnings.length) { warnTotal += kb.warnings.length; kb.warnings.forEach(w => console.log(`        ↳ ${w}`)); }
  } else if (f.startsWith("LH_")) {
    const k = parseLHKeyboard(raw);
    console.log(`OK   ${f.padEnd(32)} Tire ${k.tire.size} · Pousse ${k.pousse.size} · 2sens ${k.twoSens.size}`);
  }
}
console.log(warnTotal ? `\n${warnTotal} übersprungene Token gesamt (Tippfehler in Community-Layouts).` : "\nAlle Layouts sauber.");
