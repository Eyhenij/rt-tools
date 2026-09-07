#!/usr/bin/env node
/**
 * It moves the imports that drifted apart into two packages: `@rt-tools/utils` was left without the
 * framework, and everything that needs the framework left for `@rt-tools/core`.
 *
 * This move has no backward compatibility and cannot have any: a re-export of what moved would bring
 * Angular back into the dependency graph of `utils` and cancel the whole move. So every consumer
 * edits the imports at home, and a tool does it rather than hands: there are three dozen names, and a
 * declaration where what moved stands next to what stayed is not always split by hand.
 *
 * The tool knows nothing about the application: its only knowledge of the subject is the table below.
 *
 *     node tools/migrate-utils-imports.mjs <directory> [--dry]
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** The package the names left and the package they arrived in. */
const FROM = '@rt-tools/utils';
const TO = '@rt-tools/core';

/**
 * The names that left `utils` for `core`. The value is the name in the new package: at the
 * enumeration of positions it is different, because the renaming arrived after the move. A table
 * repeating the old name would give a declaration that builds by address and falls by name.
 */
const MOVED = new Map([
    // the directives
    ['RtEscapeKeyDirective', 'RtEscapeKeyDirective'],
    ['RtIconOutlinedDirective', 'RtIconOutlinedDirective'],
    ['RtNavigationDirective', 'RtNavigationDirective'],
    ['RtScrollDirective', 'RtScrollDirective'],
    ['RtScrollToElementDirective', 'RtScrollToElementDirective'],
    ['RtTabQueryParamDirective', 'RtTabQueryParamDirective'],
    // the pipes
    ['BreakStringPipe', 'BreakStringPipe'],
    ['EmptyToDashPipe', 'EmptyToDashPipe'],
    ['EntityToStringPipe', 'EntityToStringPipe'],
    ['EqualChainPipe', 'EqualChainPipe'],
    ['EqualPipe', 'EqualPipe'],
    ['IsEmailPipe', 'IsEmailPipe'],
    ['NotEqualChainPipe', 'NotEqualChainPipe'],
    ['NotEqualPipe', 'NotEqualPipe'],
    ['SanitizePipe', 'SanitizePipe'],
    ['TernaryPipe', 'TernaryPipe'],
    // the services and their settings
    ['BreakpointService', 'BreakpointService'],
    ['Breakpoints', 'Breakpoints'],
    ['IBreakpoints', 'IBreakpoints'],
    ['DeviceDetectorService', 'DeviceDetectorService'],
    ['WINDOWS', 'WINDOWS'],
    ['MAC_OS', 'MAC_OS'],
    ['LINUX', 'LINUX'],
    ['ANDROID', 'ANDROID'],
    ['IOS', 'IOS'],
    ['UNKNOWN', 'UNKNOWN'],
    // the environment sign, the value checks, the overlay and the provider
    ['NAVIGATOR', 'NAVIGATOR'],
    ['arraysNotEmptyValidator', 'arraysNotEmptyValidator'],
    ['checkIsMatchingValues', 'checkIsMatchingValues'],
    ['OVERLAY_POSITIONS', 'OVERLAY_POSITIONS'],
    ['POSITION_ENUM', 'EPosition'],
    ['isHTMLElement', 'isHTMLElement'],
    ['provideRtUtils', 'provideRtUtils'],
]);

/** The code file extensions. The tool does not read markup and styles: they hold no imports. */
const CODE = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

/** The directories the walk does not enter: what is built and what is installed is edited by its own source. */
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.git', '.angular', '.nx', 'tmp']);

/**
 * A declaration naming names in braces — an import or a re-export, with the word `type` before the
 * braces or without. A star and a default import do not fall here: there is nothing to split them
 * by, and the tool names them apart.
 */
const NAMED = new RegExp(
    String.raw`(?<head>\b(?:import|export)\s+(?:type\s+)?)\{(?<names>[^}]*)\}(?<mid>\s*from\s*)(?<quote>['"])` +
        FROM.replace('/', String.raw`\/`) +
        String.raw`\k<quote>`,
    'g'
);

/** A star and a default import from the same package: it is split only by hand. */
const WHOLE = new RegExp(
    String.raw`\bimport\s+(?:\*\s+as\s+\w+|\w+)\s+from\s*['"]` + FROM.replace('/', String.raw`\/`) + String.raw`['"]`,
    'g'
);

/** A named import from the destination package already standing in the file: it is appended to rather than a second one created. */
const EXISTING_TO = new RegExp(
    String.raw`\bimport\s+\{(?<names>[^}]*)\}\s*from\s*(?<quote>['"])` + TO.replace('/', String.raw`\/`) + String.raw`\k<quote>`
);

