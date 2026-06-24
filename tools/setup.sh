#!/bin/bash
# Einmaliges Setup: offiziellen GPL-2.0-Text holen und Skripte ausführbar machen.
set -e
cd "$(dirname "$0")/.."
curl -fsSL https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt -o LICENSE \
  && echo "LICENSE (GPL-2.0) geholt." || echo "Konnte LICENSE nicht laden — bitte manuell von gnu.org."
chmod +x raycast/*.sh tools/*.sh
echo "Setup fertig."
