# Validation Rules

## Mandatory after every change — no exceptions

```bash
archui validate .
```

## Reading output

- `ERROR` — blocking, fix all before proceeding
- `WARN` — advisory, acceptable but note them

## Common warnings

| Warning | Meaning | Fix |
|---|---|---|
| `frontmatter/description-multiline` | `description` field spans multiple sentences or lines | Rewrite as one concise, declarative sentence |
| `links/memory-extra-links` | MEMORY module has outbound links beyond its parent SPEC | Advisory only — remove extra links if possible |
| `spec/multiple-memory` | SPEC module has more than one MEMORY submodule | Keep at most one MEMORY submodule |

## Common errors

| Error code | Meaning | Fix |
|---|---|---|
| `links/dangling-uuid` | A link targets a UUID not found in the project | Remove the link or add the missing module |
| `archui/undeclared-subfolder` | A subfolder exists but is not in `.archui/index.yaml` submodules | Add it to the parent's submodules map |
| `archui/submodule-not-found` | submodules map references a folder or UUID that doesn't exist | Remove the entry or create the missing folder |
| `frontmatter/missing-field` | README.md is missing `name` or `description` | Add the missing field |
| `archui/missing-file` | `.archui/index.yaml` not found | Create it with at minimum `schema_version: 1` and a `uuid` |
| `spec/missing-harness` | SPEC module has no HARNESS submodule | Add a `<name>-harness/` subfolder with a `HARNESS.md` identity document |
| `spec/multiple-harness` | SPEC module has more than one HARNESS submodule | Keep exactly one HARNESS submodule |

## If validation fails

Return to the relevant step and fix. Never proceed past a failing validation.
