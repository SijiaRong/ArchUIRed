---
name: Release History Test Playbook
description: "Test playbook for verifying that release-history.yaml is appended correctly, never rewritten, and handles concurrent appends without data loss."
---

## Playbook

[init] `release-coordination/resources/release-history.yaml` exists with two prior entries for iOS and Android. The current schema version is 1.

[action] The Web release agent ships `web/v1.3.0` and appends an entry to the history file.
[eval] The file now contains three entries. The two prior entries are unchanged. The new entry has all required fields: `tag`, `date`, `platform`, `version`, `type`, `schema_version`, `summary`. The `coordinated_release` field is `null`.

[action] Attempt to rewrite an existing entry (change the summary of the iOS entry).
[eval] This violates the append-only rule. The entry must remain unchanged. Any tooling that permits rewrites has a bug.

[end] The file contains three entries, all intact. The newest entry is at the bottom.

---

[init] iOS and Android are both tagging releases on the same day. Both release agents attempt to append to `release-history.yaml` concurrently, creating a merge conflict.

[action] Both agents commit their appends. A merge conflict arises on the file.
[eval] The conflict is resolved by including both entries in chronological order (iOS earlier in the day, Android later). Neither entry is lost.

[end] The file contains both entries with no data loss. The file remains valid YAML.

---

[init] A release agent tags `ios/v1.5.0` but forgets to append to `release-history.yaml`.

[action] Another agent audits the git tags against `release-history.yaml` and detects that `ios/v1.5.0` has no corresponding entry.
[eval] The missing entry is flagged as an incomplete release. The iOS agent is required to append the missing entry retroactively.

[action] The iOS agent appends the missing entry with the correct date and fields.
[eval] The file now contains the entry. The tag and history are consistent.

[end] The release record is complete. All tags have corresponding history entries.
