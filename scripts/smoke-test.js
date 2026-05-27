#!/usr/bin/env node
/**
 * Train Depot smoke/regression tests.
 * Zero external dependencies: starts the app on a random local port and exercises
 * the most important data-safety/authentication paths.
 */

const assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'train-depot-smoke-'));
const dataDir = path.join(tmpRoot, 'data');
const port = 18000 + Math.floor(Math.random() * 20000);
const baseUrl = `http://127.0.0.1:${port}`;

let server;
let logs = '';

function cleanup() {
  if (server && !server.killed) server.kill('SIGTERM');
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });

async function waitForServer() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/auth/status`);
      if (res.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Server did not start in time');
}

async function request(pathname, options = {}) {
  const { raw = false, ...fetchOptions } = options;
  const res = await fetch(`${baseUrl}${pathname}`, fetchOptions);
  if (raw) return { res, body: null };

  let body = null;
  const text = await res.text();
  if (text) {
    try { body = JSON.parse(text); }
    catch { body = text; }
  }
  return { res, body };
}

function makeMultipartBody(fieldName, filename, data, contentType = 'application/octet-stream') {
  const boundary = '----TrainDepotSmokeBoundary' + Math.random().toString(16).slice(2);
  const head = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
    `Content-Type: ${contentType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    boundary,
    body: Buffer.concat([head, Buffer.isBuffer(data) ? data : Buffer.from(data), tail])
  };
}

async function main() {
  server = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'development',
      TRAIN_DEPOT_DATA_DIR: dataDir,
      TRAIN_DEPOT_TRUST_PROXY: 'false',
      TRAIN_DEPOT_TRUST_LOCAL_NETWORK: 'false'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  logs = '';
  server.stdout.on('data', chunk => { logs += chunk.toString(); });
  server.stderr.on('data', chunk => { logs += chunk.toString(); });
  server.on('exit', code => {
    if (code !== null && code !== 0 && code !== 143) {
      console.error(logs);
    }
  });

  await waitForServer();

  // First login on a fresh DB sets the password.
  let r = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'Temporary123' })
  });
  assert.strictEqual(r.res.status, 200, 'initial password setup should work');
  assert.strictEqual(r.body.setup, true, 'fresh DB login should be setup flow');

  // Regression: clients must not be able to spoof a LAN/private source address
  // with X-Forwarded-For and bypass the password.
  r = await request('/api/stats', { headers: { 'X-Forwarded-For': '192.168.1.99' } });
  assert.strictEqual(r.res.status, 401, 'untrusted X-Forwarded-For private IP must not bypass auth');

  // Core CRUD still works when no password is configured. Restart against a new
  // data dir so the smoke test also proves first-run catalogue behaviour.
  server.kill('SIGTERM');
  await new Promise(resolve => server.once('exit', resolve));
  fs.rmSync(dataDir, { recursive: true, force: true });
  server = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port), NODE_ENV: 'development', TRAIN_DEPOT_DATA_DIR: dataDir },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer();

  r = await request('/api/categories');
  assert.strictEqual(r.res.status, 200, 'categories endpoint should work');
  assert.ok(Array.isArray(r.body) && r.body.length >= 2, 'default categories should exist');

  r = await request('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Smoke Test Loco',
      manufacturer: 'Hornby',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      purchasePrice: 12.34,
      productCode: 'TEST-001'
    })
  });
  assert.strictEqual(r.res.status, 201, 'item create should work');
  const itemId = r.body.id;
  assert.ok(itemId, 'created item should have an id');

  r = await request('/api/items/check-duplicate?productCode=TEST-001');
  assert.strictEqual(r.res.status, 200, 'duplicate check should work');
  assert.strictEqual(r.body.duplicates.length, 1, 'duplicate check should find the smoke item');

  r = await request(`/api/items/${itemId}`, { method: 'DELETE' });
  assert.strictEqual(r.res.status, 200, 'soft delete should work');

  r = await request('/api/trash');
  assert.strictEqual(r.res.status, 200, 'trash list should work');
  assert.strictEqual(r.body.length, 1, 'soft-deleted item should appear in trash');

  r = await request('/api/share/enable', { method: 'POST' });
  assert.strictEqual(r.res.status, 200, 'share link enable should work');
  assert.ok(r.body.token, 'share enable should return a token');

  r = await request('/api/export');
  assert.strictEqual(r.res.status, 200, 'JSON export should work');
  assert.ok(r.body.items && Array.isArray(r.body.items), 'export should include items array');
  assert.ok(r.body.settings, 'export should include settings');
  assert.ok(!('shareToken' in r.body.settings), 'JSON export must not include a live public share token');
  const jsonBackup = r.body;

  r = await request('/api/share/disable', { method: 'POST' });
  assert.strictEqual(r.res.status, 200, 'share link disable should work');

  const jsonImport = makeMultipartBody('file', 'train-depot-backup.json', JSON.stringify(jsonBackup), 'application/json');
  r = await request('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${jsonImport.boundary}` },
    body: jsonImport.body
  });
  assert.strictEqual(r.res.status, 200, 'JSON import should work');

  r = await request('/api/share/status');
  assert.strictEqual(r.res.status, 200, 'share status should work');
  assert.strictEqual(r.body.enabled, false, 'JSON import must not re-enable an old public share link');

  // Regression: full-backup restore must replace the upload library, not merge into
  // whatever photos happen to be lying around already.
  const uploadsDir = path.join(dataDir, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, 'kept-photo.txt'), 'photo from backup');

  r = await request('/api/export/full', { raw: true });
  assert.strictEqual(r.res.status, 200, 'full export should work');
  const fullBackupZip = Buffer.from(await r.res.arrayBuffer());

  fs.writeFileSync(path.join(uploadsDir, 'orphan-photo.txt'), 'should be removed on restore');
  assert.ok(fs.existsSync(path.join(uploadsDir, 'orphan-photo.txt')), 'orphan file should exist before restore');

  const multipart = makeMultipartBody('file', 'train-depot-full-backup.zip', fullBackupZip, 'application/zip');
  r = await request('/api/import/full', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${multipart.boundary}` },
    body: multipart.body
  });
  assert.strictEqual(r.res.status, 200, 'full import should work');
  assert.ok(fs.existsSync(path.join(uploadsDir, 'kept-photo.txt')), 'backup photo should still exist after restore');
  assert.ok(!fs.existsSync(path.join(uploadsDir, 'orphan-photo.txt')), 'restore should remove photos not present in the backup');

  cleanup();
  console.log('Smoke tests passed');
}

main().catch(err => {
  console.error(err.stack || err.message);
  console.error('\nServer logs:\n' + logs);
  process.exit(1);
});
