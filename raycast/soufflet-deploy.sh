#!/bin/bash
# @raycast.schemaVersion 1
# @raycast.title Soufflet · Deploy
# @raycast.mode fullOutput
# @raycast.packageName Soufflet
# @raycast.icon 🚀
# @raycast.argument1 { "type": "text", "placeholder": "Commit-Nachricht", "optional": true }
# @raycast.description Build + commit + push. Standard: GitHub Pages. IONOS: DEPLOY_IONOS=1 setzen.
# @raycast.author wdeu

# Raycast startet mit minimaler Umgebung ohne deine Shell-PATH.
# node verfügbar machen — deckt Homebrew (Apple Silicon/Intel), nvm, fnm, Volta ab:
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.local/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
command -v fnm >/dev/null 2>&1 && eval "$(fnm env)" >/dev/null 2>&1

REPO="${SOUFFLET_REPO:-$HOME/Projects/soufflet}"
cd "$REPO" || { echo "Repo nicht gefunden: $REPO"; exit 1; }

# keyboards.json neu bauen, falls node erreichbar; sonst Build überspringen (nicht abbrechen)
if command -v node >/dev/null 2>&1; then
  echo "node: $(command -v node) ($(node -v))"
  node tools/build-keyboards.mjs || { echo "Build fehlgeschlagen."; exit 1; }
else
  echo "node nicht gefunden — Build übersprungen (keyboards.json bleibt unverändert)."
  echo "  Pfad mit 'which node' prüfen und oben in PATH ergänzen."
fi

git add -A
git commit -m "${1:-update $(date '+%Y-%m-%d %H:%M')}" || echo "Nichts zu committen."

# --- Ziel(e) ---------------------------------------------------------------
git push                                   # GitHub Pages

# IONOS-Spiegel (soufflet.wdeu.de): auf 1 setzen, sobald die Subdomain steht
DEPLOY_IONOS=0
if [ "$DEPLOY_IONOS" = "1" ]; then
  "$HOME/Projects/raycast-scripts/ionos-sync.sh" "$REPO" soufflet.wdeu.de
fi
# ---------------------------------------------------------------------------
