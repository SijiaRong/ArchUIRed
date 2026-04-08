---
name: Web Server
description: "The Express backend server that serves the built React SPA and exposes a filesystem REST API, enabling any browser to read and write ArchUI project files on the host machine; the core component for web-based user distribution."
---

## Overview

The web server is what allows regular users to run ArchUI in any browser. It serves two roles simultaneously on a single HTTP port: a static file server for the built React SPA, and a filesystem REST API that the SPA uses to read and write ArchUI project files.

When a user runs `archui serve` (or starts the Docker container), the server starts on port 3000, and they open `http://localhost:3000` in any browser. No browser plugin, no Electron, no FSA permission prompt.

## Pre-Build Validation

Before compiling or deploying, always run the ArchUI CLI validator to ensure the module tree conforms to the filesystem rules:

```bash
archui validate .
```

If validation reports any `ERROR`, fix all issues before proceeding. Do not start the server or build a Docker image against a structurally invalid module tree.

## Architecture

```
Express Server (port 3000)
├── Static files: GET /          → dist/index.html (SPA entry)
│                 GET /assets/*  → dist/assets/* (JS, CSS, fonts)
│
├── Filesystem API: POST /api/fs/read    → fs.readFile(path)
│                   POST /api/fs/write   → fs.writeFile(path, content)
│                   POST /api/fs/list    → fs.readdir(path)
│
└── Sync API:       POST /api/sync       → spawn CLI sync subprocess
```

The server is started with the ArchUI project root as a required argument. All filesystem API calls are scoped to that root — no reads or writes are permitted outside it.

## Security Model

**Path traversal prevention:** every `/api/fs/*` handler resolves the requested path against the project root using `path.resolve` and rejects any path that does not start with the project root. This prevents `../../etc/passwd`-style attacks even when requests are crafted manually.

**No authentication by default:** the server is designed for local or trusted-network use. For team deployments on a shared server, authentication should be added at the reverse proxy layer (nginx, Caddy) or via an optional auth middleware. Authentication is a deployment concern, not a server concern.

**CORS policy:** in development mode (`NODE_ENV=development`), CORS is permissive to allow the Vite dev server (port 5173) to call the API on port 3001. In production, CORS headers are not set — the SPA is served from the same origin, so no CORS is needed.

## API Reference

All request and response bodies are JSON.

### `POST /api/fs/read`
```json
{ "path": "relative/path/to/file.md" }
```
Returns:
```json
{ "content": "file contents as string" }
```

### `POST /api/fs/write`
```json
{ "path": "relative/path/to/file.md", "content": "new contents" }
```
Returns:
```json
{ "ok": true }
```

### `POST /api/fs/list`
```json
{ "path": "relative/path/to/dir" }
```
Returns:
```json
{ "entries": ["file1.md", "subdir", "resources"] }
```

### `POST /api/sync`
```json
{}
```
Spawns `archui sync` as a subprocess and streams progress:
```
Content-Type: text/event-stream
data: {"type":"progress","message":"Scanning changed modules..."}
data: {"type":"done","exitCode":0}
```

## Running the Server

**Development (alongside Vite):**
```bash
# from resources/ directory
npm run dev:server   # starts Express on port 3001 with CORS enabled
npm run dev:full     # starts both Vite (5173) and server (3001) concurrently
```

**Production (serving built SPA):**
```bash
npm run build        # builds React SPA to dist/
node server.js --root /path/to/archui-project --port 3000
```

**Docker:**
```bash
docker run -p 3000:3000 -v /path/to/archui-project:/data archui/web-server
# opens http://localhost:3000
```

## Implementation

The implementation lives in `resources/server.cjs` — a zero-dependency CommonJS module using Node.js built-ins only (`http`, `fs`, `path`, `url`). No npm install required on the server.

```
resources/
└── server.cjs    # HTTP server: static SPA + /api/fs/* handlers
```

Key design decisions:

- **No external dependencies** — uses `http.createServer` directly, avoiding an npm install step on the deployment server.
- **CommonJS** (`.cjs`) — runs on any Node 16+ without `--esm` flags or a build step.
- **`dist/` symlink** — in production, `resources/dist/` is symlinked to the SPA build output so the server always serves the latest build without copying files.
- **CORS always-on** — all responses include `Access-Control-Allow-Origin: *` to support Vite dev server (port 5173) calling the API during development.

## Deployed Configuration (actionl.ink)

```
/opt/archui-server/
├── server.cjs            # the server
└── dist -> /usr/share/nginx/html/archui   # symlink to SPA build

ARCHUI_ROOT=/opt/archui-project   # the ArchUI repo itself
PORT=3002

systemd service: archui-server (auto-start, restart-on-failure)
nginx: location /api/ { proxy_pass http://127.0.0.1:3002; }
```

The nginx stream proxy at port 443 routes `actionl.ink` → internal port 8443, which then forwards `/api/` requests to the Express server at 3002. The SPA is served directly by nginx from `/usr/share/nginx/html/archui/`.
