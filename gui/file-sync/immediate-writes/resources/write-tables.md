# Immediate Writes Reference

## Immediate Writes (no LLM required)

| GUI action | Filesystem effect |
|------------|------------------|
| Create module (new node) | Create folder + scaffold README.md with new UUID |
| Rename module | Rename folder; update `name` in README.md frontmatter |
| Delete module | Delete folder (with confirmation); remove from parent's `submodules` list |
| Add link (draw edge) | Append entry to source module's `links` frontmatter array |
| Remove link (delete edge) | Remove entry from source module's `links` frontmatter array |
| Reposition node | Write updated position to `.archui/layout.yaml` |

All immediate writes are atomic where possible (write to temp file, then rename). On any `FILESYSTEM_ERROR`, the operation is aborted and the error is surfaced — no partial writes are committed.

## Deferred Writes (LLM sync required)

| GUI action | Why LLM sync is needed |
|------------|----------------------|
| Move module to new parent | Folder path changes; all `submodules` references in parent files must update; descriptions may need updating |
| Bulk rename / restructure | Multiple files affected; propagation scope unknown without reading the graph |
| Any change the user marks as "needs propagation" | User-driven; e.g., changing a module's description and wanting dependents notified |

Deferred writes are still applied immediately to disk as the simplest possible filesystem operation. LLM sync picks up the git diff and propagates consequences.
