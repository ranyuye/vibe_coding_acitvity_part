import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
async function files(directory) {
  const result = [];
  for (const name of (await readdir(directory)).sort()) {
    const path = join(directory, name);
    const info = await lstat(path);
    if (info.isSymbolicLink()) throw new Error(`Symlinks are unsupported: ${path}`);
    if (info.isDirectory()) result.push(...await files(path));
    else result.push(path);
  }
  return result;
}
for (const name of await readdir(root)) {
  if (/^\.env(?:\.|$)/.test(name) && !name.endsWith('.example')) {
    throw new Error(`Remove ${name} from the build workspace; configure secrets at runtime only.`);
  }
}
const env = { ...process.env, AWESOME_DEPLOY_BUILD: '1' };
for (const key of Object.keys(env)) {
  if (key.startsWith('FEISHU_') || key === 'SESSION_SECRET') delete env[key];
}
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env });
const output = resolve('dist/standalone');
// This artifact is portable JS/WASM, never a copy of macOS build dependencies.
for (const path of await files(output)) {
  const data = await readFile(path);
  const magic = data.subarray(0, 4).toString('hex');
  if (/\.(node|dylib|so|exe)$/.test(path) || ['7f454c46', 'cffaedfe', 'feedfacf', 'cafebabe'].includes(magic)) {
    throw new Error(`Native dependency needs a target-Linux build: ${path}`);
  }
}
await mkdir('deploy/awesome', { recursive: true });
// Public assets remain ordinary source files in Git; Docker copies them into both locations.
const excludes = ['--exclude=./public'];
for (const path of await files('public')) {
  const clientPath = join(output, 'dist/client', relative('public', path));
  try {
    if (sha256(await readFile(clientPath)) !== sha256(await readFile(path))) {
      throw new Error(`Build changed a public asset: ${path}`);
    }
    excludes.push(`--exclude=./dist/client/${relative('public', path)}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
execFileSync('tar', ['--no-xattrs', '--no-acls', ...excludes, '-czf', resolve('deploy/awesome/runtime.tar.gz'), '-C', output, '.'], {
  env: { ...process.env, COPYFILE_DISABLE: '1' },
});
const inputs = [];
for (const directory of ['app', 'public', 'build', 'worker', '.openai']) inputs.push(...await files(directory));
inputs.push('package.json', 'package-lock.json', 'vite.config.ts', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'scripts/package-awesome.mjs');
const sourceFiles = {};
for (const path of inputs.sort()) sourceFiles[relative(root, resolve(path))] = sha256(await readFile(path));
const artifact = await readFile('deploy/awesome/runtime.tar.gz');
await writeFile('deploy/awesome/artifact.json', JSON.stringify({
  format: 1,
  nodeVersion: process.version,
  runtime: 'Node 22; portable JavaScript/WASM; no native addons',
  archiveSha256: sha256(artifact),
  archiveBytes: artifact.length,
  sourceFiles,
}, null, 2) + '\n');
console.log(`Offline runtime packaged: ${(artifact.length / 1024 / 1024).toFixed(1)} MiB`);
