import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const bad = [];
for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const [name, version] of Object.entries(pkg[section] ?? {})) {
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) bad.push(`${section}: ${name}@${version}`);
  }
}
if (!/^pnpm@\d+\.\d+\.\d+$/.test(pkg.packageManager)) bad.push(`packageManager: ${pkg.packageManager}`);
if (bad.length) { console.error('Only exact, stable version numbers are allowed:', bad); process.exitCode = 1; }
else console.log('All direct dependencies and pnpm version are pinned to stable semver releases.');
