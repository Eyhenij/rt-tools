#!/usr/bin/env node
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
 * A non-zero code means one thing: the asked name is matched by no binding. An empty answer would
 * read the same as a typo in the name.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';
import { ANCHOR, SPECS_DIR, walk } from './spec-common.mjs';

/** A binding line of a companion: the statement text and the addresses it is carried out by. */
const BINDING = /^-\s+\*\*(.+?)\*\*\s+—\s+(.*)$/;

/** What counts as a resource of the package: the kinds of file the layout carries. */
const CARRIED = /\.(md|sh|mjs|ts|json)$/;

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

/** The answer about one name: the subdomain, its statements about that very file and the addresses. */
function entry(asked, all) {
    const askedSegments = segmentsOf(asked);
    const hit = all.filter((row) => tailMatches(segmentsOf(row.file), askedSegments));

    if (hit.length === 0) {
        console.log(`specs-for: not one spec speaks of «${asked}»`);
        console.log('The resources no spec speaks of are listed by the same command without a name.');

        return 1;
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
 * The uncovered are counted by what the package carries, not by the files the bindings name:
 * counted the other way round, the list is empty by construction.
 */
function uncovered(all) {
    const named = all.map((row) => segmentsOf(row.file));
    const gaps = carried().filter((path) => {
        const segments = segmentsOf(path);

        return !named.some((other) => tailMatches(other, segments) || tailMatches(segments, other));
    });

    gaps.sort().forEach((path) => console.log(path));

    return 0;
}

function main() {
    const asked = process.argv[2];
    const all = bindings();

    return asked ? entry(asked, all) : uncovered(all);
}

process.exit(main());
