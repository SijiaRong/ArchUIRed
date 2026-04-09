# Commit Discipline Rules

## Spec and resources must always be separate commits

| Commit type | Files it may touch | Message prefix |
|---|---|---|
| Spec | `README.md`, `.archui/index.yaml` only | `spec:` |
| Resources (web) | `web-development-release/**/resources/**` only | `web:` |
| Resources (iOS) | `ios-development-release/**/resources/**` only | `ios:` |
| Resources (Android) | `android-development-release/**/resources/**` only | `android:` |
| Resources (CLI) | `cli/resources/**` only | `cli:` |

**Mixed commits are not allowed.** If you find yourself staging both spec and resources files, split them into two separate commits before proceeding.

## How to check before committing

```bash
git diff --cached --name-only
```

If the output contains both README.md / `.archui/index.yaml` files AND files under `resources/`, unstage and split.

## Ordering

When both spec and resources need to change for the same feature:
- Spec commit first (defines the contract)
- Resources commit second (implements the contract)
