#!/usr/bin/env node
/**
 * Does a package import from a neighbouring `@rt-tools/*` symbols the neighbour's published version
 * does not hold.
 *
 * Why this exists. The build and the types in the tree read the neighbour's sources, while a consumer
 * installs the neighbour from the registry — of the version the package's manifest allows. A symbol
 * created at the neighbour and not published is green in the tree, and at a consumer the package does
 * not build. That is how two kits came out: one with `EListSortOrder` from the utils, the other with
 * `EPosition` from the core — the registry held versions without them.
 *
 * How it is judged. The imports are read from the package's sources rather than from the build: the
 * build writes them in the same shape, and the sources are read without it. The neighbour's exports
 * are read from the types of the published package of the version that is the largest in the registry
 * under the manifest's range. The package is fetched by the packing command and put into a cache under
 * `node_modules/.cache/` — the network is asked once per version.
 *
 * The registry did not answer — the check is skipped and says so: the push gate works without the
 * network too, and a silent skip is indistinguishable from a matching that came out right.
 *
 * Two modes. In the push gate and in the pipeline, a symbol the published neighbour does not hold
 * while the neighbour's sources in the tree do hold it is called waiting for the neighbour's
 * publication and does not drop the check: between two releases such a state is ordinary, and it is
 * fixed by the order of publication. With the flag `--strict` — in the publication pipeline — any
 * missing symbol drops the check: a release with it will not build at a consumer. The flag
 * `--package <name>` narrows the judging to one package.
 *
 * A non-zero exit code and a line per symbol: the package, the symbol, the neighbour and its version.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The packages directory is overridden by a variable: the probe set judges a fixture tree, not its own. */
const PROJECTS = process.env.RT_PROJECTS_DIR || join(ROOT, 'projects');

/** The cache of unpacked versions: `<cache>/<package>/<version>/package/…`. A probe puts a fixture here. */
const CACHE = process.env.RT_PUBLISHED_DIR || join(ROOT, 'node_modules/.cache/rt-published');

/** With a fixture the registry is not asked: the versions are taken from the directory. */
const OFFLINE = Boolean(process.env.RT_PUBLISHED_DIR);

const ARGS = process.argv.slice(2);
const STRICT = ARGS.includes('--strict');
const ONLY = ARGS.includes('--package') ? ARGS[ARGS.indexOf('--package') + 1] : null;

const SCOPE = '@rt-tools/';

/** The files that do not travel into the package: the probes and the showcase's stories. */
const NOT_SHIPPED = /\.(spec|stories|test)\.ts$/;

/** A named import from a neighbour, on one line or on several. */
const IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'(@rt-tools\/[a-z0-9-]+)'/g;

/** The comments are removed before the import search: a sample in a description is not an import. */
const COMMENTS = /\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm;

/** A declaration with an export in the types: the name stands after the kind of the declaration. */
const DECLARED =
    /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:enum|const\s+enum|class|interface|type|const|function|let|var|namespace)\s+([A-Za-z_$][\w$]*)/gm;

/** An export list: `export { A, B as C }` and `export type { … }`; the name outward is what stands after `as`. */
const LISTED = /^export\s+(?:type\s+)?\{([^}]*)\}\s*(?:from\s+'[^']+')?\s*;?/gm;

/** The chain `export * from './…'`; `export * as ns from` does not go here — it gives no names. */
const CHAINED = /^export\s+\*\s+from\s+'([^']+)'/gm;

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function walk(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') walk(path, out);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && !NOT_SHIPPED.test(entry.name)) {
            out.push(path);
        }
    }
    return out;
}

/** The names from the list `{ A, B as C, type D }`: an import needs the name at the neighbour, that is, before `as`. */
function namesOf(list, { after = false } = {}) {
    return list
        .split(',')
        .map((item) => item.trim().replace(/^type\s+/, ''))
        .filter(Boolean)
        .map((item) => {
            const [before, alias] = item.split(/\s+as\s+/);
            return (after && alias ? alias : before).trim();
        })
        .filter((name) => name && name !== 'default');
}

/** The package's imports from its neighbours: neighbour → name → the first file the name was met in. */
function importsOf(dir, own) {
    const imports = new Map();
    for (const file of walk(join(dir, 'src'))) {
        const text = readFileSync(file, 'utf8').replace(COMMENTS, '');
        for (const match of text.matchAll(IMPORT)) {
            const neighbour = match[2];
            if (neighbour === own) continue;
            if (!imports.has(neighbour)) imports.set(neighbour, new Map());
            const names = imports.get(neighbour);
            for (const name of namesOf(match[1])) {
                if (!names.has(name)) names.set(name, file.startsWith(ROOT) ? file.slice(ROOT.length + 1) : file);
            }
        }
    }
    return imports;
}

