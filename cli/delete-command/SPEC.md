---
name: Delete Command
description: Specifies the `archui delete <uuid> [--force]` command that resolves a module by UUID, deletes its folder recursively, and runs project-wide clean to remove all dangling submodule entries, links, and layout positions.
---

## Signature

```
archui delete <uuid> [--force]
```

## Behavior

1. Resolve the given 8-hex-char UUID to a module folder path by walking the project tree (reuses the same UUID resolution logic as the clean command).
2. **Root protection:** refuse to delete the project root module (the module whose UUID matches the root `.archui/index.yaml`). Exit with code 1 and an error message.
3. **Confirmation:** unless `--force` is provided, prompt the user for interactive confirmation before proceeding. If the user declines, exit with code 2.
4. Delete the resolved folder recursively (`fs.rmSync` with `recursive: true`).
5. Run the equivalent of `archui clean . --apply` on the project root to remove all dangling references:
   - Dangling submodule entries in parent `index.yaml`
   - Dangling link entries across the entire project
   - Dangling node entries in `layout.yaml` files

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Module deleted and references cleaned successfully |
| 1 | UUID not found, or target is the project root |
| 2 | User cancelled (interactive confirmation declined) |

## Dependencies

- **Clean Command** — reuses the `runClean` logic to sweep dangling references after folder deletion.
- **Validator** — reuses `findModuleByUuid` for UUID-to-path resolution.
