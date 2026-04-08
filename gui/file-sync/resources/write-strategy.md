# File Sync Write Strategy

## Immediate Writes (no LLM required)

These operations have deterministic filesystem effects and are applied directly.

| GUI action | Filesystem effect |
|------------|------------------|
| Create module (new node) | Create folder + scaffold README.md with new UUID |
| Rename module | Rename folder; update `name` in README.md frontmatter |
| Delete module | Delete folder (with confirmation); remove from parent's `submodules` list |
| Add link (draw edge) | Append entry to source module's `links` frontmatter array |
| Remove link (delete edge) | Remove entry from source module's `links` frontmatter array |
| Reposition node | Write updated position to `.archui/layout.yaml` (applies to both module nodes and external stub nodes) |

## Deferred Writes (LLM sync required)

These operations have non-local effects requiring understanding of cross-file dependencies.

| GUI action | Why LLM sync is needed |
|------------|----------------------|
| Move module to new parent | Folder path changes; all `submodules` references in parent files must update; descriptions may need updating |
| Bulk rename / restructure | Multiple files affected; propagation scope unknown without reading the graph |
| Any change the user marks as "needs propagation" | User-driven; e.g., updating a description and wanting dependents notified |

Deferred writes are still applied immediately to disk (e.g., the folder is moved). LLM sync picks up the git diff and propagates consequences.

## LLM Sync Flow

When the user triggers sync (GUI sync button or `archui sync` CLI):

```
1. git diff HEAD              → collect all changes since last sync point
2. Parse diff                 → identify which modules were added / changed / moved / deleted
3. Build impact set           → find all modules that reference changed modules (via UUID)
4. Pass to LLM:
      - The full git diff
      - The README.md content of each impacted module
      - The sync prompt (instructs LLM to update only affected fields)
5. LLM returns patches        → file-sync applies patches to disk
6. git add + git commit       → commit the propagated changes with a generated message
7. Update .archui/index.yaml  → reflect any path changes from the sync
```

The LLM is never given write access to the repo directly. It returns a structured patch set that file-sync validates and applies, keeping the human in the loop via standard git tooling.

## `.archui/index.yaml` Format Example

```yaml
schema_version: 1
modules:
  5c9a1e3f: gui
  855df7a8: gui/screens
  537c63d3: gui/screens/canvas
  1ae0b731: gui/components
  6f1c4a9d: gui/components/module-node
  2a8e5b3f: gui/components/link-renderer
  9d4c7e1b: gui/components/navigation
  4b6a8d2e: gui/file-sync
  7e3f1c9a: gui/design-system
  2c4d8f1a: core
  # ... all modules
```
