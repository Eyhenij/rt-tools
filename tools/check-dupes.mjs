#!/usr/bin/env node
// rt-kit v0.28.0 · checks/check-dupes.mjs · c9d11abdf649 · правится надстройкой, не здесь
/**
 * A check that a pattern is not written a second time.
 *
 * A duplicate appears silently: a domain writes its own enumeration of statuses because
 * someone else's lies in a lib it cannot see — and from then on the two sets drift apart
 * one value at a time. Neither lint, nor the build, nor the tests see this: each copy
 * on its own is sound.
 *
 * It is caught by these signs:
 *
 *   1. One name exported from two different libs. The name is not the same by chance —
 *      it was chosen for one and the same notion.
 *   2. Two enumerations with the same set of members under different names.
 *      The name drifted, the notion stayed one.
 *   3. A setting under one name declared in two libs. It has no export, so the first
 *      sign did not see it: `DEFAULT_PAGE_SIZE` drifted into six declarations, and one
 *      of them had already become `25` against `20` in the others. Only names of the
 *      form `SCREAMING_SNAKE_CASE` count — the form in which this code writes settings,
 *      not local variables.
 *   4. An enumeration repeating a set from an external package. The sets of `@rt-tools/utils`
 *      are read from its `.d.ts` alongside the libs: a copy of the condition operator and of
 *      the sort direction lay on the backend verbatim, while sign 2 compared only libs
 *      with each other and never reached `node_modules`.
 *
 * Members are compared in lower case without underscores, so `NOT_EQUALS` of the contract
 * and `NotEquals` of the application count as one member.
 *
 * The duplicate key carries the list of libs too: without it a third copy of an already
 * known name passed silently — the set changed, the key stayed the same.
 *
 * What had piled up by the time the check was created lies in tools/dupes-allowlist.json
 * and is not counted as a refusal: the gate fails on a NEW duplicate, and the old ones stay
 * visible as a number in the summary. The debt is handled by separate tasks — otherwise
 * the check would have to be created together with an edit of forty places.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { allowlistOf, baselineOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('dupes');
/**
 * Where duplicates are looked for. The roots come from the settings: a hard-coded name silently
 * found not a single file in a tree that keeps its code differently, and the check went green
 * on an empty walk.
 */
const SOURCE_ROOTS = CONFIG.sourceRoots;
/**
 * `gen` and `generated` are the contract and the Prisma client: their declarations are the
 * source the rest is compared against. Counting them as a copy would mean demanding an edit
 * of what the generator rebuilds.
 */
const SKIPPED_DIRS = CONFIG.skippedDirs;
/** The minimum of members at which a matching enumeration set says something */
const MIN_ENUM_MEMBERS = 2;

const allowlist = parseAllowlist('dupes');
const known = allowlist.keys;
const debt = new Set(allowlist.debt.keys());

function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path));
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
            files.push(path);
        }
    }
    return files;
}

/**
 * The declarations directory of an external package — by module resolution, not by a path
 * in `node_modules`.
 *
 * There are several resolution points: the root of the tree and each of its subprojects that
 * declared this package as a dependency. A subproject's package does not lie in the root at all,
 * and resolution from the root does not find it; the package manager meanwhile may keep several
 * versions side by side, and walking the store by a path pattern would pick the one nobody
 * installs.
 *
 * Not found — `null`, and external sets are simply not counted: a tree without this package
 * must get an audit of its own duplicates, not a refusal to read the directory.
 */
function resolveExternalDir({ package: name, dir }) {
    for (const from of [ROOT, ...holdersOf(name)]) {
        try {
            const manifest = createRequire(join(from, 'package.json')).resolve(`${name}/package.json`);
            const found = join(dirname(manifest), dir);
            if (existsSync(found)) {
                return found;
            }
        } catch {
            // This point does not see the package — the next one is tried.
        }
    }

    return null;
}

/** Subprojects that declared the package as a dependency: their manifests are the resolution points. */
function holdersOf(name) {
    const found = [];
    for (const root of SOURCE_ROOTS) {
        if (!existsSync(join(ROOT, root))) {
            continue;
        }
        for (const entry of readdirSync(join(ROOT, root), { withFileTypes: true })) {
            const manifest = join(ROOT, root, entry.name, 'package.json');
            if (!entry.isDirectory() || !existsSync(manifest)) {
                continue;
            }
            const declared = JSON.parse(readFileSync(manifest, 'utf8'));
            const fields = [declared.dependencies, declared.peerDependencies, declared.devDependencies];
            if (fields.some((field) => field?.[name])) {
                found.push(join(ROOT, root, entry.name));
            }
        }
    }

    return found;
}

