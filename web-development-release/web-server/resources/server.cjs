#!/usr/bin/env node
/**
 * ArchUI Web Server
 * Zero-dependency CommonJS — uses only Node.js built-ins.
 * Serves the React SPA from ./dist and exposes /api/fs/* + /api/sync.
 *
 * Usage:
 *   node server.cjs [--root <archui-root>] [--port <port>] [--dist <dist-dir>]
 *
 * Env vars (override defaults):
 *   PORT          default 3001
 *   ARCHUI_ROOT   default process.cwd()
 *   DIST_DIR      default <this file's dir>/dist
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// ─── Config ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function arg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const PORT       = parseInt(arg('--port') || process.env.PORT || '3001', 10);
const ARCHUI_ROOT = path.resolve(arg('--root') || process.env.ARCHUI_ROOT || process.cwd());
const DIST_DIR   = path.resolve(arg('--dist') || process.env.DIST_DIR || path.join(__dirname, 'dist'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.mjs':   'application/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.json':  'application/json; charset=utf-8',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
  '.map':   'application/json',
};

function mime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

/** Prevent path traversal: ensure resolved path stays inside root. */
function safePath(root, relative) {
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.resolve(root)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

// ─── Filesystem API handlers ─────────────────────────────────────────────────

async function handleRead(req, res) {
  const body = await readBody(req);
  if (!body.path) return json(res, 400, { error: 'path required' });
  try {
    const abs = safePath(ARCHUI_ROOT, body.path);
    const content = fs.readFileSync(abs, 'utf8');
    json(res, 200, { content });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 404, { error: e.message });
  }
}

async function handleWrite(req, res) {
  const body = await readBody(req);
  if (!body.path || body.content === undefined) return json(res, 400, { error: 'path and content required' });
  try {
    const abs = safePath(ARCHUI_ROOT, body.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body.content, 'utf8');
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 500, { error: e.message });
  }
}

async function handleList(req, res) {
  const body = await readBody(req);
  if (!body.path) return json(res, 400, { error: 'path required' });
  try {
    const abs = safePath(ARCHUI_ROOT, body.path);
    const entries = fs.readdirSync(abs, { withFileTypes: true }).map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
    }));
    json(res, 200, { entries });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 404, { error: e.message });
  }
}

async function handleMkdir(req, res) {
  const body = await readBody(req);
  if (!body.path) return json(res, 400, { error: 'path required' });
  try {
    const abs = safePath(ARCHUI_ROOT, body.path);
    fs.mkdirSync(abs, { recursive: true });
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 500, { error: e.message });
  }
}

async function handleCopy(req, res) {
  const body = await readBody(req);
  if (!body.src || !body.dest) return json(res, 400, { error: 'src and dest required' });
  try {
    const absSrc  = safePath(ARCHUI_ROOT, body.src);
    const absDest = safePath(ARCHUI_ROOT, body.dest);
    fs.cpSync(absSrc, absDest, { recursive: true });
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 500, { error: e.message });
  }
}

async function handleRemove(req, res) {
  const body = await readBody(req);
  if (!body.path) return json(res, 400, { error: 'path required' });
  try {
    const abs = safePath(ARCHUI_ROOT, body.path);
    fs.rmSync(abs, { recursive: true, force: true });
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, e.message === 'Path traversal detected' ? 403 : 500, { error: e.message });
  }
}

async function handleSync(req, res) {
  const cliPath = path.join(ARCHUI_ROOT, 'cli/resources/dist/index.js');
  execFile('node', [cliPath, 'validate', ARCHUI_ROOT], { cwd: ARCHUI_ROOT }, (err, stdout, stderr) => {
    if (err) {
      json(res, 500, { ok: false, stdout, stderr, error: err.message });
    } else {
      json(res, 200, { ok: true, stdout, stderr });
    }
  });
}

// ─── Static file server ───────────────────────────────────────────────────────

function serveStatic(req, res) {
  // Strip query string
  const urlPath = req.url.split('?')[0];

  // Try exact file, then index.html fallback (SPA routing)
  const candidates = [
    path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath),
    path.join(DIST_DIR, 'index.html'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const content = fs.readFileSync(candidate);
      res.writeHead(200, { 'Content-Type': mime(candidate) });
      res.end(content);
      return;
    }
  }

  res.writeHead(404);
  res.end('Not found');
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function router(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  if (req.method === 'POST') {
    if (url === '/api/fs/read')  return handleRead(req, res);
    if (url === '/api/fs/write') return handleWrite(req, res);
    if (url === '/api/fs/list')  return handleList(req, res);
    if (url === '/api/fs/mkdir') return handleMkdir(req, res);
    if (url === '/api/fs/copy') return handleCopy(req, res);
    if (url === '/api/fs/remove') return handleRemove(req, res);
    if (url === '/api/sync')     return handleSync(req, res);
  }

  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  json(res, 405, { error: 'Method not allowed' });
}

// ─── Start ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) json(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`ArchUI server running at http://localhost:${PORT}`);
  console.log(`  ARCHUI_ROOT: ${ARCHUI_ROOT}`);
  console.log(`  DIST_DIR:    ${DIST_DIR}`);
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`  WARNING: dist dir not found — build the frontend first with:
    cd web-development-release/web-dev/resources && npm run build`);
  }
});
