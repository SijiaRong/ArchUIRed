#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — Claude Code adapter deployment script
# Run from the repo root: bash core/agent-config/claude-code/resources/deploy.sh
#
# Reads source content from canonical template directories:
#   skill-templates/resources/<skill>/    — skill entry points
#   rule-templates/resources/<skill>/     — per-skill rule sub-documents
#   command-templates/resources/<cmd>.md  — executable agent commands
#
# The deployment destination is defined in adapter.env alongside this script.
# This script contains no hardcoded agent-tool paths.
#
# Idempotent: re-running overwrites deployed files with canonical template content.
# To update deployed content, edit the source templates — never edit deployed files.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

# Load adapter-specific destination from sibling config file
# shellcheck source=adapter.env
source "${SCRIPT_DIR}/adapter.env"

SKILL_TEMPLATES="${REPO_ROOT}/core/agent-config/skill-templates/resources"
RULE_TEMPLATES="${REPO_ROOT}/core/agent-config/rule-templates/resources"
CMD_TEMPLATES="${REPO_ROOT}/core/agent-config/command-templates/resources"

DEST_SKILLS="${REPO_ROOT}/${ADAPTER_SKILLS_DIR}"

# ---------------------------------------------------------------------------
echo "==> Deploying archui-spec skill ..."
mkdir -p "${DEST_SKILLS}/archui-spec/rules"

cp "${SKILL_TEMPLATES}/archui-spec/SKILL.md" \
   "${DEST_SKILLS}/archui-spec/SKILL.md"

for rule_dir in spec-format uuid validation resources commits sync context-loading; do
  mkdir -p "${DEST_SKILLS}/archui-spec/rules/${rule_dir}"
  cp "${RULE_TEMPLATES}/archui-spec/${rule_dir}/README.md" \
     "${DEST_SKILLS}/archui-spec/rules/${rule_dir}/README.md"
done

# ---------------------------------------------------------------------------
echo "==> Deploying archui-docs skill ..."
mkdir -p "${DEST_SKILLS}/archui-docs"

cp "${SKILL_TEMPLATES}"/archui-docs/*.md "${DEST_SKILLS}/archui-docs/"

# ---------------------------------------------------------------------------
echo "==> Deploying commands ..."
mkdir -p "${DEST_SKILLS}/archui-spec/commands"

cp "${CMD_TEMPLATES}/convert-project.md" \
   "${DEST_SKILLS}/archui-spec/commands/convert-project.md"

# ---------------------------------------------------------------------------
echo "==> Deployment complete."
echo "    Deployed to: ${DEST_SKILLS}"
