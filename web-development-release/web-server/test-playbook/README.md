---
name: Web Server Test Playbook
description: "Playbook for verifying the Express web server's filesystem API correctness, path traversal prevention, static SPA serving, and sync endpoint behavior."
---

## Overview

This playbook verifies the web server's key behaviors: correct filesystem API responses, path traversal rejection, SPA static file serving, and the sync subprocess endpoint.

---

## Playbook

### Group 1: Filesystem API correctness

[init] The web server is started with a valid ArchUI project root. An ArchUI module at `test-module/README.md` exists inside the project root.

[action] Send POST /api/fs/read with body { "path": "test-module/README.md" }.
[eval] The response is { "content": "<contents of README.md>" } with HTTP 200. The content matches the actual file on disk.

[action] Send POST /api/fs/write with body { "path": "test-module/README.md", "content": "# Updated" }.
[eval] The response is { "ok": true } with HTTP 200. Reading the file confirms the new content is written.

[action] Send POST /api/fs/list with body { "path": "test-module" }.
[eval] The response contains an entries array with at least "README.md". All entries are filenames/dirnames relative to the requested path.

[end] Restore the original README.md content. Stop the server.

---

### Group 2: Path traversal prevention

[init] The web server is started with a project root of /tmp/archui-test.

[action] Send POST /api/fs/read with body { "path": "../../etc/passwd" }.
[eval] The server returns HTTP 400 or HTTP 403 with an error message. No file content is returned. No filesystem access outside /tmp/archui-test occurs.

[action] Send POST /api/fs/write with body { "path": "../outside-root/evil.txt", "content": "pwned" }.
[eval] The server rejects the request before any write occurs. The file outside the project root is not created or modified.

[end] Confirm /tmp/archui-test is unmodified except for the test-module write from Group 1. Stop the server.

---

### Group 3: SPA serving and fallback

[init] The web server is started with the React SPA built (dist/ present).

[action] Send GET / to the server.
[eval] The server returns the contents of dist/index.html with HTTP 200 and Content-Type text/html.

[action] Send GET /assets/main-abc123.js to the server.
[eval] The server returns the JavaScript bundle file with HTTP 200 and the correct Content-Type.

[action] Send GET /some/deep/spa/route to the server.
[eval] The server returns dist/index.html (SPA fallback). The React app handles the route on the client side.

[end] Stop the server.

---

### Group 4: Sync endpoint

[init] The web server is running. The CLI `archui sync` command is available in PATH.

[action] Send POST /api/sync with an empty body.
[eval] The server responds with a Server-Sent Events stream. Progress messages appear as the sync runs. A final message with exitCode 0 signals completion.

[end] Stop the server.
