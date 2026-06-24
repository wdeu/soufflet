#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Soufflet · Deploy
# @raycast.mode fullOutput
# @raycast.packageName Soufflet
# @raycast.icon 🚀
# @raycast.argument1 { "type": "text", "placeholder": "Commit-Nachricht", "optional": true }
# @raycast.description Build + commit + push. Standard: GitHub Pages. Für *.wdeu.de via IONOS: unten umstellen.
# @raycast.author wdeu

REPO="${SOUFFLET_REPO:-$HOME/Projects/soufflet}"
cd "$REPO" || { echo "Repo nicht gefunden: $REPO"; exit 1; }

node tools/build-keyboards.mjs || exit 1
git add -A
git commit -m "${1:-update $(date '+%Y-%m-%d %H:%M')}" || echo "Nichts zu committen."
git push

# --- Variante IONOS (wie inserate.wdeu.de) -------------------------------
# Statt 'git push' deinen vorhandenen Sync aufrufen, z.B.:
#   "$HOME/Projects/raycast-scripts/ionos-sync.sh" "$REPO" soufflet.wdeu.de
# -------------------------------------------------------------------------
