# Resources Boundary Rules

## The Rule

**Never read or modify any `resources/` folder content unless the user explicitly says so.**

"Explicitly" means the user's message contains words like: fix, update, modify, change, implement, build, rebuild, generate — AND the target is clearly `resources/` code (not spec files).

## Before touching resources/

1. **Always analyze from spec level first.** Read the relevant module README.md files.
2. **Check if the spec is complete.** If a spec module is missing or incomplete, that may be the root cause — add/fix the spec before touching code.
3. **Only after spec analysis**, if resources/ code must be read or changed, confirm with the user or proceed only if the user has explicitly authorized it in this message.

## Allowed without asking

- Reading module README.md and `.archui/index.yaml` files
- Running the CLI validator
- Running `git diff` / `git log` to understand what changed

## Requires explicit user authorization

- Reading any file inside `resources/`
- Modifying any file inside `resources/`
- Running `npm run build` or any build command

## When the user reports a bug

1. Read the relevant spec modules' README.md first
2. Run `archui validate .` to check spec consistency
3. If spec is valid and complete → tell the user the issue is in resources/, ask if they want you to investigate there
4. If spec is incomplete → fix the spec first, then ask about resources