/** The root of a lib: the path up to the `src` directory. A duplicate inside one lib is not a duplicate */
function libOf(path) {
    const parts = path.split('/');
    const at = parts.indexOf('src');
    return at === -1 ? path : parts.slice(0, at).join('/');
}

const EXPORT_RE = /^export (?:const|function|interface|enum|type|class|abstract class) (\w+)/gm;
const ENUM_RE = /export (?:declare )?enum (\w+)\s*\{([^}]*)\}/g;
const MEMBER_RE = /(\w+)\s*=/g;
/**
 * A numeric setting: an upper-case name and a value made of digits only — a limit,
 * a size, a duration. Strings and lookup tables are deliberately left out:
 * `LOG_CONTEXT` is declared in eight libs, and in each one it means its own thing,
 * while a matching name of a number means a matching notion.
 */
const SETTING_RE = /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::\s*number\s*)?=\s*\d[\d\s*+\-/_.]*;/gm;
/**
 * A string setting and a list setting. They are compared by value, not by name: one name
 * means different things here — `BEM_BLOCK` is declared in thirty-six libs, `LOG_CONTEXT`
 * in ten, and each lib has its own. The same value under different names is the opposite:
 * almost always one notion written twice — the name of an edit event, the refusal code
 * about a duplicate, the set of accepted attachment types.
 */
const STRING_SETTING_RE =
    /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*('[^']*'|"[^"]*"|`[^`]*`|\[[^\]]*\])\s*(?:as const\s*)?;/gm;
/** A lookup table: status into contract, columns into sort fields, label keys */
const TABLE_RE = /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*\{([^}]*?)\}\s*(?:as const\s*)?;/gms;
const PAIR_RE = /([\w'"[\].]+)\s*:\s*([^,\n]+)/g;
/**
 * A value shorter than this says nothing about matching notions: an empty string, a hyphen
 * and `id` match everywhere.
 */
const MIN_VALUE_LENGTH = 4;
/** The minimum of pairs at which matching tables say something */
const MIN_TABLE_PAIRS = 2;
/**
 * The share of matching pairs from which tables count as one. Full equality is blind exactly
 * where a copy drifted from the original by one line — and that is the very case for which
 * copies are merged. The threshold is high: tables of one domain share two or three pairs
 * without any kinship.
 */
const MIN_TABLE_SHARE = 0.8;

/**
 * Packages whose sets count alongside the libs. An enumeration of one's own under a set
 * already declared there is the same copy as one between two libs.
 *
 * The package name and the directory inside it are declared by the tree; the path in
 * `node_modules` is not hard-coded here. A package declared as a subproject dependency does not
 * lie in the root `node_modules` at all — the package manager keeps it in its store — and the
 * check ended with a refusal to read the directory without reaching the audit even once.
 */
const EXTERNAL_ENUM_SOURCES = CONFIG.externalEnums ?? [];

const exportsByName = new Map();
const settingsByName = new Map();
const enums = [];
/** String settings and lists keyed by value: `value → [{ name, lib }]` */
const namesByValue = new Map();
/** Lookup tables: the set of pairs under a key, with the name and the lib next to it */
const tables = [];

/** The value without quotes and spaces; a list — as a sorted set of members */
function valueOf(raw) {
    if (raw.startsWith('[')) {
        const items = [...raw.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)].map((item) => item[1] ?? item[2] ?? item[3]);

        return items.length > 0 ? `[${[...items].sort().join('|')}]` : '';
    }

    return raw.slice(1, -1).trim();
}

function collectEnums(text, lib) {
    for (const match of text.matchAll(ENUM_RE)) {
        const members = [...match[2].matchAll(MEMBER_RE)].map((member) => member[1].toLowerCase().replaceAll('_', ''));
        enums.push({ name: match[1], lib, members: new Set(members) });
    }
}

for (const path of SOURCE_ROOTS.flatMap((root) => collectFiles(root))) {
    const text = readFileSync(join(ROOT, path), 'utf8');
    const lib = libOf(path);

    for (const match of text.matchAll(EXPORT_RE)) {
        const name = match[1];
        if (!exportsByName.has(name)) {
            exportsByName.set(name, new Set());
        }
        exportsByName.get(name).add(lib);
    }

    for (const match of text.matchAll(SETTING_RE)) {
        const name = match[1];
        if (!settingsByName.has(name)) {
            settingsByName.set(name, new Set());
        }
        settingsByName.get(name).add(lib);
    }

    for (const [, name, raw] of text.matchAll(STRING_SETTING_RE)) {
        const value = valueOf(raw);
        if (value.length < MIN_VALUE_LENGTH) {
            continue;
        }
        if (!namesByValue.has(value)) {
            namesByValue.set(value, []);
        }
        namesByValue.get(value).push({ name, lib });
    }

    for (const [, name, body] of text.matchAll(TABLE_RE)) {
        const pairs = [...body.matchAll(PAIR_RE)].map(
            ([, key, value]) => `${key.replaceAll(/['"[\]]/g, '')}:${value.trim().replace(/,$/, '')}`
        );
        if (pairs.length >= MIN_TABLE_PAIRS) {
            tables.push({ name, lib, pairs: new Set(pairs) });
        }
    }

    collectEnums(text, lib);
}

for (const source of EXTERNAL_ENUM_SOURCES) {
    const dir = resolveExternalDir(source);
    if (!dir) {
        continue;
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.d.ts')) {
            collectEnums(readFileSync(join(dir, entry.name), 'utf8'), `${source.package}/${source.dir}`);
        }
    }
}

