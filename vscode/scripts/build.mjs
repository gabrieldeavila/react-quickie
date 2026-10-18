// Builds the extension into vscode/dist:
//   dist/extension.js   the extension host code
//   dist/api/main.js    the API bundled from api/dist (run `npm run build --prefix api` first)
//   dist/api/**/*.md    skills and subagent definitions, at the paths the API expects
//   dist/ui/            the built UI (run `npm run build --prefix ui` first)
import { build } from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '..');
const apiDist = path.join(repo, 'api', 'dist');
const uiDist = path.join(repo, 'ui', 'dist');
const outDir = path.join(root, 'dist');

// Nest loads these lazily inside try/catch; Doty uses none of them.
const NEST_OPTIONAL = [
  '@nestjs/microservices',
  '@nestjs/microservices/microservices-module',
  '@nestjs/websockets',
  '@nestjs/websockets/socket-module',
  '@nestjs/platform-socket.io',
  '@fastify/static',
  'class-transformer',
  'class-validator',
];

function assertBuilt(dir, hint) {
  if (!fs.existsSync(dir)) {
    console.error(`Missing ${dir}. Run ${hint} first.`);
    process.exit(1);
  }
}

function copyMarkdown(fromDir, toDir) {
  for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
    const from = path.join(fromDir, entry.name);
    const to = path.join(toDir, entry.name);
    if (entry.isDirectory()) copyMarkdown(from, to);
    else if (entry.name.endsWith('.md')) {
      fs.mkdirSync(toDir, { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

assertBuilt(path.join(apiDist, 'main.js'), '`npm run build --prefix api`');
assertBuilt(path.join(uiDist, 'index.html'), '`npm run build --prefix ui`');
fs.rmSync(outDir, { recursive: true, force: true });

const common = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  sourcemap: true,
  logLevel: 'warning',
};

await build({
  ...common,
  entryPoints: [path.join(root, 'src', 'extension.ts')],
  outfile: path.join(outDir, 'extension.js'),
  external: ['vscode'],
});

// Bundles the tsc output, not src: esbuild can't emit the decorator
// metadata Nest's dependency injection needs.
await build({
  ...common,
  entryPoints: [path.join(apiDist, 'main.js')],
  outfile: path.join(outDir, 'api', 'main.js'),
  external: NEST_OPTIONAL,
  minifyWhitespace: true,
  // ~25 MB of map for a 15 MB bundle; not worth shipping in the .vsix.
  sourcemap: false,
});

copyMarkdown(apiDist, path.join(outDir, 'api'));
fs.cpSync(uiDist, path.join(outDir, 'ui'), { recursive: true });

const apiSize = fs.statSync(path.join(outDir, 'api', 'main.js')).size;
console.log(`vscode/dist ready (api bundle ${(apiSize / 1e6).toFixed(1)} MB)`);
