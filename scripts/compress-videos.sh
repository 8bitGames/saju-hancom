#!/bin/bash

# Compress videos for web - reduce to 720px width, optimize for web streaming
# This should reduce file sizes by ~80%

mkdir -p public/output-loop/compressed

for file in public/output-loop/*.mp4; do
  filename=$(basename "$file")
  echo "Compressing $filename..."

  ffmpeg -i "$file" \
    -vf "scale=720:-2" \
    -c:v libx264 \
    -crf 28 \
    -preset slow \
    -movflags +faststart \
    -an \
    "public/output-loop/compressed/$filename"
done

echo "Done! Check public/output-loop/compressed/"
echo "If quality looks good, run: mv public/output-loop/compressed/*.mp4 public/output-loop/"
