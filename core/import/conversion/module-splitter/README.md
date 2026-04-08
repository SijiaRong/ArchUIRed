---
name: Module Splitter
description: "AI skill defining how to analyze an arbitrary project and split it into ArchUI modules: splitting criteria, reversibility requirements, naming conventions, and original content placement."
---

## Purpose

This is an AI-readable skill. When the conversion agent reaches the module-splitting step, it loads this document and follows the instructions here to determine module boundaries for the target project.

## Core Constraint: Reversibility

**Every split must be reversible.** The modules you create, taken together, must fully reconstruct the original project. Nothing may be lost, summarized away, or omitted. Original files go into `resources/original/` within the module that logically owns them.

## Splitting Criteria

**One coherent concept per module.** A module should cover exactly one concept, concern, or responsibility. If you find yourself writing "and" in a module description, the module likely needs to be split.

Good split signals:
- Separate top-level directories with distinct purposes (e.g. `src/`, `docs/`, `tests/`, `scripts/`)
- Distinct technology stacks or languages within the project
- Separate deployment units or services
- Distinct user-facing features

Do not split:
- Tightly coupled files that only make sense together
- Files under 3–5 total (a module with one file is fine)
- Configuration files that apply to the whole project (these belong in the root module's `resources/original/`)

## Process

### Step 1 — Understand the project

Read enough of the project to answer:
- What does this project do? (one sentence)
- What are its major parts?
- What is the tech stack?

Priority sources: `README.md`, `package.json` / `Cargo.toml` / `pyproject.toml`, top-level directory listing.

### Step 2 — Propose a module tree

Draft a module tree before creating any files. Present it to the user for confirmation if running interactively. The tree should be:
- 2–4 levels deep at most for typical projects
- Each leaf module covering one coherent concern
- Root module describing the whole project

Example for a web app with docs:
```
. (root — the whole project)
├── frontend/         README: React SPA
├── backend/          README: Express API
├── infrastructure/   README: Docker and deployment config
└── docs/             README: Project documentation
```

### Step 3 — Write module README.md files

For each module:
- `name`: title-cased, concise (e.g. "Frontend", "API Server", "Infrastructure")
- `description`: one sentence describing what this part of the project does — written as if the reader has no other context
- Body: 2–5 sentences explaining the module's purpose, what files it contains, and why it is a distinct concern

Do not invent information. Base the description on what you actually read in the project.

### Step 4 — Place original content

For each module, create `resources/original/` and move the corresponding original files there:

```
frontend/
├── .archui/index.yaml
├── README.md              ← written by the agent
└── resources/
    └── original/
        ├── src/           ← original source files
        ├── public/
        └── package.json
```

Files that belong to the whole project (root-level config, `.gitignore`, `LICENSE`, etc.) go into the root module's `resources/original/`.

### Step 5 — Generate UUIDs and links

For each new module:
- Generate a UUID: `openssl rand -hex 4`
- Verify it is not already used: `grep -r "<uuid>" . --include="*.yaml"`
- Add it to `.archui/index.yaml`

For links between modules, use `depends-on` if one module's code imports from another, `related-to` for loose associations.

### Step 6 — Validate

```bash
archui validate .
```

Fix all errors. Do not stop until the validator exits 0.

## Quality bar

Before reporting the conversion complete, verify:
- Every original file exists somewhere under a `resources/original/` directory
- Every module `README.md` has a description that stands alone without surrounding context
- `archui validate .` exits 0
- No UUID is reused
