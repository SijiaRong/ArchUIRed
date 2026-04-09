# Spec ↔ Resources Sync Workflow

## When to use

After any `resources/` code change has passed acceptance testing, the corresponding ArchUI spec modules must be synchronized. This is a mandatory step — do not skip it.

## Workflow

1. **Check what changed**
   ```bash
   git diff HEAD~1 --name-only | grep resources/
   git log --oneline -5
   ```

2. **Find the smallest affected modules**
   Start from the innermost modules whose spec is affected by the change. Do not start from the root.

3. **Update from the bottom up**
   - Update the leaf module's README.md body and `.archui/index.yaml` (links/submodules) first
   - After each leaf, check its parent — if the parent's description or links no longer match, update it too
   - Continue upward until all affected ancestors are updated

4. **Delegate per platform to sub-agents**
   For platform-specific resources (e.g. `web-development-release/`, `ios-development-release/`), spawn a sub-agent scoped to that platform's module tree. The sub-agent starts from the smallest changed module and works upward.

5. **Run validation**
   ```bash
   archui validate .
   ```

## What "affected" means

A spec module is affected if:
- Its described behavior changed in resources/
- A new capability was added that isn't described
- An existing description references something that no longer exists
- Links to/from this module are now inaccurate

## Scope rule

Only update spec modules whose content is genuinely stale. Do not touch modules that aren't affected by the resources change.
