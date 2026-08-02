/**
 * Assembles the publishable `dist/utils` from the two compiler outputs.
 *
 * `@rt-tools/utils` ships dual-format on purpose: Angular applications resolve the ESM entry and
 * tree-shake it, while a consumer compiling to CommonJS can `require()` the CJS one. Neither the
 * tsc executor nor ng-packagr writes the manifest that makes both reachable, so it is built here:
 * an `exports` map with `import` / `require` branches, plus a `type` marker inside each output
 * folder so Node reads the files under the right module system regardless of what the root says.
 */
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '../projects/utils');
const distDir = path.resolve(__dirname, '../dist/utils');

const source = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));

// Each compiler target cleans only its own folder, so anything else sitting in dist/utils is a
// leftover from an earlier build with a different layout. Publishing ships the whole directory,
// so stale files would go out with it.
const KEEP = new Set(['esm', 'cjs', 'package.json', 'README.md', 'CHANGELOG.md']);

for (const entry of fs.readdirSync(distDir)) {
    if (!KEEP.has(entry)) {
        fs.rmSync(path.join(distDir, entry), { recursive: true, force: true });
    }
}

const manifest = {
    ...source,
    main: './cjs/index.js',
    module: './esm/index.js',
    types: './esm/index.d.ts',
    exports: {
        './package.json': './package.json',
        '.': {
            types: './esm/index.d.ts',
            import: './esm/index.js',
            require: './cjs/index.js',
        },
    },
};

// `type` belongs to the per-format markers below, never to the root: setting it either way here
// would mislabel one of the two outputs.
delete manifest.type;

fs.writeFileSync(path.join(distDir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(distDir, 'esm', 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(distDir, 'cjs', 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`, 'utf8');

for (const file of ['README.md', 'CHANGELOG.md']) {
    const from = path.join(projectDir, file);

    if (fs.existsSync(from)) {
        fs.copyFileSync(from, path.join(distDir, file));
    }
}

// eslint-disable-next-line no-console
console.log(`@rt-tools/utils ${manifest.version}: dist/utils assembled (esm + cjs)`);