const findings = [];

for (const [name, libs] of [...exportsByName.entries()].sort()) {
    if (libs.size < 2) {
        continue;
    }
    const where = [...libs].sort().join(', ');
    findings.push({ key: `export ${name} @ ${where}`, text: `${name} is exported from ${libs.size} libs: ${where}` });
}

for (const [name, libs] of [...settingsByName.entries()].sort()) {
    if (libs.size < 2) {
        continue;
    }
    const where = [...libs].sort().join(', ');
    findings.push({ key: `setting ${name} @ ${where}`, text: `${name} is declared in ${libs.size} libs: ${where}` });
}

for (const [value, places] of [...namesByValue.entries()].sort()) {
    const libs = new Set(places.map((place) => place.lib));
    if (libs.size < 2) {
        continue;
    }
    const where = places
        .map((place) => `${place.name} @ ${place.lib}`)
        .sort()
        .join(' ~ ');
    findings.push({ key: `value ${value} @ ${where}`, text: `the value ${value} is declared in ${libs.size} libs: ${where}` });
}

/**
 * The share of matching pairs is counted from the larger table: from the smaller one, a table
 * of two pairs lying entirely inside a table of twenty would read as a full copy.
 */
const tableOverlap = (first, second) => {
    let same = 0;
    for (const pair of first.pairs) {
        if (second.pairs.has(pair)) {
            same += 1;
        }
    }
    const larger = Math.max(first.pairs.size, second.pairs.size);

    return { same, larger, share: same / larger };
};

for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
        const [first, second] = [tables[i], tables[j]];
        if (first.lib === second.lib) {
            continue;
        }
        const { same, larger, share } = tableOverlap(first, second);
        if (share < MIN_TABLE_SHARE) {
            continue;
        }
        const key = `table ${[`${first.name} @ ${first.lib}`, `${second.name} @ ${second.lib}`].sort().join(' ~ ')}`;
        const apart = larger - same;
        const tail = apart === 0 ? 'one table of matches' : `one table of matches, diverged on ${apart} of ${larger} pairs`;
        findings.push({ key, text: `${first.name} (${first.lib}) and ${second.name} (${second.lib}) — ${tail}` });
    }
}

const sameMembers = (first, second) =>
    first.size === second.size && first.size >= MIN_ENUM_MEMBERS && [...first].every((member) => second.has(member));

for (let i = 0; i < enums.length; i++) {
    for (let j = i + 1; j < enums.length; j++) {
        const [first, second] = [enums[i], enums[j]];
        if (first.lib === second.lib || first.name === second.name || !sameMembers(first.members, second.members)) {
            continue;
        }
        const key = `enum ${[`${first.name} @ ${first.lib}`, `${second.name} @ ${second.lib}`].sort().join(' ~ ')}`;
        findings.push({
            key,
            text: `${first.name} (${first.lib}) and ${second.name} (${second.lib}) — one set of members: ${[...first.members].sort().join(', ')}`,
        });
    }
}

const fresh = findings.filter((finding) => !known.has(finding.key));
const staleKeys = [...known].filter((key) => !findings.some((finding) => finding.key === key));

if (process.argv.includes('--baseline')) {
    console.log(baselineOf(findings.map((finding) => finding.key).sort(), allowlist));
    process.exit(0);
}

const problems = [
    ...fresh.map((finding) => finding.text),
    ...staleKeys.map((key) => `${key}: listed in ${ALLOWLIST}, and the duplication is gone — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-dupes: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(`check-dupes: duplications ${findings.length}, of them accepted ${findings.length - debt.size}, debt ${debt.size} — no new ones`);
