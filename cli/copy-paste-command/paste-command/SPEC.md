---
name: Paste Command
description: Specifies the `archui paste [--into <uuid|path>]` command that reads an archui:// URI from the clipboard, duplicates the source module folder, registers it in the parent module, runs clean --apply, validates, and triggers agent repair if needed.
---

After the folder copy completes, the paste command must register the new module in the target (parent) module before running clean or validate:

1. Read the copied module's `.archui/index.yaml` to obtain its `uuid`.
2. Register `folderName → uuid` in the parent module's `.archui/index.yaml` `submodules` map.
3. Add a layout entry `uuid: { x: "0", y: "0" }` under the parent module's `.archui/layout.yaml` `layout` key so the new node appears on the canvas.

These steps mirror the registration logic already used by `createModule` and `archui init`.
