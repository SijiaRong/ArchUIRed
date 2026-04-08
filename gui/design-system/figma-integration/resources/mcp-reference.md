# Figma MCP Reference

## Figma File

- **File key:** `beEbYQhz9LBLHrAj2eGyft`
- **File URL:** https://www.figma.com/design/beEbYQhz9LBLHrAj2eGyft/ArchUI-Design-System
- **MCP server:** `figma` (HTTP MCP at https://mcp.figma.com/mcp), configured in Cursor's MCP settings as `plugin-figma-figma`.

> **Forking this project?** Replace the file key and URL above (and the corresponding references in other `resources/` spec files) with your own Figma file. The file key is the alphanumeric segment in your Figma file URL: `https://www.figma.com/design/<file-key>/Your-File-Name`.

## Credential Management

| Credential | Where it lives |
|---|---|
| Figma Personal Access Token | Cursor MCP config (`~/.cursor/mcp.json`) — set by the human operator |
| Figma OAuth token | Same — managed by the MCP server, not by agents |
| Figma file key | `resources/mcp-reference.md` (non-sensitive — it is the identifier in a Figma URL) |

Agents must never write any credential values into module files, `resources/`, or any tracked file.

## Figma File Structure

| Page | Contents |
|------|----------|
| `Foundations` | Color tokens, typography styles, spacing scale, elevation/shadow, border-radius tokens |
| `Components` | All reusable UI components (module-node card, edge/link, breadcrumb, command palette, panels) |
| `Canvas Layouts` | Full-canvas compositions showing node arrangements, navigation states, empty states |
| `Platform Notes` | Per-platform guidance — where native components differ from the web baseline |
| `Spec Redlines` | Annotated specs with exact measurements for edge cases not captured in Auto Layout |

## Component Naming Conventions

Components in Figma follow a `Category/ComponentName/Variant` naming pattern:

```
Node/ModuleNode/Default
Node/ModuleNode/Selected
Node/ModuleNode/Modified
Node/ModuleNode/Error
Edge/LinkEdge/DependsOn
Edge/LinkEdge/Implements
Edge/LinkEdge/References
Edge/ExternalStub/Default
Nav/Breadcrumb/Default
Nav/Breadcrumb/Root
UI/CommandPalette/Open
UI/CommandPalette/Closed
UI/SyncButton/Idle
UI/SyncButton/Syncing
UI/SyncButton/Error
```

Use the full slash-separated path in MCP queries. Partial paths are ambiguous.

## MCP Call Patterns

### Fetch a component spec

Use `get_design_context` with the component's `nodeId` to retrieve geometry, fills, typography, spacing, corner radius, shadow, and child layers. Resolve `nodeId` from the component name by first calling `get_metadata` on the file to get the node tree, then navigating to the target component.

### Fetch design tokens

Use `get_design_context` scoped to the `Foundations` page node. The response includes color, spacing, and typography tokens as structured JSON. Always use token names in generated code — never raw hex values.

### Capture a screenshot

Use `get_screenshot` with a `nodeId` for a rendered image of any frame or component. Useful when structured data alone is insufficient for pixel-accurate implementation.

### Example call

```
server: figma  # HTTP MCP at https://mcp.figma.com/mcp
tool: get_design_context
arguments:
  fileKey: <file-key-placeholder>
  nodeId: <nodeId of Node/ModuleNode/Default>
```

## Token Regeneration Workflow

1. Load this module for MCP call patterns, then call `get_design_context` on the `Foundations` page node.
2. Parse the returned token JSON and render it into the platform-native format (see each platform module).
3. Commit the regenerated files. Platform CI validates that the build compiles.
4. Never hand-edit generated token files — update Figma first, then regenerate.

## Agent Checklist

Before implementing any UI component that touches visual properties:

- [ ] Load `design-system` for the token vocabulary and component semantics
- [ ] Load `figma-integration` for MCP call patterns
- [ ] Verify the Figma MCP is reachable (a failed `get_metadata` call indicates a credential or config issue)
- [ ] Use token names, not raw values, in all generated code
- [ ] After regenerating tokens, run the platform build to confirm no compile errors
