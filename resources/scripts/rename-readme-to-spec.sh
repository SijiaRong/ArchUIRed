#!/usr/bin/env bash
# Rename README.md to SPEC.md in all folders that contain a non-empty resources/ subfolder
# Also update parent .archui/index.yaml submodule key if folder is registered there

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Scanning for folders with non-empty resources/ under $ROOT ==="
echo ""

# Collect all folders that have a non-empty resources/ subdir
TARGETS=()
while IFS= read -r resources_dir; do
  parent="$(dirname "$resources_dir")"
  # Check resources/ is non-empty (has at least one file/dir)
  if [ -n "$(ls -A "$resources_dir" 2>/dev/null)" ]; then
    TARGETS+=("$parent")
  fi
done < <(find "$ROOT" -type d -name "resources" | sort -r)

if [ ${#TARGETS[@]} -eq 0 ]; then
  echo "No matching folders found."
  exit 0
fi

echo "Found ${#TARGETS[@]} folders to process."
echo ""

for dir in "${TARGETS[@]}"; do
  if [ -f "$dir/README.md" ]; then
    echo "Processing: $dir"
    mv "$dir/README.md" "$dir/SPEC.md"
    echo "  ✓ README.md → SPEC.md"
    echo ""
  fi
done

echo "=== Done. Run validator to verify: ==="
echo "  node $ROOT/cli/resources/dist/index.js validate ."
