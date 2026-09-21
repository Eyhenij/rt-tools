// rt-kit v0.29.0 · checks/board-epic-plan.github.mjs · ee3c95a4ea19 · правится надстройкой, не здесь
/**
 * The plan of an epic named by its own card: which of the paths in the body is the plan.
 *
 * A file of its own because two readers need it at once — the queue audit and the creating command
 * — and they lie in different layers. Read in two places, the choice diverges silently: the audit
 * takes the document that carries the makeup, while the command took the first path in the body,
 * and a card that names a law before its plan then wrote the law into every task of the epic as its
 * plan. Both sides answered as usual, and the miss showed only from a third side — by reading a
 * created task.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TASK_KEY } from './board.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

/** A path counts as a spelling with a directory: a bare file name occurs in the body in prose. */
const PATH_IN_BODY = /(?:^|[\s(`])([\w.-]+(?:\/[\w.-]+)+\.md)/g;

/**
 * The rows of the epic makeup — those standing in the table with the task column.
 *
 * The epic plan holds other tables too: the sources of findings, the makeup of families, the count
 * of items. Numbers taken from the whole text, and even from all the tables, would make an epic
 * task out of everything it mentioned — the previous epic its findings grew from, a review, a task
 * of a neighbouring tree.
 */
export function planRows(plan) {
    const rows = [];
    let inside = false;
    for (const line of plan.split('\n')) {
        const isRow = line.trimStart().startsWith('|');
        if (!isRow) {
            inside = false;
            continue;
        }
        if (!inside) {
            // The column has two names, English and the owner's: a tree translates its plans one at
            // a time, and one name would take the untranslated epics out of the check silently. A
            // word boundary is no good here either: `\b` knows only Latin letters and never matches
            // Cyrillic — the check would stay silent on any plan.
            inside = /\|[^|]*(?:Task|Задача)/.test(line);
            continue;
        }
        rows.push(line);
    }

    return rows.join('\n');
}

/**
 * The task column of the makeup, cell by cell: the numbers of the tasks live there and nowhere else.
 *
 * The state column names the request the task was merged by, and a number read from the whole row
 * turns that request into a task of the epic: the audit then says the plan names tasks that are no
 * sub-issues of the card, and points at requests. The column is the one by which a row counts as a
 * makeup row at all — the one whose header carries the word for a task.
 */
export function planTaskCells(plan) {
    const cells = [];
    let column = -1;
    for (const line of String(plan ?? '').split('\n')) {
        const row = line.trimStart();
        if (!row.startsWith('|')) {
            column = -1;
            continue;
        }

        const parts = row.split('|').slice(1, -1);
        if (column === -1) {
            column = parts.findIndex((part) => /(?:Task|Задача)/.test(part));
            continue;
        }
        if (column >= 0 && parts.length > column) {
            cells.push(parts[column]);
        }
    }

    return cells;
}

/**
 * The plan of an epic named by its own card, and the reason there is none.
 *
 * The plan is the document that carries the makeup, not the first path in the body. A card names
 * its decision next to its plan, and the decision has no table of tasks: read as the plan, it made
 * the makeup empty and every open task of the epic read as not belonging to it — fourteen false
 * lines at once, and the true ones drowned among them.
 */
export function planPathOf(body, { makeupRequired = true, epicNumber = null } = {}) {
    const named = [...String(body ?? '').matchAll(PATH_IN_BODY)].map((match) => match[1]);
    if (named.length === 0) {
        return { path: null, text: null, why: 'the epic card names no path to the plan — there is nowhere to read what the epic holds' };
    }

    const read = named.map((path) => ({ path, text: planTextOf(path, epicNumber) })).filter((one) => one.text !== null);
    if (read.length === 0) {
        return { path: null, text: null, why: `the epic plan «${named[0]}» is not on disk — the card points into emptiness` };
    }

    const carrying = read.find((one) => planRows(one.text) !== '') ?? null;
    if (carrying !== null) {
        return { path: carrying.path, text: carrying.text, why: '' };
    }

    // The makeup is not demanded of the creating command: it creates the tasks of an epic, and the
    // numbers land in the plan by the same edit — that is, after. Demanded here, the requirement
    // would refuse the very first task of every epic, and there would be no way to create one at
    // all. The audit runs later and demands it: by its minute the numbers stand in the plan.
    if (!makeupRequired) {
        return { path: read[0].path, text: read[0].text, why: '' };
    }

    return {
        path: null,
        text: null,
        why: `none of the documents the card names carries the makeup of the epic — «${read.map((one) => one.path).join('», «')}». The makeup is a table with a task column`,
    };
}

/**
 * The branches of an epic by its number — its own and those of the remotes.
 *
 * The name of an epic branch is the same pair the tree writes everywhere else: the key, the number,
 * a slug. A tree without a key names no branches this way, and the search then gives nothing rather
 * than every branch at once.
 */
function epicBranches(epicNumber) {
    if (!TASK_KEY || epicNumber === null || epicNumber === undefined) {
        return [];
    }

    try {
        const refs = execFileSync(
            'git',
            [
                'for-each-ref',
                '--format=%(refname:short)',
                `refs/heads/${TASK_KEY}-${epicNumber}-*`,
                `refs/remotes/*/${TASK_KEY}-${epicNumber}-*`,
            ],
            { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        );

        return refs.split('\n').map((one) => one.trim()).filter((one) => one !== '');
    } catch {
        return [];
    }
}

/**
 * The text of a plan: off the disk, and where the disk does not carry it — out of the branch of the
 * epic. Empty when neither has it.
 *
 * A plan lives in the branch of its epic until the epic is merged whole, and the working tree stands
 * on whichever branch the session happens to be on. Read off the disk alone, every live epic came
 * back as a card pointing into emptiness, and the true divergences drowned among those lines. The
 * reading stays without the network — the branch folders check makes the same move.
 */
export function planTextOf(path, epicNumber = null) {
    for (const branch of epicBranches(epicNumber)) {
        // The disk is no older exactly when the current branch has absorbed the tip of the epic
        // branch. Taken the other way round, the audit reads the copy of the main branch — older by
        // a whole epic — and says the plan does not carry tasks that stand in it.
        if (absorbed(branch)) {
            continue;
        }

        try {
            return execFileSync('git', ['show', `${branch}:${path}`], {
                cwd: ROOT,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            });
        } catch {
            // A branch that does not carry the plan says nothing about it: the rest are still read.
        }
    }

    const onDisk = join(ROOT, path);

    return existsSync(onDisk) ? readFileSync(onDisk, 'utf8') : null;
}

/**
 * Has the current branch absorbed the tip of that one. Asked of version control, not guessed: on the
 * branch of the epic itself and on the branches of its tasks the disk carries the same plan or a
 * newer one, and there is nothing to read out of the branch.
 *
 * FAIL-OPEN towards the branch: a repository that cannot answer reads as not absorbed, and the plan
 * is then taken out of the branch — the answer the audit needs more often.
 */
function absorbed(branch) {
    try {
        execFileSync('git', ['merge-base', '--is-ancestor', branch, 'HEAD'], {
            cwd: ROOT,
            stdio: ['ignore', 'ignore', 'ignore'],
        });

        return true;
    } catch {
        return false;
    }
}
