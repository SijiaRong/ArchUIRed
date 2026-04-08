---
name: ArchUI
description: "An AI agent-prioritized knowledge management and generation system — visual canvas for humans, AI-friendly filesystem access for AI agents"
---

# ArchUI

A dual-interface knowledge management system that bridges the gap between human-oriented and agent-oriented documentation.

## The Problem

Traditional long documents (product specs, design docs) are readable for humans but inefficient for LLM agents. Agents perform best with short, modular, contextually-loaded content following two principles:

- **Load context when needed** — retrieve only relevant knowledge chunks, not entire documents
- **Progressive Disclosure (渐进式披露)** — surface summaries first, details on demand

These agent-friendly documentation patterns are hard for humans to author and navigate naturally. There is a fundamental tension between what is good for agents and what is good for humans.

## The Solution

ArchUI provides:

- **GUI (Canvas)** — a node-based visual canvas (in the style of [ComfyUI](https://github.com/comfyanonymous/ComfyUI)) where humans drag, link, and navigate knowledge modules. Human edits are tracked by git; an LLM can be triggered later to propagate changes to affected files.
- **CLI** — a command-line tool that validates filesystem conformance to ArchUI rules, and can invoke agents to modify ArchUI modules or execute ArchUI commands following ArchUI skills and rules.

The **filesystem is the source of truth.** AI agents can directly modify files and folders; the GUI and CLI are interfaces over that same structure.

## Filesystem Structure

Every module is a folder. Every folder contains a `README.md` (human-readable identity) and a `.archui/` directory (structural metadata). The structure is infinitely nestable:

```
<project>/
├── .archui/
│   └── index.yaml          # root module metadata (uuid, submodules map, links)
├── README.md               # name + description only
├── <moduleA>/
│   ├── .archui/
│   │   └── index.yaml      # moduleA metadata
│   ├── README.md
│   ├── <submoduleA1>/
│   │   ├── .archui/
│   │   │   └── index.yaml
│   │   └── README.md
│   └── resources/          # optional: code, videos, any reference material
└── <moduleB>/
    ├── .archui/
    │   └── index.yaml
    ├── README.md
    └── resources/
```

### README.md Format

Each `README.md` contains only human-readable identity fields — just `name` and `description`:

```markdown
---
name: Module A
description: One-sentence summary loaded into agent context by default.
---

## Overview

Full prose description of this module...
```

### .archui/index.yaml Format

Each module's `.archui/index.yaml` contains all structural metadata for that module:

```yaml
schema_version: 1
uuid: a1b2c3d4
submodules:                 # direct children: folder-name → child uuid
  submoduleA1: e5f6g7h8
  submoduleA2: f9g0h1i2
links:
  - uuid: b3c4d5e6
    relation: depends-on
    description: Needs this module for token validation.
  - uuid: c7d8e9f0
    relation: references
layout:                     # canvas positions for children (set by GUI)
  e5f6g7h8: {x: 100, y: 200}
```

### Link Rules

- Both `relation` and `description` are optional.
- `relation` has a recommended vocabulary: `depends-on`, `implements`, `extends`, `references`, `related-to`. Custom relation strings are also valid.
- The CLI validates that the `uuid` exists in the project and that the link is well-formed; it does not reject unknown relation types.
- The global uuid→path index is derived by walking the tree, not from a central file.

## How It Works

- **Humans** use the GUI canvas to author, link, and explore modules visually. Changes are tracked by git. An LLM can be triggered on-demand (using `git diff` as input) to update changed and affected files.
- **AI agents** read and write files directly — no special API needed. The structure itself enforces context boundaries and progressive disclosure.
- **CLI** validates that agent edits haven't broken the ArchUI filesystem rules, and can invoke agents to modify modules or execute ArchUI commands following ArchUI skills and rules.
- **Resources** — any module can have a `resources/` subfolder for referenced material (code, video, images, etc.).

## Development Model: Docs-Driven, Agent-Executed

ArchUI is built using its own system. All development workflows are defined as ArchUI modules. For example:

```
archui/
├── ios-development-release/
│   ├── README.md              # context for the iOS agent
│   ├── ios-development/
│   │   └── README.md
│   └── ios-release/
│       └── README.md
├── android-development-release/
│   └── ...
├── web-development-release/
│   └── ...
└── electron-development-release/
    └── ...
```

Each platform module contains the specs, guidelines, and context that the corresponding programming and testing agents need. Modules are only loaded when that platform is being worked on — agents working on iOS have no reason to load the Android module.

The workflow is:
1. **Humans and architect agents** modify architecture/spec files.
2. **Platform-specific programming agents** are scoped to their module and implement natively.
3. **Testing agents** verify against the spec.

There are no hardcoded platform targets. New platforms, roles, or workflows are added simply by creating a new module. UI consistency is maintained via **Figma MCP** as the shared design source of truth.

## Design Principles

- **Filesystem as source of truth** — no database, no proprietary format
- **UUID-stable links** — module references survive renames and moves
- **Modularity** — each module is an independently loadable unit
- **Infinite nesting** — the same GUI pattern applies at every level of depth
- **Agent-native** — the structure is designed so LLMs can navigate it without a special adapter
- **Standalone with integration surface** — works independently; future integrations can be added by the community

## Forking This Project

If you fork ArchUI to build your own system, replace the following project-specific values:

### Figma design file
All GUI spec files reference the ArchUI Figma file key `beEbYQhz9LBLHrAj2eGyft`. Replace it with your own file key in these locations:

```
gui/design-system/figma-integration/resources/mcp-reference.md   ← start here, has setup instructions
gui/design-system/foundations/README.md
gui/screens/canvas/resources/layout-and-states.md
gui/screens/landing/resources/layout-and-interactions.md
gui/components/detail-panel/resources/visual-spec.md
gui/components/navigation/breadcrumb/resources/visual-spec.md
gui/components/link-renderer/port-edge/resources/routing-spec.md
gui/components/primary-module-card/*/resources/visual-spec.md     ← 5 files
```

Your Figma file key is the alphanumeric segment in your file URL:
`https://www.figma.com/design/<file-key>/Your-File-Name`

### App identifiers
| Platform | Location | Value to replace |
|----------|----------|-----------------|
| Electron | `electron-development-release/electron-release/README.md` | `com.archui.desktop` |
| iOS | `ios-development-release/ios-release/README.md` | `ArchUI Development` / `ArchUI Distribution` signing identities |
| Android | `android-development-release/android-release/README.md` | `ARCHUI_KEYSTORE_*` environment variable names |

### Docker image namespace
`web-development-release/web-release/resources/deploy.sh` uses `archui/web-server` as the Docker Hub image name. Replace with your own namespace.

### Module UUIDs
Every `.archui/index.yaml` contains UUIDs that identify modules within this repository. If you fork and maintain a separate ArchUI project, regenerate all UUIDs to avoid collision with the upstream project:

```bash
# After cloning, regenerate UUIDs with the CLI
node cli/resources/dist/index.js uuid-regenerate .
```
