---
name: Design System Test Playbook
description: "Playbook for verifying that platform implementations correctly consume Figma design tokens via MCP, apply them to UI components, and update token files when the Figma source changes."
---

## Playbook

### Group 1: Figma MCP token resolution

[init] The Figma MCP integration is configured and the Figma design file is accessible. An implementation agent is scoped to one platform (e.g., Web).

[action] Use the MCP to fetch the component spec for Node/ModuleNode/Default.
[eval] The MCP returns a structured JSON object containing geometry, fill tokens, typography tokens, spacing, corner radius, shadow, and all child layer properties for the ModuleNode/Default component.

[action] Use the MCP to resolve the token figma://token/color/surface-default.
[eval] The MCP returns the resolved hex value for the surface-default token and its semantic meaning. The result is a token name reference, not a raw hex value, suitable for use in implementation code.

[action] Use the MCP to list all tokens under figma://tokens/color.
[eval] The MCP returns a complete list of all color tokens including all surface, text, edge, status, and interactive token names and their resolved values.

[end] No filesystem changes from these read-only MCP queries.

### Group 2: Platform token mapping files are generated from MCP output

[init] Each platform's codebase has a generated token mapping file (CSS custom properties for Web, Swift Color extensions for iOS, Theme.kt for Android). The Figma Foundations page is at a known state.

[action] Run archui figma-sync to regenerate token files for all platforms.
[eval] Token mapping files for all three platforms are regenerated. Each file contains entries that match the current Figma token values. The files are committed to their respective platform codebases.

[action] Manually edit a generated token file (e.g., change a CSS custom property value by hand) and then run archui figma-sync again.
[eval] The manual edit is overwritten. The generated file is restored to match the Figma source. This confirms that generated files must not be hand-edited.

[end] No cleanup needed; all token files are in their correct generated state.

### Group 3: Component naming conventions allow unambiguous MCP queries

[init] The Figma MCP is accessible. The full component naming convention (Category/ComponentName/Variant) is in use.

[action] Query a component using only a partial path, e.g., "ModuleNode" without the Category prefix.
[eval] The MCP returns an ambiguous result or an error indicating the partial path is not sufficient to resolve a unique component.

[action] Query the same component using the full path Node/ModuleNode/Default.
[eval] The MCP returns the correct, unique component spec without ambiguity.

[action] Query each of the following component paths and confirm each resolves to a distinct component spec: Node/ModuleNode/Selected, Node/ModuleNode/Modified, Node/ModuleNode/Error.
[eval] Each query returns a distinct spec corresponding to the correct visual variant (e.g., selected state has a selection indicator, modified state has amber accent, error state has red border).

[end] No filesystem changes from these read-only MCP queries.

### Group 4: Figma change workflow propagates to all platforms

[init] The Figma designer updates the color/surface-default token on the Foundations page with a new value. Platform token files currently contain the old value.

[action] Run archui figma-sync.
[eval] All three platform token files are regenerated. Each file now reflects the new color/surface-default value. The changes are committed to each platform's codebase.

[action] Run the platform-specific CI build for each platform after the token regeneration.
[eval] All platform builds compile successfully with the new token values. No build errors due to the token change.

[end] No further cleanup needed; the updated token files are the new correct state.
