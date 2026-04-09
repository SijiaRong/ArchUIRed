# ArchUI Identity Document Authoring & Reading

Load this skill when **creating, modifying, or reading** any ArchUI identity document (`SPEC.md`, `HARNESS.md`, `MEMORY.md`, `SKILL.md`, `README.md`) or any `.archui/` metadata file (`index.yaml`, `layout.yaml`).

This skill uses **progressive disclosure** — the table below dispatches you to the exact sub-document you need. Load only what your task requires.

This skill complements `archui-spec` (structural workflow). `archui-spec` covers *filesystem structure rules — what folders must exist, what files go inside `.archui/`, and how to use the CLI*. This skill covers *how to write and read the content of identity documents and `.archui/` metadata files*.

---

## Dispatch Table

| Task | Load |
|---|---|
| Writing or enriching a **SPEC.md** | [write-spec.md](write-spec.md) |
| Reading a **SPEC.md** you haven't seen before | [read-spec.md](read-spec.md) |
| Writing or enriching a **HARNESS.md** | [write-harness.md](write-harness.md) |
| Writing or enriching a **MEMORY.md** | [write-memory.md](write-memory.md) |
| Writing or enriching a **README.md** | [write-readme.md](write-readme.md) |
| Reading any single module or scanning a module tree | [read-module.md](read-module.md) |
| Understanding frontmatter rules or the `description` field | [frontmatter-rules.md](frontmatter-rules.md) |
| Writing or reading a **`.archui/index.yaml`** | [write-index.md](write-index.md) |
| Writing or reading a **`.archui/layout.yaml`** | [write-layout.md](write-layout.md) |
| Checking a document before declaring it complete | [quality-checklist.md](quality-checklist.md) |

---

## Content Quality Rules (always apply)

These apply to **all** document types and are not repeated in sub-documents.

1. **Third-person present tense**: "This module validates…" not "I will validate…"
2. **Every sentence adds information**: If a sentence only restates the module name, delete it
3. **No source code in identity documents**: Code belongs in `resources/`. Describe the *design*
4. **No file listings**: Do not enumerate files in `resources/`. Summarize the approach
5. **Omit rather than stub**: An absent section is better than "TODO" or "See code"
6. **Concise by default**: 3–6 sentences per section unless complexity demands more
7. **Consistent terminology**: Use terms from the parent module or core spec — do not invent synonyms

---

## Progressive Disclosure Rules

These prevent documents from becoming unwieldy.

**Table of contents trigger**: If any identity document body exceeds **300 lines**, prepend a table of contents immediately after the frontmatter.

**Cross-referencing**: When one document needs information from another, write a 1–2 sentence summary and link to the authoritative source. Never copy content between documents.

**Section depth**: Limit heading depth to H3 (`###`). Use tables and lists instead of deeper nesting. If a section needs H4 or deeper, it is a candidate for splitting into a submodule.
