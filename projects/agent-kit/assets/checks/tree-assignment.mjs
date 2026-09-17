/**
 * The epic assigned to this working copy.
 *
 * A machine holds several working copies of one tree, and a session in each of them asks the same
 * question — which work is mine. The queue answers only what is open: it holds no owner of a card,
 * and by topic one epic cannot be told from another. So the assignment is declared apart, and it
 * is read from here by everyone who needs it — the startup hook, the delivery guard, the audit.
 *
 * Two files, and they lie apart. The assignment belongs to the working copy and is declared in the
 * main branch — a record written into the branch of a task is in force only there. The name of the
 * copy is the state of the machine: the path to it belongs in nobody's history, so the copy names
 * itself by a short word in a file outside the index.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** The name this working copy calls itself by, or `null` where it names itself in no way. */
export function treeName(root = ROOT) {
    const path = join(root, CONFIG.treeNameFile || '');

    if (!CONFIG.treeNameFile || !existsSync(path)) {
        return null;
    }

    const said = readFileSync(path, 'utf8').trim();

    return said === '' ? null : said.split('\n')[0].trim();
}

/**
 * The rows of the assignment table: the name of the copy, the epic, the plan of works and the day
 * the assignment was given.
 *
 * The table is read by the shape of its row, not by the header: a header is translated, reordered
 * and renamed, and every such edit would silently empty the answer. A row that does not hold a
 * task key with a number is not an assignment — the heading row of the table and the line of dashes
 * under it look exactly like a row to any reader that counts cells.
 *
 * A row whose epic cell holds a dash is a row all the same, and its epic is empty: «no work has
 * been assigned to this copy» and «this copy is not in the table» are two different states, and
 * whoever reads them needs to tell one from the other — the first is the owner's answer, the
 * second is their silence.
 */
export function assignments(root = ROOT) {
    const path = join(root, CONFIG.assignmentsFile || '');

    if (!CONFIG.assignmentsFile || !existsSync(path)) {
        return [];
    }

    const key = CONFIG.board?.taskKey ?? '';
    const epicRe = new RegExp(`^(?:#|${key}-)?(\\d+)$`);
    const DASH = /^[-—–]$/;

    return readFileSync(path, 'utf8')
        .split('\n')
        .filter((line) => line.trim().startsWith('|'))
        .map((line) =>
            line
                .trim()
                .replace(/^\||\|$/g, '')
                .split('|')
                .map((cell) => cell.trim().replace(/^`|`$/g, ''))
        )
        .filter((cells) => cells.length >= 2 && (epicRe.test(cells[1]) || DASH.test(cells[1])))
        .map((cells) => ({
            tree: cells[0],
            epic: epicRe.test(cells[1]) ? Number(cells[1].match(epicRe)[1]) : null,
            plan: cells[2] ?? '',
            given: cells[3] ?? '',
        }));
}

/** The assignment of this working copy, or `null` where the table names no such copy. */
export function assignmentOf(root = ROOT) {
    const name = treeName(root);

    return name === null ? null : (assignments(root).find((row) => row.tree === name) ?? null);
}

/**
 * Called by hand and by the startup hook: it says what this copy answers for. The word about the
 * absence is printed just as loudly as the assignment itself — a copy without a row is exactly the
 * case in which work gets taken by guesswork.
 */
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
    const name = treeName();
    const row = assignmentOf();

    if (!CONFIG.assignmentsFile) {
        console.log('tree-assignment: the tree declares no assignments — the key `assignmentsFile` is empty');
    } else if (name === null) {
        console.log(`tree-assignment: this working copy names itself in no way — write its short name into ${CONFIG.treeNameFile}`);
    } else if (row === null) {
        console.log(`tree-assignment: «${name}» — the table ${CONFIG.assignmentsFile} holds no row for this copy. Ask the owner about it; work is not taken by guesswork`);
    } else if (row.epic === null) {
        console.log(`tree-assignment: «${name}» — no epic is assigned to this copy. Ask the owner about it; work is not taken by guesswork`);
    } else {
        console.log(`tree-assignment: «${name}» — epic ${CONFIG.board?.taskKey ?? ''}-${row.epic}, the plan of works ${row.plan}, given ${row.given}`);
    }
}
