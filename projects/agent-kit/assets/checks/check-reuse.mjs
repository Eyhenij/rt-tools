#!/usr/bin/env node
/**
 * The sweeping check that the ready-made was not bypassed.
 *
 * The guard `reuse-first-guard.sh` judges an edit at the moment it is written and knows only the
 * added text. What was written before it nobody counts: the styling check measures classes, the
 * linters types and techniques, and that a screen is assembled from a native button instead of the
 * button of the kit is seen by none of them. This check answers another question — «and how much
 * of that is in the tree right now» — and therefore looks at the whole file, not at the edit.
 *
 * The signs do not lie here: they are declared as bundles per package of rt-tools, and the tree
 * names in the setting of the checks the ones it takes. The same list is read by the guard — they
 * must not diverge, otherwise an edit passes the guard and falls on the gate. Its own signs the
 * tree appends by a file of its own. A bundle is declared with the area of the tree it holds over:
 * an application assembled from another set of ready-made code drops out of the walk by the
 * declaration, not by the tree declining to declare the bundle at all.
 *
 * There are two differences from the guard. The first: the inventory of the kit is not read — the
 * guard asks the disk because it answers for one edit, while a sweeping check cares about what has
 * piled up, and a missing package would silently zero the digest. The second: the marker
 * `native-ok` takes off its own line and the next one, not the whole file.
 *
 * What piled up by the moment the check was started lies in tools/reuse-allowlist.json and does not
 * count as a refusal: the gate falls on a new discrepancy, while the old stays a visible number in
 * the digest. A snapshot of the list — `node tools/check-reuse.mjs --baseline`.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, baselineOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';
import { loadSignals } from './signals.mjs';

const ALLOWLIST = allowlistOf('reuse');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;
const BACKEND_ROOTS = CONFIG.backendRoots;

// A shortage of signs is a refusal, not empty work: the check stands in the push gate, and a green
// answer without a single file read is indistinguishable from an honest zero. The refusal is
// printed as a line, not as a call stack: it is read by whoever sets up the tree, not by whoever
// edits this check.
let SIGNALS;
try {
    SIGNALS = loadSignals(CONFIG.reuse ?? {}, ROOT);
} catch (failure) {
    console.error(`check-reuse: ${failure.message}`);
    console.error('\nThe rule of uniformity is `reuse-first`.');
    process.exit(1);
}

function count(text, expression) {
    return [...text.matchAll(expression)].length;
}

/**
 * How many times the sign is seen in the text.
 *
 * `strip` crosses out the prescribed variant before the count: the button of the kit has the same
 * substring `<button`, and without the crossing out it would count as a violation by itself. `all`
 * demands a match of every template at once — that is how a host stretched over the whole screen is
 * described. `cancel` puts the sign out whole: the base is already inherited, the ready-made is
 * already called.
 */
function found(signal, text) {
    const body = signal.strip ? text.replace(new RegExp(signal.strip, 'gs'), '') : text;
    if (signal.cancel && new RegExp(signal.cancel).test(body)) {
        return 0;
    }
    if (signal.all?.some((one) => !new RegExp(one).test(body))) {
        return 0;
    }
    if (signal.mode === 'presence') {
        return new RegExp(signal.find).test(body) ? 1 : 0;
    }

    return count(body, new RegExp(signal.find, signal.flags ?? 'g'));
}

function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path));
        } else if (/\.(html|scss|ts)$/.test(entry.name)) {
            files.push(path);
        }
    }

    return files;
}

/** Tests, storybook and end-to-end tests are not judged: the native is fitting there */
function judged(path) {
    return !/\.stories\.(ts|html)$|\.spec\.ts$|\/site-e2e\/|\/admin-e2e\//.test(path);
}

/**
 * The marker is a deliberate deviation named by the author. The line where it stands is taken off,
 * and the one that follows it: in markup the marker is put as a comment above the code, because the
 * formatter spreads a long tag over lines and takes the first attribute off the line of the tag
 * name — the sign counts the tag name, and the marker ends up below. Further than the next line the
 * marker does not reach: it does not put out the whole file, otherwise one allowed case would cover
 * its neighbours.
 */
function withoutMarked(text) {
    const lines = text.split('\n');

    return lines.filter((line, index) => !line.includes('native-ok') && !lines[index - 1]?.includes('native-ok')).join('\n');
}

/**
 * Whether the file lies in the area the sign was declared with.
 *
 * The boundary is judged by the directory, not by the beginning of the string: `apps/admin` must
 * not take in `apps/administration`, otherwise a neighbouring application gets judged by a set of
 * ready-made code it was never assembled from. A sign without an area holds over the whole tree.
 */
function within(path, roots) {
    if (!roots || roots.length === 0) {
        return true;
    }

    return roots.some((area) => path === area || path.startsWith(area.endsWith('/') ? area : `${area}/`));
}

const allowlist = parseAllowlist('reuse');
const known = allowlist.keys;
const debt = new Set(allowlist.debt.keys());

const findings = [];
for (const root of SOURCE_ROOTS) {
    for (const path of collectFiles(root).filter(judged).sort()) {
        const text = withoutMarked(readFileSync(join(ROOT, path), 'utf8'));
        for (const signal of SIGNALS) {
            const skipped = signal.skipBackendRoots && BACKEND_ROOTS.some((root) => path.startsWith(root));
            // `exceptNamed` is the reverse side of `onlyNamed`: a tree that writes the ready-made
            // itself takes the folders of the source of that ready-made out from under the sign,
            // not the bundle whole.
            const excluded = signal.exceptNamed && new RegExp(signal.exceptNamed).test(path);
            const outside = !within(path, signal.roots);
            if (
                !path.endsWith(signal.ext) ||
                skipped ||
                excluded ||
                outside ||
                (signal.onlyNamed && !new RegExp(signal.onlyNamed).test(path))
            ) {
                continue;
            }
            const times = found(signal, text);
            if (times > 0) {
                findings.push({ key: `${signal.key} ×${times} @ ${path}`, instead: signal.instead });
            }
        }
    }
}

const fresh = findings.filter((finding) => !known.has(finding.key));
const stale = [...known].filter((key) => !findings.some((finding) => finding.key === key));

if (process.argv.includes('--baseline')) {
    console.log(baselineOf(findings.map((finding) => finding.key).sort(), allowlist));
    process.exit(0);
}

const problems = [
    // The ready-made is named with a reservation on purpose: the sign judges the tag, and the place
    // of showing it does not. Replacing one's own paragraph of a refusal with a ready-made component
    // of the same screen closes the sign and leaves the violation in place — thirteen templates were
    // repaired that way at once. The output line is a measurement, not an instruction.
    ...fresh.map((finding) => `${finding.key} — the ready-made (if the place of use is right): ${finding.instead}`),
    ...stale.map((key) => `${key}: listed in ${ALLOWLIST}, and the tree carries no such divergence any more — fix the line or remove it`),
];

if (problems.length > 0) {
    console.error(`check-reuse: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nThe rule of uniformity is `reuse-first`.');
    process.exit(1);
}

const places = findings.reduce((sum, finding) => sum + Number(finding.key.match(/×(\d+)/)[1]), 0);
console.log(
    `check-reuse: places where the ready-made was bypassed: ${places} in ${findings.length} signs — accepted ${findings.length - debt.size}, debt ${debt.size}, no new ones`
);