/** The reading of one name in braces: `type Name as Own` — three parts, either of the first two may be missing. */
function parseName(raw) {
    const text = raw.trim();
    const typed = /^type\s+/.test(text);
    const rest = text.replace(/^type\s+/, '');
    const [source, alias] = rest.split(/\s+as\s+/);

    return { text, typed, source: source.trim(), alias: alias?.trim() };
}

/** The name as it will travel into the new package: the renaming arrives together with the address. */
function renamed(name) {
    const target = MOVED.get(name.source);
    const head = name.typed ? 'type ' : '';

    if (name.alias) {
        return `${head}${target} as ${name.alias}`;
    }

    return target === name.source ? `${head}${target}` : `${head}${target} as ${name.source}`;
}

/**
 * The rewritten text of the file and a count of what was done to it.
 *
 * A declaration without moved names is not touched at all: the tool is called on the whole tree, and
 * a file the edit does not concern must stay byte for byte as it was.
 */
function rewrite(text) {
    let moved = 0;
    let split = 0;
    const added = [];

    const next = text.replace(NAMED, (match, ...rest) => {
        const groups = rest.at(-1);
        const names = groups.names
            .split(',')
            .filter((one) => one.trim())
            .map(parseName);
        const goes = names.filter((one) => MOVED.has(one.source));

        if (goes.length === 0) {
            return match;
        }

        const stays = names.filter((one) => !MOVED.has(one.source));
        const fresh = goes.map(renamed);

        if (stays.length === 0) {
            moved += 1;

            return `${groups.head}{ ${fresh.join(', ')} }${groups.mid}${groups.quote}${TO}${groups.quote}`;
        }

        split += 1;
        added.push(...fresh);

        return `${groups.head}{ ${stays.map((one) => one.text).join(', ')} }${groups.mid}${groups.quote}${FROM}${groups.quote}`;
    });

    return { text: added.length ? place(next, added) : next, moved, split, added: added.length };
}

/**
 * The names from a split declaration are put into an import from the destination package. One
 * already standing in the file is added to: a second declaration of the same address builds, but a
 * consumer's linter most often counts it a duplicate — and the tool's edit has to be edited by hand.
 */
function place(text, added) {
    const existing = EXISTING_TO.exec(text);

    if (existing) {
        const names = existing.groups.names
            .split(',')
            .map((one) => one.trim())
            .filter(Boolean);

        return text.replace(
            existing[0],
            `import { ${[...names, ...added].join(', ')} } from ${existing.groups.quote}${TO}${existing.groups.quote}`
        );
    }

    // By a declaration of its own — right after the one the names were taken out of: next to it the
    // reader sees that this is one edit rather than two unconnected imports.
    const anchor = new RegExp(String.raw`^.*from\s*['"]` + FROM.replace('/', String.raw`\/`) + String.raw`['"].*$`, 'm');
    const line = anchor.exec(text);
    const ending = line[0].trimEnd().endsWith(';') ? ';' : '';

    return text.replace(anchor, `${line[0]}\nimport { ${added.join(', ')} } from '${TO}'${ending}`);
}

/** The walk of a directory: the code files, except what is built and what is installed. */
function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory()) {
            return SKIP.has(entry.name) ? [] : walk(join(dir, entry.name));
        }

        const dot = entry.name.lastIndexOf('.');

        return dot > 0 && CODE.has(entry.name.slice(dot)) ? [join(dir, entry.name)] : [];
    });
}

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const root = args.find((one) => !one.startsWith('--'));

if (args.includes('--help') || !root) {
    console.log('node tools/migrate-utils-imports.mjs <directory> [--dry]');
    console.log(`It moves the imports of what left ${FROM} for ${TO}.`);
    console.log('  <directory>  what to walk; what is built and what is installed is skipped');
    console.log('  --dry        say what would change and write nothing');
    process.exit(args.includes('--help') ? 0 : 1);
}

let files = 0;
let moved = 0;
let split = 0;
const whole = [];

for (const file of walk(root)) {
    const before = readFileSync(file, 'utf8');

    if (!before.includes(FROM)) {
        continue;
    }

    if (WHOLE.test(before)) {
        whole.push(file);
        WHOLE.lastIndex = 0;
    }

    const after = rewrite(before);

    if (after.text === before) {
        continue;
    }

    files += 1;
    moved += after.moved;
    split += after.split;

    if (!dry) {
        writeFileSync(file, after.text);
    }

    console.log(`${file}: moved ${after.moved}, split ${after.split}`);
}

// The total is printed last: it is read by the run, and the list for a manual sorting out is longer
// than it by every such file — standing below, it would leave the total where nobody looks for it.
if (whole.length) {
    console.log(`split only by hand — a whole-package import (${whole.length}):`);
    whole.forEach((file) => console.log(`  ${file}`));
    console.log('');
}

console.log(`${dry ? 'a dry run: ' : ''}files ${files}, declarations moved ${moved}, split ${split}`);
