#!/usr/bin/env bash
# Converts the raw Playwright recording (output/raw.webm) into the two
# committed demo assets. Requires ffmpeg on PATH.
set -euo pipefail

cd "$(dirname "$0")"

RAW="output/raw.webm"
DOCS_ASSETS="../../docs/assets"
MP4="$DOCS_ASSETS/demo.mp4"
GIF="$DOCS_ASSETS/demo.gif"
PALETTE="output/palette.png"

if [ ! -f "$RAW" ]; then
  echo "error: $RAW not found — run 'npm run record' first" >&2
  exit 1
fi

mkdir -p "$DOCS_ASSETS"

echo "Encoding $MP4 ..."
ffmpeg -y -i "$RAW" \
  -vf "scale=1280:-2" \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart \
  "$MP4"

echo "Building palette for $GIF ..."
ffmpeg -y -i "$RAW" -vf "fps=12,scale=960:-2:flags=lanczos,palettegen" -update 1 -frames:v 1 "$PALETTE"

echo "Encoding $GIF ..."
ffmpeg -y -i "$RAW" -i "$PALETTE" \
  -lavfi "fps=12,scale=960:-2:flags=lanczos[x];[x][1:v]paletteuse" \
  "$GIF"

rm -f "$PALETTE"

echo "Done:"
ls -lh "$MP4" "$GIF"
