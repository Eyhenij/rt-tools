// rt-kit v0.29.0 · checks/archive-age.mjs · 1c96094f910e · правится надстройкой, не здесь
/**
 * The age of archive records.
 *
 * The directory gains a record for every closed piece of work and gives nothing back: the task
 * folder is taken apart by the work-closing pattern, and the record from it outlives the whole
 * tree. The term is set by the tree with a settings key; the package gives no default — installing
 * a new version has no right to start removing someone else's archive, and what gets removed there
 * is the grill of the request, kept nowhere else.
 *
 * The selection lives here once for both: the prune command removes by it, the check goes red by
 * the same one. Having drifted apart, they would say different things about the directory, and
 * there is nothing to notice that by — the prune would silently leave what the check silently does
 * not look at.
 *
 * Age is measured by the date of the file's last commit. The file time on disk is no good: a fresh
 * checkout makes all the records simultaneous, and a prune on another machine would remove none.
 * The record header is no good either — the day of the merge does not always stand in it, and not
 * everywhere in the same way.
 *
 * A record not yet in the history counts as today's: it arrived by this very branch and could not
 * have overstayed.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG } from './rt-kit-checks.config.mjs';

/** The archive directory — without a trailing slash: the setting carries it. */
export const ARCHIVE_DIR = CONFIG.archiveDir.replace(/\/$/, '');

/**
 * The retention term of a record in days. `null` — no term is set, and then both sides stay silent:
 * the check does not go red, the prune removes nothing. The tree names its own number by a
 * settings key.
 */
export const RETENTION_DAYS = CONFIG.archiveRetentionDays ?? null;

/**
 * The margin of the check in days over the term.
 *
 * The prune removes at the minute of the push, and the check in the pipeline counts the age at the
 * minute of the run — minutes later, and with a queue on the runner hours later. Age is measured
 * down to the minute, and in that time the next record crosses the threshold: three runs of one
 * session went red that way, none of them by an edit of the branch. So the check demands later than
 * the prune removes; everything it names the prune still removes — the selection is one, the
 * difference is in the margin.
 */
export const CHECK_GRACE_DAYS = 1;

/** A day in milliseconds — age is easier to count in them. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The date of the last commit for every record of the directory.
 *
 * One pass over the history instead of a call per file: on three hundred records that is the
 * difference between a second and half a minute. The history goes newest first, so the first date
 * met for a file is its last one.
 */
function lastCommitDates(root) {
    const log = execFileSync('git', ['log', '--format=%cI', '--name-only', '--', ARCHIVE_DIR], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });

    const dates = new Map();
    let current = null;

    for (const line of log.split('\n')) {
        if (line === '') {
            continue;
        }

        if (line.startsWith(`${ARCHIVE_DIR}/`)) {
            if (current !== null && !dates.has(line)) {
                dates.set(line, current);
            }

            continue;
        }

        current = line;
    }

    return dates;
}

/**
 * The records of the directory with their age in days.
 *
 * @param root The tree root.
 * @param now The reference moment — passed so that the check and the prune judge by one time.
 * @returns Records: the path, the date of the last commit and the age in days.
 */
export function archiveRecords(root, now = new Date()) {
    if (!existsSync(join(root, ARCHIVE_DIR))) {
        return [];
    }

    const dates = lastCommitDates(root);

    return readdirSync(join(root, ARCHIVE_DIR))
        .filter((name) => name.endsWith('.md'))
        .map((name) => {
            const path = `${ARCHIVE_DIR}/${name}`;
            const committed = dates.get(path);
            const ageDays = committed === undefined ? 0 : (now.getTime() - new Date(committed).getTime()) / DAY_MS;

            return { path, name, committed, ageDays };
        })
        .sort((one, other) => other.ageDays - one.ageDays);
}

/**
 * Records that have overstayed the term. No term set — none have overstayed.
 *
 * @param graceDays The margin over the term in days: the prune calls without it, the check with it.
 */
export function staleRecords(root, now = new Date(), graceDays = 0) {
    if (RETENTION_DAYS === null) {
        return [];
    }

    return archiveRecords(root, now).filter((record) => record.ageDays > RETENTION_DAYS + graceDays);
}
