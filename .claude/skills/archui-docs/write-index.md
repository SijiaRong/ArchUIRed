# Writing `.archui/index.yaml`

Every module folder must contain `.archui/index.yaml`. This file holds all structural metadata — identity, children, and cross-module relationships. The identity document (`SPEC.md`, `README.md`, etc.) holds only `name`, `description`, and prose.

## Schema

```yaml
schema_version: 1
uuid: <8-hex-char>
submodules:
  <folder-name>: <child-uuid>
links:
  - uuid: <target-uuid>
    relation: <relation-type>
    description: <optional free text>
```

## Field Reference

| Field | Type | Required | Rules |
|---|---|---|---|
| `schema_version` | `string` or `number` | Yes | Always `1`. |
| `uuid` | `string` | Yes | 8 lowercase hex characters (e.g., `93ab33c4`). Permanent — never changes after creation. |
| `submodules` | map of `string → string` | Yes | Keys are subfolder names, values are child UUIDs. Use `{}` when empty. |
| `links` | array of link objects | Yes | Each entry has `uuid` (required), `relation` (optional), `description` (optional). Use `[]` when empty. |

### Link entry fields

| Field | Required | Description |
|---|---|---|
| `uuid` | Yes | Target module's UUID. Must exist somewhere in the project. |
| `relation` | No | Recommended vocabulary below; custom strings are also valid. |
| `description` | No | One sentence explaining why this link exists. |

### Relation vocabulary

| Relation | Meaning |
|---|---|
| `depends-on` | This module needs the other to function. |
| `implements` | This module is a concrete implementation of the other. |
| `extends` | This module builds on the other. |
| `references` | Informational reference only. |
| `related-to` | Loosely related, no strict dependency. |

## UUID Rules

- Format: 8 lowercase hex characters.
- Generate with `openssl rand -hex 4`.
- Verify uniqueness: `grep -r "<uuid>" . --include="*.yaml"`.
- **Quote UUIDs that look like scientific notation** in YAML (e.g., `"785e2416"`, `"1d60422f"`). Unquoted, YAML may parse these as numbers.
- A UUID never changes after creation — not on rename, not on move, not on content edit.

## Submodules Map Rules

- Every subfolder on disk (except `resources/` and hidden dirs) must appear in `submodules`.
- Every entry in `submodules` must have a matching folder on disk.
- This bidirectional consistency is enforced by the validator.

## Examples

### Root module (no links)

```yaml
schema_version: 1
uuid: 7f3a1b9e
submodules:
  core: 2c4d8f1a
  gui: 5c9a1e3f
  cli: 1a5b9c3d
links: []
```

### SPEC with harness and links

```yaml
schema_version: 1
uuid: 76d5c149
submodules:
  context-menu-harness: "0e947f97"
links:
  - uuid: 6f1c4a9d
    relation: depends-on
    description: context menu is triggered by right-click events on primary and external reference cards
```

### HARNESS leaf (exactly one link, no submodules)

```yaml
schema_version: 1
uuid: 48cea7b3
submodules: {}
links:
  - uuid: 58a3b1dc
    relation: implements
```

### MEMORY leaf (one link to parent SPEC)

```yaml
schema_version: 1
uuid: <generated>
submodules: {}
links:
  - uuid: <parent-spec-uuid>
    relation: related-to
```

## Anti-Patterns

| Don't | Do |
|---|---|
| Put a `layout` key in index.yaml | Layout data belongs in `.archui/layout.yaml` |
| Leave `uuid` unquoted when it resembles scientific notation | Quote: `"785e2416"` |
| Omit `submodules` or `links` keys | Write `submodules: {}` and `links: []` explicitly |
| Add submodule entries without creating the folder | Create the folder first, then register |
| Reuse or change an existing UUID | Generate a new one; existing UUIDs are permanent |

## Relevant Validation Codes

| Code | Severity | Meaning |
|---|---|---|
| `missing-index` | error | `.archui/index.yaml` not found |
| `invalid-index-yaml` | error | YAML parse failure |
| `missing-uuid` | error | `uuid` field missing |
| `index/forbidden-layout-field` | error | `layout` key found in index.yaml |
| `undeclared-subfolder` | error | Disk folder not listed in `submodules` |
| `missing-submodule-folder` | error | `submodules` entry has no matching folder |
| `link-missing-uuid` | error | Link entry lacks `uuid` field |
