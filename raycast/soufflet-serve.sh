#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Soufflet · Serve
# @raycast.mode silent
# @raycast.packageName Soufflet
# @raycast.icon 🪗
# @raycast.description Lokalen Webserver starten und Soufflet öffnen (ES-Module brauchen http, nicht file://).
# Documentation:
# @raycast.author wdeu

REPO="${SOUFFLET_REPO:-$HOME/Projects/soufflet}"
cd "$REPO" || { echo "Repo nicht gefunden: $REPO"; exit 1; }
if ! lsof -i :8000 >/dev/null 2>&1; then
  (python3 -m http.server 8000 >/dev/null 2>&1 &)
  sleep 1
fi
open "http://localhost:8000/"
