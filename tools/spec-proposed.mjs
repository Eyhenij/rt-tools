// rt-kit v0.25.0 · checks/spec-proposed.mjs · 51b46032f1fe · правится надстройкой, не здесь
/**
 * Product agreements waiting to move into the domain spec.
 *
 * A product agreement the code is already written by merges into the domain spec, and its directory
 * is removed. Left in the main branch, it reads as proposed and not rolled out — that is, as a lie
 * about an application that has been running for a month.
 *
 * The second question to it is age. A binding in a product agreement grows stale silently: the
 * declaration it points at moves along with neighbouring work, and nobody will check the agreement
 * against the code until it is merged. Three such lay for a month, and the miss was found exactly
 * at the merge — that is, at the hour when fixing it costs the most.
 *
 * Neither of the two is made a failure: in the middle of the work part of the tests already exist,
 * and the work itself lawfully runs for weeks — a red audit would refuse the push of every branch,
 * including the one that is finishing the agreement.
 */
import { execFileSync } from 'node:child_process';

import { ROOT } from './rt-kit-checks.config.mjs';
import { SPECS_DIR } from './spec-common.mjs';

/** After how many days without edits a product agreement counts as stale. */
const STALE_PROPOSED_DAYS = 30;

/** A day in milliseconds — age is easier to count in them. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The directories of product agreements with the count of their scenarios.
 *
 * Ready is the one whose scenarios are all closed by tests: while at least one is marked "not
 * covered", the feature is not finished.
 */
export function proposedGroups(scenarios, references) {
    const proposed = new Map();

    for (const scenario of scenarios) {
        const at = scenario.file.indexOf('/proposed/');

        if (at === -1) {
            continue;
        }

        const dir = scenario.file.slice(0, scenario.file.indexOf('/', at + '/proposed/'.length));
        const group = proposed.get(dir) ?? { total: 0, ready: 0 };
        group.total += 1;

        if (references.has(scenario.id) && !scenario.uncovered && !scenario.partial) {
            group.ready += 1;
        }

        proposed.set(dir, group);
    }

    return proposed;
}

/**
 * The date of the last commit for every product agreement directory.
 *
 * One pass over the history instead of a call per directory: the history goes newest first, so the
 * first date met for a directory is its last one. A directory not yet in the history arrived by
 * this very branch and cannot be old.
 *
 * Age is measured by the history, not by the file time on disk: a fresh checkout makes all the
 * directories simultaneous, and there is no day in the text of the agreement at all. The same
 * reason stands behind the age of archive records.
 */
function lastCommits(dirs) {
    if (dirs.length === 0) {
        return new Map();
    }

    let log;

    try {
        log = execFileSync('git', ['log', '--format=%cI', '--name-only', '--', SPECS_DIR], {
            cwd: ROOT,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
        });
    } catch {
        return new Map();
    }

    const dates = new Map();
    let current = null;

    for (const line of log.split('\n')) {
        if (line === '') {
            continue;
        }

        const dir = dirs.find((candidate) => line.startsWith(`${candidate}/`));

        if (dir === undefined) {
            current = line.includes('/') ? current : line;
            continue;
        }

        if (current !== null && !dates.has(dir)) {
            dates.set(dir, current);
        }
    }

    return dates;
}

/**
 * Product agreements lying without edits longer than the term: the path and the age in days,
 * the oldest first.
 */
export function staleProposed(dirs, now = Date.now()) {
    const dates = lastCommits(dirs);

    return dirs
        .map((dir) => {
            const committed = dates.get(dir);
            const ageDays = committed === undefined ? 0 : (now - new Date(committed).getTime()) / DAY_MS;

            return { dir, ageDays };
        })
        .filter((record) => record.ageDays > STALE_PROPOSED_DAYS)
        .sort((one, other) => other.ageDays - one.ageDays);
}
