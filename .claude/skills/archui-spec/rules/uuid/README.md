# UUID Rules

## Format

8 lowercase hex characters. Examples: `93ab33c4`, `7e3f1c9a`.

**Never use full RFC 4122 UUIDs** (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

## Generating

```bash
openssl rand -hex 4
```

## Before using a generated UUID

Check it is not already in any existing `.archui/index.yaml`:

```bash
grep -r "<generated-uuid>" . --include="*.yaml"
```

If found, generate a new one.

## Rules

- UUID is assigned at module creation — **never changes** after that (not on rename, move, or content edit)
- Never reuse UUIDs from deleted modules
- UUIDs must be unique across the entire project

## YAML quoting

Some valid 8-hex strings are misread by YAML parsers:
- `785e2416` → looks like scientific notation (785 × 10^2416)
- `54534937` → looks like an integer

**Always quote UUIDs that could be misread:**

```yaml
uuid: "785e2416"   # quoted
```

When in doubt, quote it.
