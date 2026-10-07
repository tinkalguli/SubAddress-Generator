#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const outZip = join(root, `subaddress-generator-${pkg.version}.zip`);

if (!existsSync(dist)) {
  console.error('Run npm run build first.');
  process.exit(1);
}

const result = spawnSync('zip', ['-r', '-9', outZip, '.'], {
  cwd: dist,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Created ${outZip}`);
