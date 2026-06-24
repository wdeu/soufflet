#!/bin/bash
# Einmaliges Setup: Skripte ausführbar machen; GPL-2.0-Text nur holen, wenn nicht schon da.
# Klobbert eine vorhandene LICENSE NIE (schreibt erst in .tmp, ersetzt nur bei Erfolg).
cd "$(dirname "$0")/.."

if [ -f LICENSE ] && [ "$(wc -l < LICENSE)" -gt 200 ]; then
  echo "LICENSE bereits vollständig ($(wc -l < LICENSE) Zeilen) — kein Download nötig."
elif curl -fsSL https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt -o LICENSE.tmp 2>/dev/null && [ -s LICENSE.tmp ]; then
  mv LICENSE.tmp LICENSE
  echo "LICENSE (GPL-2.0) geholt."
else
  rm -f LICENSE.tmp
  echo "Kein Internet — LICENSE unverändert gelassen."
  echo "Voller Text liegt bereits im Repo bzw. unter https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt"
fi

chmod +x raycast/*.sh tools/*.sh 2>/dev/null || true
echo "Setup fertig."