function parseVersion(text) {
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(text.trim());
    return match ? match.slice(1, 4).map(Number) : null;
}

function compare(a, b) {
    for (let i = 0; i < 3; i += 1) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
}

/**
 * Does the manifest's range allow the version. The forms are those the version-raising scripts write:
 * `^`, `~`, exact, `>=` and any. A range the reading does not know allows nothing: that is better than
 * accepting at a guess, and the refusal names the range.
 */
function satisfies(range, version) {
    const text = range.trim();
    if (text === '*' || text === '' || text === 'latest') return true;
    const bound = parseVersion(text.replace(/^[\^~>=]+/, ''));
    if (!bound) return false;
    if (text.startsWith('^')) {
        const upper = bound[0] > 0 ? [bound[0] + 1, 0, 0] : bound[1] > 0 ? [0, bound[1] + 1, 0] : [0, 0, bound[2] + 1];
        return compare(version, bound) >= 0 && compare(version, upper) < 0;
    }
    if (text.startsWith('~')) {
        return compare(version, bound) >= 0 && compare(version, [bound[0], bound[1] + 1, 0]) < 0;
    }
    if (text.startsWith('>=')) return compare(version, bound) >= 0;
    return compare(version, bound) === 0;
}

function maxSatisfying(versions, range) {
    const fit = versions.map((v) => [v, parseVersion(v)]).filter(([, p]) => p && satisfies(range, p));
    fit.sort((a, b) => compare(a[1], b[1]));
    return fit.length ? fit[fit.length - 1][0] : null;
}

