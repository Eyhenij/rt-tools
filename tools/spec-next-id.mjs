#!/usr/bin/env node
/**
 * The next free scenario number — over all the branches rather than over the main one alone.
 *
 * A number ties a scenario to its test, and issued a second time it leaves the old reference looking
 * right and leading elsewhere. The free number was looked up in the main branch while a neighbouring
 * piece of work held its own six on the disk and had not arrived in the main one yet: `SC-AK-415` …
 * `SC-AK-420` were handed out twice, and the work whose agreement was not merged had to move.
 *
 * The command reads the scenario headings in all the tree's branches — its own and the remote ones —
 * and prints the first free number past the largest taken. Taken means a number standing anywhere at
 * all: the branch holding it will arrive sooner or later.
 *
 *   node tools/spec-next-id.mjs AK      # the next free one for the prefix AK
 *   node tools/spec-next-id.mjs         # by a prefix for each one met
 *
 * A non-zero code is only a refusal of the command itself.
 */
import { execFileSync } from 'node:child_process';

const WANT = process.argv[2]?.toUpperCase().replace(/^SC-|-$/g, '') ?? '';
const HEADING = /\bSC-([A-Z]{2,4})-(\d{1,3})\b/g;

function git(args) {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** The tree's branches: its own and the remote ones. A branch holding a number will arrive sooner or later. */
function branches() {
    const names = git(['for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes'])
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((ref) => !ref.endsWith('/HEAD'));

    return [...new Set(names)];
}

function main() {
    const taken = new Map();
    for (const ref of branches()) {
        let text = '';
        try {
            text = git(['grep', '-h', '-oE', 'SC-[A-Z]{2,4}-[0-9]{1,3}', ref, '--', 'docs']);
        } catch {
            // A branch without a single scenario is a lawful case: `git grep` gives a non-zero code.
            continue;
        }
        for (const match of text.matchAll(HEADING)) {
            const [, prefix, number] = match;
            const max = taken.get(prefix) ?? 0;
            taken.set(prefix, Math.max(max, Number(number)));
        }
    }

    if (taken.size === 0) {
        console.log('spec-next-id: not one scenario was found in any branch');

        return 0;
    }

    const rows = [...taken.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [prefix, max] of rows) {
        if (WANT && prefix !== WANT) {
            continue;
        }
        console.log(`SC-${prefix}: taken up to ${max}, the next free is SC-${prefix}-${max + 1}`);
    }

    if (WANT && !taken.has(WANT)) {
        console.log(`SC-${WANT}: not one number is taken, the next free is SC-${WANT}-1`);
    }

    return 0;
}

process.exit(main());
