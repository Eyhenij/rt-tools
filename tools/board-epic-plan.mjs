// rt-kit v0.28.0 · checks/board-epic-plan.github.mjs · aa748849efdd · правится надстройкой, не здесь
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
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
 * The plan of an epic named by its own card, and the reason there is none.
 *
 * The plan is the document that carries the makeup, not the first path in the body. A card names
 * its decision next to its plan, and the decision has no table of tasks: read as the plan, it made
 * the makeup empty and every open task of the epic read as not belonging to it — fourteen false
 * lines at once, and the true ones drowned among them.
 */
export function planPathOf(body, { makeupRequired = true } = {}) {
    const named = [...String(body ?? '').matchAll(PATH_IN_BODY)].map((match) => match[1]);
    if (named.length === 0) {
        return { path: null, why: 'the epic card names no path to the plan — there is nowhere to read what the epic holds' };
    }

    const onDisk = named.filter((path) => existsSync(join(ROOT, path)));
    if (onDisk.length === 0) {
        return { path: null, why: `the epic plan «${named[0]}» is not on disk — the card points into emptiness` };
    }

    const carrying = onDisk.find((path) => planRows(readFileSync(join(ROOT, path), 'utf8')) !== '') ?? null;
    if (carrying !== null) {
        return { path: carrying, why: '' };
    }

    // The makeup is not demanded of the creating command: it creates the tasks of an epic, and the
    // numbers land in the plan by the same edit — that is, after. Demanded here, the requirement
    // would refuse the very first task of every epic, and there would be no way to create one at
    // all. The audit runs later and demands it: by its minute the numbers stand in the plan.
    if (!makeupRequired) {
        return { path: onDisk[0], why: '' };
    }

    return {
        path: null,
        why: `none of the documents the card names carries the makeup of the epic — «${onDisk.join('», «')}». The makeup is a table with a task column`,
    };
}
