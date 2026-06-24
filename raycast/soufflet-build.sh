#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Soufflet · Build keyboards.json
# @raycast.mode fullOutput
# @raycast.packageName Soufflet
# @raycast.icon 🛠️
# @raycast.description keyboards.json aus dem Ordner keyboards/ neu erzeugen (nach neuen/geänderten Layouts).
# @raycast.author wdeu

REPO="${SOUFFLET_REPO:-$HOME/Projects/soufflet}"
cd "$REPO" || { echo "Repo nicht gefunden: $REPO"; exit 1; }
node tools/build-keyboards.mjs
