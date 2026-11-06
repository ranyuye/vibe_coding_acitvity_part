import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, cp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = (value) => createHash('sha256').update(value).digest('hex');

test('offline artifact matches current application sources and lockfile', async () => {
  const manifest = JSON.parse(await readFile(join(root, 'deploy/awesome/artifact.json'), 'utf8'));
  assert.equal(hash(await readFile(join(root, 'deploy/awesome/runtime.tar.gz'))), manifest.archiveSha256);
  for (const [path, expected] of Object.entries(manifest.sourceFiles)) {
    assert.equal(hash(await readFile(join(root, path))), expected, `Rebuild offline artifact after changing ${path}`);
  }
});

test('isolated Node runtime serves real pages, assets and protected APIs', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'vibevot-runtime-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  execFileSync('tar', ['-xzf', join(root, 'deploy/awesome/runtime.tar.gz'), '-C', directory]);
  await cp(join(root, 'public'), join(directory, 'public'), { recursive: true });
  await cp(join(root, 'public'), join(directory, 'dist/client'), { recursive: true });
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: directory,
    env: { PATH: process.env.PATH, NODE_ENV: 'production', PORT: String(port), HOST: '127.0.0.1',
      FEISHU_APP_ID: 'cli_test_only', FEISHU_REDIRECT_URI: 'https://vibevot.awesome.guanghexinzhi.cn/api/auth/callback',
      COOKIE_SECURE: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (data) => { output += data; });
  child.stderr.on('data', (data) => { output += data; });
  t.after(async () => {
    if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* Server may still be starting. */ }
    if (child.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, output);
  for (const path of ['/', '/register', '/entries']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /Vibe Coding|VIBE CODING|创作季/);
  }
  const html = await (await fetch(base)).text();
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((match) => match[1]);
  assert.ok(scripts.length > 0);
  for (const path of [...scripts, '/favicon.svg', '/og.png']) assert.equal((await fetch(new URL(path, base))).status, 200, path);
  for (const path of ['/api/me', '/api/registration']) assert.equal((await fetch(base + path)).status, 401);
  assert.equal((await fetch(base + '/api/registration', { method: 'POST', body: '{}' })).status, 401);
  const entries = await fetch(base + '/api/entries');
  assert.equal(entries.status, 503, 'Missing Feishu configuration must not become fake entries');
  const login = await fetch(base + '/api/auth/login?return_to=/register', { redirect: 'manual' });
  assert.equal(login.status, 307);
  const location = new URL(login.headers.get('location'));
  assert.equal(location.hostname, 'accounts.feishu.cn');
  assert.equal(location.searchParams.get('redirect_uri'), 'https://vibevot.awesome.guanghexinzhi.cn/api/auth/callback');
  assert.match(login.headers.get('set-cookie'), /HttpOnly/i);
  assert.match(login.headers.get('set-cookie'), /Secure/);
});
