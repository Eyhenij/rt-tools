/**
 * Checks that the built `@rt-tools/utils` is actually consumable outside Angular.
 *
 * The ESLint ban catches a framework import where it is written; this catches everything that ban
 * cannot see — a dependency dragged in transitively, a build config that reintroduces partial
 * compilation, a manifest whose entry points do not resolve. It asserts against the built output,
 * not the sources, because that is what a consumer installs.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist/utils');
const failures = [];

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

if (!fs.existsSync(distDir)) {
    // eslint-disable-next-line no-console
    console.error('dist/utils is missing — run the build first.');
    process.exit(1);
}

const jsFiles = walk(distDir).filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));

// 1. No partial compilation. ng-packagr emitted 51 of these; a Node build never links them.
const withNgDeclare = jsFiles.filter((file) => fs.readFileSync(file, 'utf8').includes('ɵɵngDeclare'));

if (withNgDeclare.length > 0) {
    failures.push(`partial-compilation markers found in ${withNgDeclare.length} file(s): ${withNgDeclare.join(', ')}`);
}

// 2. Nothing reaches for a framework at runtime.
const FRAMEWORK = /(?:from\s+|require\(\s*)['"](@angular\/[^'"]*|rxjs(?:\/[^'"]*)?)['"]/g;

for (const file of jsFiles) {
    const hits = [...fs.readFileSync(file, 'utf8').matchAll(FRAMEWORK)].map((match) => match[1]);

    if (hits.length > 0) {
        failures.push(`${path.relative(distDir, file)} imports ${[...new Set(hits)].join(', ')}`);
    }
}

// 3. The manifest declares no framework dependency of any kind.
const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'package.json'), 'utf8'));

for (const block of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    const offenders = Object.keys(manifest[block] ?? {}).filter((name) => name.startsWith('@angular/') || name === 'rxjs');

    if (offenders.length > 0) {
        failures.push(`${block} declares ${offenders.join(', ')}`);
    }
}

// 4. Every package the built output reaches for is declared. Loading the entries proves nothing
//    here: the workspace has every package installed, so an undeclared dependency resolves fine
//    locally and only fails once someone installs the tarball on its own. `tslib` shipped
//    undeclared in 0.1.0 exactly this way — `importHelpers` puts it in the CommonJS output, and
//    nothing in the manifest said so.
const BARE_IMPORT = /(?:from\s+|require\(\s*)['"]([^'".][^'"]*)['"]/g;
const declared = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);
const undeclared = new Map();

for (const file of jsFiles) {
    for (const [, specifier] of fs.readFileSync(file, 'utf8').matchAll(BARE_IMPORT)) {
        if (specifier.startsWith('node:')) {
            continue;
        }

        const pkg = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

        if (!declared.has(pkg)) {
            undeclared.set(pkg, path.relative(distDir, file));
        }
    }
}

for (const [pkg, file] of undeclared) {
    failures.push(`${file} imports ${pkg}, which the manifest does not declare`);
}

// 5. Both entry points load. This is the check that would have caught the ESM-only package that
//    a CommonJS consumer could not require() no matter how framework-free it was.
const entries = [
    ['CommonJS', `require(${JSON.stringify(path.join(distDir, 'cjs', 'index.js'))})`],
    ['ESM', `import(${JSON.stringify(path.join(distDir, 'esm', 'index.js'))})`],
];

for (const [label, expression] of entries) {
    try {
        const count = execFileSync(
            process.execPath,
            ['-e', `Promise.resolve(${expression}).then((m) => console.log(Object.keys(m).length))`],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
        ).trim();

        if (Number(count) === 0) {
            failures.push(`${label} entry loaded but exported nothing`);
        }
    } catch (error) {
        failures.push(`${label} entry failed to load: ${error.stderr || error.message}`);
    }
}

if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`@rt-tools/utils is not framework-free:\n${failures.map((line) => `  - ${line}`).join('\n')}`);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`@rt-tools/utils verified: ${jsFiles.length} built files, no framework imports, both entry points load.`);
