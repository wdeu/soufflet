#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Soufflet · Check layouts
# @raycast.mode fullOutput
# @raycast.packageName Soufflet
# @raycast.icon 🔎
# @raycast.description Alle .keyboard-Layouts parsen und Tippfehler/übersprungene Tokens melden.
# @raycast.author wdeu

REPO="${SOUFFLET_REPO:-$HOME/Projects/soufflet}"
cd "$REPO" || { echo "Repo nicht gefunden: $REPO"; exit 1; }
node tools/validate-keyboards.mjs
