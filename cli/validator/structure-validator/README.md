---
name: Structure Validator
description: "Checks that every module folder contains a valid identity document (README.md or SKILL.md) and a .archui/index.yaml, enforces the root-level hidden folder whitelist, and rejects unexpected files or subfolders."
---

## Overview

The structure validator is the first check in the validation pipeline. It traverses the module tree and verifies that the physical layout of folders and files matches what ArchUI permits. Structural errors are reported before any other validator runs.

## Rules Enforced

**Every folder must contain an identity document.**
A folder that exists without either `README.md` or `SKILL.md` is not a valid ArchUI module. If both exist, `README.md` takes precedence; if only `SKILL.md` exists, it is used as the identity document.

**Every folder must contain a `.archui/index.yaml`.**
A folder without `.archui/index.yaml` is a structural error — the module has no stable UUID and cannot be linked from other modules.

**Only permitted entries at module level.**
Inside any module folder, the only allowed entries are:
- `README.md` (identity document, preferred)
- `SKILL.md` (identity document, fallback)
- `.archui/` (required — contains `index.yaml`)
- `resources/` (optional)
- Named submodule folders declared in `.archui/index.yaml`

Any other file at module level is a violation.

**All subfolders (except `resources/`) must be declared submodules.**
Any subfolder that is not `resources/` and not listed in the parent's `.archui/index.yaml` `submodules` map is an undeclared subfolder — a violation.

**Root-level hidden folder whitelist.**
At the project root only, the following hidden folders are valid and traversed:
`.claude`, `.cursor`, `.aider`, `.windsurf`, `.github`, `.vscode`

Hidden folders at any other depth are never traversed. Whitelisted hidden folders that lack an identity document or `.archui/index.yaml` are silently skipped — not a validation error.

**`.archui/` is always exempt.**
The `.archui/` hidden folder inside every module is the structural metadata container. It is never treated as a submodule and never validated as a module folder.

**Submodule folder names must not contain spaces or uppercase letters.**

## Error Output

```
ERROR  [structure/missing-identity]       core/new-module/           folder has no README.md or SKILL.md
ERROR  [structure/missing-archui]         core/new-module/           folder has no .archui/index.yaml
ERROR  [structure/unexpected-file]        cli/validator/notes.md     unexpected file at module level
ERROR  [structure/invalid-folder-name]    cli/My Module/             folder name contains uppercase or spaces
ERROR  [archui/undeclared-subfolder]      core/.archui/index.yaml    subfolder 'orphan' exists but is not in submodules map
```

## Relationship to Other Validators

The structure validator only inspects filesystem layout — it does not read YAML content. Malformed identity documents or `.archui/index.yaml` files are caught by `frontmatter-validator` and `index-sync` respectively.
