#!/usr/bin/env node
// rt-kit v0.27.0 · checks/specs-for.mjs · 1946334e363c · правится надстройкой, не здесь
/**
 * The entry into the specs by the name of a resource: which spec speaks of this file and what
 * exactly it says about it.
 *
 * A complaint from the intake names the place it is about — a hook, a rule, a skill — and the specs
 * have no entry by that name. More than twenty subdomains stand in the domain, and the one needed is
 * told from the rest only by reading: what is paid for by the whole window is not done before every
 * taking apart of a complaint, and the complaint gets judged by memory.
 *
 * The entry is assembled from the bindings of the companions, not from a list of its own: a second
 * list would name the same files from the other side and would diverge from the bindings in silence.
 *
 *   node tools/specs-for.mjs hooks/turn-exit-guard.sh   # which spec speaks of this file
 *   node tools/specs-for.mjs                            # the resources no spec speaks of
 *
 * Three answers, and the code tells them apart: zero — a spec speaks of the file; three — the
 * package carries the file and no spec speaks of it; one — the package carries no such name at all.
 * Answered by one code, a hole in the specs reads as a typo in the name, and the taking apart goes
 * back to memory — the very thing the entry was made against.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';
import { ANCHOR, SPECS_DIR, walk } from './spec-common.mjs';

/** A binding line of a companion: the statement text and the addresses it is carried out by. */
const BINDING = /^-\s+\*\*(.+?)\*\*\s+—\s+(.*)$/;

/** What counts as a resource of the package: the kinds of file the layout carries. */
const CARRIED = /\.(md|sh|mjs|ts|json)$/;

/** The package carries the file and no spec speaks of it: a gap in the specs, not a wrong name. */
const EXIT_UNCOVERED = 3;

/** The package carries no such file: a wrong name, and there is nothing to look for a spec about. */
const EXIT_UNKNOWN = 1;

/**
 * The tail of a path is matched by whole segments. Matched by characters, a short name matches a
 * longer one ending in it — a guard name would match a neighbouring guard whose name ends the same
 * way — and the answer names a foreign spec, that is, leads the taking apart to a statement about
 * another file.
 */
function tailMatches(pathSegments, askedSegments) {
    if (askedSegments.length > pathSegments.length) {
        return false;
    }

    const from = pathSegments.length - askedSegments.length;

    return askedSegments.every((segment, at) => segment === pathSegments[from + at]);
}

const segmentsOf = (path) => path.replace(/^\.\//, '').split('/').filter(Boolean);

/**
 * Every binding of every companion of the specs: the spec it stands in, the statement text, the
 * address and the file of that address.
 */
function bindings() {
    const found = [];

    for (const companion of walk(SPECS_DIR, (name) => name === 'implementation.md')) {
        let text = '';
        try {
            text = readFileSync(join(ROOT, companion), 'utf8');
        } catch {
            continue;
        }

        for (const line of text.split('\n')) {
            const parsed = BINDING.exec(line);

            if (!parsed) {
                continue;
            }

            const [, statement, rest] = parsed;

            for (const anchor of rest.matchAll(ANCHOR)) {
                found.push({
                    spec: `${companion.slice(0, -'implementation.md'.length)}spec.md`,
                    statement: statement.trim(),
                    file: anchor[1],
                    symbol: anchor[2],
                });
            }
        }
    }

    return found;
}

/** The files the package carries: the sources of portable texts named by the tree. */
function carried() {
    const found = [];

    const collect = (dir) => {
        let entries;
        try {
            entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            const path = `${dir}/${entry.name}`;

            if (entry.isDirectory()) {
                if (!CONFIG.skippedDirs.includes(entry.name)) {
                    collect(path);
                }
            } else if (CARRIED.test(entry.name)) {
                found.push(path);
            }
        }
    };

    CONFIG.portableDirs.forEach(collect);

    return found;
}

/**
 * The answer about one name: the subdomain, its statements about that very file and the addresses.
 *
 * Three outcomes, and they are told apart by the exit code, not by the wording alone: the taking
 * apart of a complaint reads the code. Covered — zero; the package carries the file and no spec
 * speaks of it — `EXIT_UNCOVERED`; the package carries no such file at all — `EXIT_UNKNOWN`.
 *
 * The middle outcome exists because it used to answer the same as a typo in the name. A hole in the
 * specs then read as one's own mistake, and the complaint got judged by memory — the very thing the
 * entry was made against.
 */
function entry(asked, all) {
    const askedSegments = segmentsOf(asked);
    const hit = all.filter((row) => tailMatches(segmentsOf(row.file), askedSegments));

    if (hit.length === 0) {
        return absent(asked, askedSegments, all);
    }

    // A file two subdomains speak of comes back with both, and the statements stand apart under
    // each: read in one heap, they read as the statements of one spec.
    const bySpec = new Map();
    for (const row of hit) {
        bySpec.set(row.spec, [...(bySpec.get(row.spec) ?? []), row]);
    }

    for (const [spec, rows] of bySpec) {
        console.log(spec);
        for (const row of rows) {
            console.log(`  ${row.file}:${row.symbol}`);
            console.log(`    — ${row.statement}`);
        }
        console.log('');
    }

    return 0;
}

/**
 * The gaps: the files the package carries that not one binding names.
 *
 * Counted by what the package carries, not by the files the bindings name: counted the other way
 * round, the list is empty by construction.
 */
function gapsOf(all) {
    const named = all.map((row) => segmentsOf(row.file));

    return carried()
        .filter((path) => {
            const segments = segmentsOf(path);

            return !named.some((other) => tailMatches(other, segments) || tailMatches(segments, other));
        })
        .sort();
}

/** The answer to a name no binding matched: a gap in the specs or a name the package does not carry. */
function absent(asked, askedSegments, all) {
    const gaps = gapsOf(all);
    const gap = gaps.find((path) => tailMatches(segmentsOf(path), askedSegments));

    if (gap) {
        console.log(`specs-for: the package carries «${gap}», and not one spec speaks of it`);
        console.log(`Such resources: ${gaps.length}. The whole list is printed by the same command without a name.`);

        return EXIT_UNCOVERED;
    }

    console.log(`specs-for: the package carries no «${asked}» — the name is matched by nothing`);
    console.log('The resources no spec speaks of are listed by the same command without a name.');

    return EXIT_UNKNOWN;
}

/** The list of the gaps, a path per line: what is printed by the call without a name. */
function uncovered(all) {
    gapsOf(all).forEach((path) => console.log(path));

    return 0;
}

function main() {
    const asked = process.argv[2];
    const all = bindings();

    return asked ? entry(asked, all) : uncovered(all);
}

process.exit(main());
