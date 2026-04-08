#!/usr/bin/env bash
# Rename all test-playbook folders to <parent>-harness
# and rename README.md inside them to HARNESS.md
# Also update parent .archui/index.yaml submodule key

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Scanning for test-playbook directories under $ROOT ==="
echo ""

# Collect all paths first, sort deepest-first to avoid rename conflicts
DIRS_FILE=$(mktemp)
find "$ROOT" -type d -name "test-playbook" | sort -r > "$DIRS_FILE"

COUNT=$(wc -l < "$DIRS_FILE" | tr -d ' ')
if [ "$COUNT" -eq 0 ]; then
  echo "No test-playbook directories found."
  rm "$DIRS_FILE"
  exit 0
fi

echo "Found $COUNT directories to process."
echo ""

while IFS= read -r dir; do
  parent_dir="$(dirname "$dir")"
  parent_name="$(basename "$parent_dir")"
  new_name="${parent_name}-harness"
  new_dir="${parent_dir}/${new_name}"

  echo "Processing: $dir"

  # 1. Rename README.md → HARNESS.md inside
  if [ -f "$dir/README.md" ]; then
    mv "$dir/README.md" "$dir/HARNESS.md"
    echo "  ✓ README.md → HARNESS.md"
  else
    echo "  ! No README.md found (skipping file rename)"
  fi

  # 2. Rename the folder
  mv "$dir" "$new_dir"
  echo "  ✓ test-playbook → $new_name"

  # 3. Update parent .archui/index.yaml submodule key
  parent_index="${parent_dir}/.archui/index.yaml"
  if [ -f "$parent_index" ]; then
    # Replace key "test-playbook: <uuid>" with "<new_name>: <uuid>" under submodules
    sed -i '' "s/^  test-playbook:/  ${new_name}:/" "$parent_index"
    echo "  ✓ Updated $parent_index"
  else
    echo "  ! No .archui/index.yaml in parent (skipping index update)"
  fi

  echo ""
done < "$DIRS_FILE"
rm "$DIRS_FILE"

echo "=== Done. Run validator to verify: ==="
echo "  node $ROOT/cli/resources/dist/index.js validate ."
