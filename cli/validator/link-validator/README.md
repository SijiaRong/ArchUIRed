---
name: Link Validator
description: "Checks all link entries in every module's .archui/index.yaml to ensure each referenced uuid exists in the project, and that optional fields are non-empty when present."
---

## Overview

The link validator iterates over every `links` entry in every module's `.archui/index.yaml` and applies a set of lightweight structural checks. It does not resolve semantic meaning — it does not check whether a `depends-on` relation is architecturally sound, only that the entry is well-formed and that the target uuid is known.

This validator runs after `frontmatter-validator` has confirmed that all README files are parseable, and after the global UUID index has been derived from all `.archui/index.yaml` files in the project.

## Rules Enforced

**`uuid` field is required in every link entry.**
A link entry without a `uuid` field is invalid. The uuid is the only stable identifier for a module — name and path are mutable, uuid is not.

**Referenced uuid must exist in the project.**
Every uuid value in a link entry is looked up against the global index derived from all `.archui/index.yaml` files. If no module has that uuid, the link is a dangling reference and is reported as a violation. This catches typos, stale references to deleted modules, and links created before the target module was registered.

**`relation`, if present, must be a non-empty string.**
The `relation` field is optional. If it appears in the entry, it must not be an empty string or `null`. The validator does not reject unknown relation types — custom relations are permitted.

**`description`, if present, must be a non-empty string.**
The `description` field is optional. If it appears, it must not be empty.

## What This Validator Does NOT Check

- Whether a relation type is in the recommended vocabulary. Custom relation strings are allowed.
- Whether the direction of a link is semantically valid.
- Whether links are reciprocated or bidirectional.

## Error Output

```
ERROR  [links/missing-uuid]       cli/validator/.archui/index.yaml   link entry at index 2 has no 'uuid' field
ERROR  [links/dangling-uuid]      core/link-system/.archui/index.yaml  link uuid 'deadbeef' not found in project
ERROR  [links/empty-relation]     gui/file-sync/.archui/index.yaml   link to '4a6f8e3b' has empty 'relation' field
ERROR  [links/empty-description]  cli/.archui/index.yaml             link to '2c4d8f1a' has empty 'description' field
```
