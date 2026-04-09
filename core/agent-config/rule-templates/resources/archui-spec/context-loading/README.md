# Module Context Loading

> **This rule has moved to `archui-docs`.**
>
> When reading any module, you must always load both the identity document and `.archui/index.yaml`. Load the `archui-docs` skill and follow `read-module.md` for the full context-loading workflow and efficient tree-scanning strategies.

## Summary

When reading any module's identity document (`README.md`, `SPEC.md`, `SKILL.md`, `HARNESS.md`, `MEMORY.md`), you **must also read** `.archui/index.yaml` in the same directory. A module's context is not complete until both files have been read.

Identity documents provide `name`, `description`, and prose. `.archui/index.yaml` provides `uuid`, `submodules`, and `links`. Both halves are required.
