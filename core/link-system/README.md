---
name: Link System
description: "Defines the schema for cross-module relationship declarations stored in .archui/index.yaml, including required and optional link fields, the recommended relation vocabulary, and validation behavior."
---

## Overview

The link system is how modules declare relationships to other modules in an ArchUI project. Links are declared in the `links` field of a module's `.archui/index.yaml` — not in README.md. They are directional: a link in module A pointing to module B means A is making a claim about its relationship to B, not the other way around.

Links use UUIDs to identify target modules, making them stable across renames and moves. The CLI validates link structure but intentionally does not enforce relation vocabulary — custom relations are always permitted.

## Link Schema

Each entry in the `links` array is a YAML object defined in `.archui/index.yaml`:

```yaml
# .archui/index.yaml
links:
  - uuid: <string>        # REQUIRED — UUID of the target module
    relation: <string>    # OPTIONAL — describes the type of relationship
    description: <string> # OPTIONAL — explains why this relationship exists
```

### `uuid` (required)

The 8-character hex UUID of the target module. This is the only required field per link entry. The CLI validates that this UUID exists in the project at validation time.

```yaml
- uuid: 8d2f6a4e
```

### `relation` (optional)

A string that categorizes the type of relationship. ArchUI recommends the following vocabulary, but does not restrict you to it:

| Relation | Meaning |
|---|---|
| `depends-on` | This module requires the target module to function correctly. A runtime or conceptual dependency. |
| `implements` | This module provides a concrete implementation of an interface, spec, or contract defined in the target module. |
| `extends` | This module builds on or expands the target module's capabilities without fully implementing it. |
| `references` | This module cites or refers to the target for informational purposes, without a structural dependency. |
| `related-to` | A general association that does not fit a more specific relation. Use when the relationship is real but the direction or type is ambiguous. |

Custom relations are always allowed. If none of the above fit, write whatever describes the relationship accurately:

```yaml
- uuid: 537c63d3
  relation: renders-output-of
  description: The canvas GUI renders the visual representation of data defined here.
```

Omitting `relation` entirely is valid.

### `description` (optional)

A plain-text string explaining why this link exists. A good description answers: *why does this module care about the target?*

```yaml
# Good — answers why
description: The validator enforces every filesystem rule defined in this module, so changes here must be reflected in validator logic.

# Poor — restates the relation without adding information
description: This depends on the validator.
```

## Directionality and Bidirectionality

Links are **unidirectional** by declaration — module A declares a link to B, and that link lives only in A's `.archui/index.yaml`. Module B does not automatically gain a back-link to A.

If you want a bidirectional relationship represented explicitly, declare links in both modules' `.archui/index.yaml` files.

The GUI can compute the inverse link graph by scanning all modules, allowing you to see "who links to me" for any module — without requiring explicit back-links.

## Validation Behavior

The CLI `validate` command checks the following for each link entry:

- `uuid` is present and non-empty.
- `uuid` resolves to a known module (found in the project's derived global index).
- `relation`, if present, is a non-empty string.
- `description`, if present, is a non-empty string.

The CLI does **not** enforce that `relation` uses the recommended vocabulary. Custom relation strings are valid.

## Example: A Well-Linked Module

```yaml
# core/filesystem-rules/.archui/index.yaml
schema_version: 1
uuid: 9e2b5d7c
links:
  - uuid: 8d2f6a4e
    relation: related-to
    description: cli/validator implements the validation logic for every rule defined in this module
  - uuid: 2c4d8f1a
    relation: extends
    description: filesystem-rules is a specialization of core conventions
```
