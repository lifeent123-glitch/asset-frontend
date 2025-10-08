#!/usr/bin/env bash
set -euo pipefail

# 1) 各ページに Header import があるか
PAGES=("Dashboard" "Assets" "Files" "ManualEntry" "Reports" "Admin")
MISS=0

for NAME in "${PAGES[@]}"; do
  FILE="src/pages/${NAME}.tsx"
  if [ ! -f "$FILE" ]; then
    echo "❌ Not found: $FILE"
    MISS=1
    continue
  fi

  if ! grep -q 'import Header from "../components/Header"' "$FILE"; then
    echo "❌ Missing import Header in $FILE"
    MISS=1
  fi

  if ! grep -q '<Header\s*/>' "$FILE"; then
    echo "❌ Missing <Header /> in $FILE"
    MISS=1
  fi
done

# 2) App.tsx に Header が残っていないことを確認
if grep -q 'import Header from "./components/Header"' src/App.tsx 2>/dev/null; then
  echo "❌ App.tsx で Header を呼び出しています（二重表示の原因）"
  MISS=1
fi

if [ "$MISS" -eq 0 ]; then
  echo "✅ Header verification passed (all pages import & render Header, App.tsx does not)."
else
  echo "⚠️ Header verification failed. ↑の❌を修正してください。"
  exit 1
fi
