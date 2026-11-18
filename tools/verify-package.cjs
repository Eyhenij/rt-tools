/**
 * Checks that a built package without a framework is consumable outside this workspace.
 *
 *   node tools/verify-package.cjs [package folder] [--no-consumer]   — `utils` when not named
 *
 * The ESLint ban catches a framework import where it is written; this catches everything that ban
 * cannot see — a dependency dragged in transitively, a manifest whose entry points do not resolve,
 * a relative import the Node resolver cannot follow. It asserts against the built output, not the
 * sources, because that is what a consumer installs. The workspace bundler resolves what Node does
 * not, so a package that builds and passes its tests here can still be unloadable: the first
 * version of `ai-chat-protocol` shipped four files importing a neighbour without the extension,
 * and nothing loaded the built package before it was published.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const folder = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'utils';
const withConsumer = !process.argv.includes('--no-consumer');
const distDir = path.resolve(__dirname, '../dist', folder);
const failures = [];

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

if (!fs.existsSync(distDir)) {
    // eslint-disable-next-line no-console
    console.error(`dist/${folder} is missing — run the build first.`);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'package.json'), 'utf8'));
const jsFiles = walk(distDir).filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));

// 1. No partial compilation. ng-packagr emitted 51 of these; a Node build never links them.
const withNgDeclare = jsFiles.filter((file) => fs.readFileSync(file, 'utf8').includes('ɵɵngDeclare'));

if (withNgDeclare.length > 0) {
    failures.push(`partial-compilation markers found in ${withNgDeclare.length} file(s): ${withNgDeclare.join(', ')}`);
}

// 2. Nothing reaches for a framework the manifest does not declare. A package that declares none
//    (the utility package, the protocol package) is framework-free by this line; a package that
//    declares one as a peer (the server packages) may import it, and check 4 holds the declaration.
//
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

// 5. Every relative import of the built ESM names a file that exists, with its extension. Node
//    resolves nothing by guessing: `from './x'` finds no `x.js`. The workspace bundler does guess,
//    which is why this passed every test in the tree and failed in the first consumer.
const RELATIVE_IMPORT = /(?:from\s+|import\(\s*)['"](\.{1,2}\/[^'"]*)['"]/g;

function relativeSpecifiers(file) {
    const faults = [];

    for (const [, specifier] of fs.readFileSync(file, 'utf8').matchAll(RELATIVE_IMPORT)) {
        const target = path.resolve(path.dirname(file), specifier);

        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
            faults.push(`${path.relative(distDir, file)} imports '${specifier}', and no such file exists (the extension is missing?)`);
        }
    }

    return faults;
}

for (const file of jsFiles.filter((name) => name.startsWith(path.join(distDir, 'esm')))) {
    failures.push(...relativeSpecifiers(file));
}

// 6. Both entry points load from the built folder. A package that depends on a neighbour package of
//    this workspace is loaded only through the installed tarball below: the neighbour is not
//    visible from `dist`. This is the check that would have caught the
//    ESM-only package that a CommonJS consumer could not require() no matter how framework-free it
//    was.
function loads(label, expression, cwd) {
    try {
        const count = execFileSync(
            process.execPath,
            ['-e', `Promise.resolve(${expression}).then((m) => console.log(Object.keys(m).length))`],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd }
        ).trim();

        if (Number(count) === 0) {
            failures.push(`${label} entry loaded but exported nothing`);
        }
    } catch (error) {
        failures.push(`${label} entry failed to load: ${error.stderr || error.message}`);
    }
}

const dependsOnWorkspace = Object.keys(manifest.dependencies ?? {}).some((name) => name.startsWith('@rt-tools/'));

if (!dependsOnWorkspace) {
    loads('CommonJS', `require(${JSON.stringify(path.join(distDir, 'cjs', 'index.js'))})`);
    loads('ESM', `import(${JSON.stringify(path.join(distDir, 'esm', 'index.js'))})`);
}

// 7. The package packed as it will be published, installed into an empty folder and loaded by its
//    name through the manifest's `exports`. This is what a consumer does, and what the checks above
//    only imitate: a wrong `exports` map, a file the pack leaves out, a dependency the registry
//    cannot give all show here and nowhere earlier. It needs the registry for the declared
//    dependencies; `--no-consumer` skips it where there is no network.
function consumer() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rt-verify-'));

    try {
        const packed = execFileSync('npm', ['pack', '--silent', '--pack-destination', tmp], {
            cwd: distDir,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        })
            .trim()
            .split('\n')
            .pop();
        const project = path.join(tmp, 'consumer');

        fs.mkdirSync(project);
        fs.writeFileSync(path.join(project, 'package.json'), '{ "name": "rt-verify-consumer", "private": true }\n');
        execFileSync('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', path.join(tmp, packed)], {
            cwd: project,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        loads('installed CommonJS', `require(${JSON.stringify(manifest.name)})`, project);
        loads('installed ESM', `import(${JSON.stringify(manifest.name)})`, project);
    } catch (error) {
        failures.push(`the packed package could not be installed and loaded: ${error.stderr || error.message}`);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}

if (withConsumer) {
    consumer();
}

if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`${manifest.name} is not consumable:\n${failures.map((line) => `  - ${line}`).join('\n')}`);
    process.exit(1);
}

// eslint-disable-next-line no-console
console.log(
    `${manifest.name} verified: ${jsFiles.length} built files, no undeclared imports, relative imports resolve, entry points load${withConsumer ? ' from the packed tarball too' : ''}.`
);