/** The registry's answer about the versions. `null` — the registry did not answer; an empty list — the registry has no such package. */
function publishedVersions(name) {
    if (OFFLINE) {
        const dir = join(CACHE, name);
        return existsSync(dir) ? readdirSync(dir).filter((v) => parseVersion(v)) : [];
    }
    try {
        const raw = execFileSync('npm', ['view', name, 'versions', '--json'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        const said = String(error?.stderr || error?.message || '');
        if (/E404|404 Not Found/.test(said)) return [];
        return null;
    }
}

/** The directory of an unpacked version: from the cache or by fetching from the registry. `null` — the fetch failed. */
function unpacked(name, version) {
    const dir = join(CACHE, name, version);
    if (existsSync(join(dir, 'package', 'package.json'))) return dir;
    if (OFFLINE) return null;
    const scratch = mkdtempSync(join(tmpdir(), 'rt-published-'));
    try {
        execFileSync('npm', ['pack', `${name}@${version}`, '--pack-destination', scratch], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const tarball = readdirSync(scratch).find((f) => f.endsWith('.tgz'));
        if (!tarball) return null;
        mkdirSync(dir, { recursive: true });
        execFileSync('tar', ['xzf', join(scratch, tarball), '-C', dir], { stdio: ['ignore', 'pipe', 'pipe'] });
        return dir;
    } catch {
        return null;
    } finally {
        rmSync(scratch, { recursive: true, force: true });
    }
}

/** The types file of a published package: the first of the manifest's fields that leads to a file. */
function typesEntry(packageDir) {
    const manifest = readJson(join(packageDir, 'package.json'));
    const candidates = [manifest.typings, manifest.types, manifest.exports?.['.']?.types, 'index.d.ts'].filter(
        Boolean,
    );
    for (const candidate of candidates) {
        const path = join(packageDir, candidate);
        if (existsSync(path) && statSync(path).isFile()) return path;
    }
    return null;
}

/**
 * The file `export * from` leads to. The types first, the source after: next to a `.d.ts` lies a
 * `.js` of the same name, and taken first it gives an empty list of names.
 */
function resolveChained(from, target) {
    const base = join(dirname(from), target);
    const candidates = [
        base.replace(/\.js$/, '.d.ts'),
        `${base}.d.ts`,
        join(base, 'index.d.ts'),
        `${base}.ts`,
        join(base, 'index.ts'),
        join(base, 'public-api.ts'),
    ];
    if (/\.(d\.ts|ts)$/.test(base)) candidates.unshift(base);
    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
}

/** All the names a package exports: the declarations, the lists and the `export *` chains. */
function exportsOf(entry, seen = new Set(), out = new Set()) {
    if (!entry || seen.has(entry)) return out;
    seen.add(entry);
    const text = readFileSync(entry, 'utf8');
    for (const match of text.matchAll(DECLARED)) out.add(match[1]);
    for (const match of text.matchAll(LISTED)) for (const name of namesOf(match[1], { after: true })) out.add(name);
    for (const match of text.matchAll(CHAINED)) exportsOf(resolveChained(entry, match[1]), seen, out);
    return out;
}

const problems = [];
const notes = [];
let judged = 0;
let skipped = false;

const allPackages = readdirSync(PROJECTS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(PROJECTS, entry.name, 'package.json')))
    .map((entry) => ({
        dir: join(PROJECTS, entry.name),
        manifest: readJson(join(PROJECTS, entry.name, 'package.json')),
    }))
    .filter(({ manifest }) => typeof manifest.name === 'string' && manifest.name.startsWith(SCOPE));
const packages = ONLY ? allPackages.filter(({ manifest }) => manifest.name === ONLY) : allPackages;

if (ONLY && packages.length === 0) {
    console.error(`check-package-imports: there is no package ${ONLY} in «${PROJECTS}» — there is nothing to judge`);
    process.exit(1);
}

const exportsCache = new Map();
const treeExports = new Map();

/** What a neighbour exports in the tree — by its entry point; a symbol from here waits for the neighbour's publication. */
function exportedInTree(neighbour) {
    if (!treeExports.has(neighbour)) {
        const found = allPackages.find(({ manifest }) => manifest.name === neighbour);
        const entry = found
            ? [join(found.dir, 'src/index.ts'), join(found.dir, 'src/public-api.ts')].find((p) => existsSync(p))
            : null;
        treeExports.set(neighbour, entry ? exportsOf(entry) : new Set());
    }
    return treeExports.get(neighbour);
}

for (const { dir, manifest } of packages) {
    const ranges = { ...(manifest.dependencies || {}), ...(manifest.peerDependencies || {}) };
    const imports = importsOf(dir, manifest.name);

    for (const [neighbour, names] of imports) {
        const range = ranges[neighbour];
        if (!range) {
            problems.push(
                `${manifest.name}: it imports from ${neighbour} and does not name it in its manifest — a consumer will not get it`,
            );
            continue;
        }

        judged += 1;
        const key = `${neighbour}@${range}`;
        if (!exportsCache.has(key)) {
            const versions = publishedVersions(neighbour);
            if (versions === null) {
                notes.push(`${neighbour}: the registry did not answer — the matching against the published neighbour is skipped`);
                skipped = true;
                exportsCache.set(key, null);
            } else {
                const version = maxSatisfying(versions, range);
                if (!version) {
                    problems.push(
                        `${manifest.name}: under the range ${neighbour}@${range} the registry holds not one version — a consumer has nothing to install`,
                    );
                    exportsCache.set(key, null);
                } else {
                    const packed = unpacked(neighbour, version);
                    const entry = packed ? typesEntry(join(packed, 'package')) : null;
                    if (!packed) {
                        notes.push(`${neighbour}@${version}: fetching from the registry failed — the matching is skipped`);
                        skipped = true;
                        exportsCache.set(key, null);
                    } else if (!entry) {
                        problems.push(`${neighbour}@${version}: the published package has no types file — there is nothing to match against`);
                        exportsCache.set(key, null);
                    } else {
                        exportsCache.set(key, { version, names: exportsOf(entry) });
                    }
                }
            }
        }

        const published = exportsCache.get(key);
        if (!published) continue;

        for (const [name, file] of names) {
            if (published.names.has(name)) continue;
            const line = `${manifest.name}: it imports ${name} from ${neighbour} (${file}), and the published ${neighbour}@${published.version} does not hold it`;
            if (!STRICT && exportedInTree(neighbour).has(name)) {
                notes.push(`${line} — waiting for the neighbour's publication; until then this package is not published`);
            } else {
                problems.push(line);
            }
        }
    }
}

for (const note of notes) console.error(`check-package-imports: ${note}`);

if (problems.length > 0) {
    console.error(`check-package-imports: divergences ${problems.length}\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
        '\nA symbol the published neighbour does not hold breaks the build at a consumer: first the neighbour is published, then the package importing it.',
    );
    process.exit(1);
}

const pending = notes.filter((note) => note.includes("waiting for the neighbour's publication")).length;
console.log(
    `check-package-imports: packages ${packages.length}, pairs with a neighbour ${judged}, no divergences${pending ? `, waiting for the neighbour's publication ${pending}` : ''}${skipped ? ' — part of the matching is skipped, the registry did not answer' : ''}`,
);
