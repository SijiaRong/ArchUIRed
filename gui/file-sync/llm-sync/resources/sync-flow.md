# LLM Sync Flow

## Sync Steps

When the user triggers LLM sync (via the GUI sync button or `archui sync` CLI):

```
1. git diff HEAD              → collect all changes since last sync point
2. Parse diff                 → identify which modules were added / changed / moved / deleted
3. Build impact set           → find all modules that reference changed modules (via UUID)
4. Pass to LLM:
      - The full git diff
      - The README.md content of each impacted module
      - The sync prompt (instructs LLM to update only affected fields)
5. LLM returns patches        → file-sync validates and applies patches to disk
6. git add + git commit       → commit the propagated changes with a generated message
7. Update .archui/index.yaml  → reflect any path changes from the sync
```

The LLM is never given write access to the repo directly. It returns a structured patch set that file-sync validates and applies, keeping the human in the loop via standard git tooling.

On any `SYNC_FAILURE`, original files are preserved intact (all writes are atomic), a structured log entry is written, and the user is notified with a retry option. See `operations/error-handling` for the full recovery strategy.

## File Watching

File-sync uses OS-level file watching (FSEvents on macOS, inotify on Linux, ReadDirectoryChangesW on Windows) to detect external edits. On detecting a change to any README.md:

1. Re-parse the frontmatter.
2. Emit a `module-updated` event to the canvas renderer.
3. If a new subfolder appears under a watched module, add it to the index and emit a `new-module` event.

File watching does not trigger LLM sync — it only keeps the canvas rendering current.
