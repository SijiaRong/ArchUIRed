# ArchUI CLI Usage

The CLI validates filesystem conformance and manages module lifecycle. All commands operate on the filesystem — there is no database.

## Building

If the built CLI is unavailable:

```bash
cd cli/resources && npm run build
```

The compiled entry point is `cli/resources/dist/index.js`.

## Commands

### `validate [path]`

Check filesystem conformance against all ArchUI structural rules.

```bash
node cli/resources/dist/index.js validate .
node cli/resources/dist/index.js validate ./my-project
node cli/resources/dist/index.js validate --only frontmatter
```

**Options:**
- `--only <validator>` — Run a single validator. Values: `structure`, `frontmatter`, `links`, `index`, `layout`.

**Behavior:** Runs five validators in sequence. Prints `WARN` lines first, then `ERROR` lines. Exit code = `min(error_count, 127)` (0 if no errors).

**The five validators:**

| Validator | What it checks |
|---|---|
| `structure` | Identity doc exists; `.archui/index.yaml` and `.archui/layout.yaml` exist; subfolders match `submodules` map; SPEC has exactly 1 HARNESS, at most 1 MEMORY; no `layout` key in `index.yaml`. |
| `frontmatter` | Valid YAML frontmatter with `name` and `description`; no forbidden fields (`uuid`, `submodules`, `links`) in identity docs; `uuid` present in `index.yaml`. |
| `links` | Every link entry has a `uuid` field. |
| `index` | Bidirectional sync between `submodules` map and disk folders. |
| `layout` | Node overlap detection (220x120 px default size, 200 px² threshold). |

### `init [path]`

Initialize a new ArchUI project at a directory.

```bash
node cli/resources/dist/index.js init .
node cli/resources/dist/index.js init ./my-project --name "My Project" --description "A cool thing"
node cli/resources/dist/index.js init . --skip-agents
node cli/resources/dist/index.js init . --convert
```

**Options:**
- `--name <name>` — Module name for `README.md` frontmatter (defaults to directory basename).
- `--description <desc>` — One-sentence summary (interactive prompt if omitted in TTY).
- `--skip-agents` — Skip agent detection and plugin installation.
- `--convert` — After init, invoke an AI agent to convert the existing project tree into ArchUI modules.

**What it creates:**
1. `README.md` with frontmatter (merges if file already exists).
2. `.archui/index.yaml` with `schema_version: 1`, generated UUID, `submodules: {}`, `links: []`.
3. `.archui/layout.yaml` with empty leaf form.
4. Git-stages the new files if inside a git repo.

Idempotent: if `.archui/index.yaml` already exists, prints the existing UUID and exits.

### `clean <target>`

Remove dangling UUID references from a module subtree.

```bash
node cli/resources/dist/index.js clean 93ab33c4           # dry-run by UUID
node cli/resources/dist/index.js clean ./some/module       # dry-run by path
node cli/resources/dist/index.js clean 93ab33c4 --apply    # apply changes
```

**Options:**
- `--apply` — Actually modify files (default is dry-run, report only).

**What it prunes:**
- `index.yaml`: removes links whose `uuid` no longer exists in the project; removes submodule entries whose folders are missing.
- `layout.yaml`: removes UUID-keyed entries that no longer exist in the project.

### `copy <uuid>`

Copy a module's filesystem path to the system clipboard by its UUID.

```bash
node cli/resources/dist/index.js copy 93ab33c4
```

Writes an `archui://copy?path=<abs-path>&uuid=<uuid>` URI to the clipboard (macOS `pbcopy`, Linux `xclip`/`xsel`, Windows `clip`).

### `paste`

Paste a previously copied module from the clipboard into the current workspace.

```bash
node cli/resources/dist/index.js paste
node cli/resources/dist/index.js paste --into 5f3a21bc
node cli/resources/dist/index.js paste --into ./some/path
```

**Options:**
- `--into <target>` — Target module UUID or path (defaults to project root).

**Behavior:**
1. Reads the `archui://copy` URI from the clipboard.
2. Copies the folder recursively (with collision-avoidance suffixes).
3. Registers the pasted module in the parent's `index.yaml` submodules.
4. Adds a layout entry in the parent's `layout.yaml` at a non-overlapping position.
5. Runs `clean --apply` on the pasted subtree.
6. Runs `validate` on the whole project.

## Validation Code Reference

| Code | Severity | Meaning |
|---|---|---|
| `missing-readme` | error | No identity document found |
| `missing-index` | error | `.archui/index.yaml` not found |
| `invalid-index-yaml` | error | YAML parse failure in `index.yaml` |
| `structure/missing-layout` | error | `.archui/layout.yaml` not found |
| `index/forbidden-layout-field` | error | `layout` key found inside `index.yaml` |
| `undeclared-subfolder` | error | Disk folder not in `submodules` map |
| `missing-submodule-folder` | error | `submodules` entry has no matching folder |
| `index-submodule-missing-on-disk` | error | Same as above (from index sync validator) |
| `undeclared-directory-in-index` | error | Folder exists but not declared |
| `spec/missing-harness` | error | SPEC has no HARNESS submodule |
| `spec/multiple-harness` | error | SPEC has more than 1 HARNESS |
| `spec/multiple-memory` | warn | SPEC has more than 1 MEMORY |
| `missing-uuid` | error | `uuid` field missing from `index.yaml` |
| `invalid-frontmatter` | error | YAML frontmatter parse failure |
| `missing-name` | error | `name` field missing from frontmatter |
| `missing-description` | error | `description` field missing from frontmatter |
| `forbidden-frontmatter-field` | error | Structural field found in identity doc frontmatter |
| `link-missing-uuid` | error | Link entry lacks `uuid` field |
| `layout/node-overlap` | warn | Two nodes overlap by more than 200 px² |
