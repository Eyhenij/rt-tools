// rt-kit v0.26.0 · checks/board-long-work.github.mjs · fb78baae4ff5 · правится надстройкой, не здесь
/**
 * Work that cannot be closed in one session: the card label against the entry in the work plan.
 *
 * In a file of its own for the same reason as the epic link: the work queue audit stands at the
 * length limit even without them, and these checks are read separately.
 *
 * Such work is marked in two places, and one mark without the other lies silently: the executor
 * opens the card before the work plan, and plans by the plan. A card without an entry promises
 * several sessions the plan does not know about; an entry without a label leaves the card looking
 * like work for one session — and the next session takes it expecting to close it in one go.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * The label of a multi-session card and the directory of work plans. Either of the two not named —
 * the link is not judged at all: there would be nothing to tell a multi-session card from an
 * ordinary one by, and every tree has its own directory of plans.
 */
const LONG_LABEL = CONFIG.longWork?.label ?? '';
const PLANS_DIR = CONFIG.longWork?.plansDir ?? '';

/** Work plan lines carrying the label word: only they count as an entry about several sessions. */
function markedRows() {
    const dir = join(ROOT, PLANS_DIR);
    if (!existsSync(dir)) {
        return null;
    }

    const rows = [];
    for (const name of readdirSync(dir).filter((one) => one.endsWith('.md'))) {
        for (const line of readFileSync(join(dir, name), 'utf8').split('\n')) {
            if (line.includes(LONG_LABEL)) {
                rows.push({ file: name, line });
            }
        }
    }

    return rows;
}

/**
 * The link between the label and the work plan, read in both directions.
 *
 * An entry is a line carrying both the label word and the task number. A bare mention of the number
 * is no good: a work plan names all of its tasks, and most of them take one session — the other
 * side would go red on every one.
 *
 * Only what is open is judged, as in the rest of the audit: a closed task is history, and there is
 * nothing to close a line about it with.
 */
export function checkLongWork(open, report) {
    if (!LONG_LABEL || !PLANS_DIR) {
        return;
    }

    const rows = markedRows();
    if (rows === null) {
        report(`the directory of work plans «${PLANS_DIR}» is not on disk — there is nothing to check multi-session work against`);

        return;
    }

    // The numbers named in the marked lines. Both the task key and the hash are read: a plan is
    // written by a person, and the shape of a number in it differs from line to line.
    const written = new Set();
    const whereWritten = new Map();
    for (const row of rows) {
        for (const match of row.line.matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'))) {
            const number = Number(match[1]);
            written.add(number);
            if (!whereWritten.has(number)) {
                whereWritten.set(number, row.file);
            }
        }
    }

    const labelled = new Set(
        open.filter((issue) => (issue.labels ?? []).some((label) => label.name === LONG_LABEL)).map((issue) => issue.number)
    );

    for (const number of labelled) {
        if (!written.has(number)) {
            report(
                `#${number}: marked as «${LONG_LABEL}», and the work plans «${PLANS_DIR}» carry no such line — the planning goes by the plan, not by the card`
            );
        }
    }

    // The other side: the plan knows the work takes several sessions, while the card looks like
    // work for one — and the next session takes it expecting to close it in one go.
    const byNumber = new Set(open.map((issue) => issue.number));
    for (const number of written) {
        if (byNumber.has(number) && !labelled.has(number)) {
            report(`#${number}: the work plan «${whereWritten.get(number)}» knows it as multi-session, and the card carries no label «${LONG_LABEL}»`);
        }
    }
}
