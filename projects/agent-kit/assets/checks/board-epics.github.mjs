/**
 * The link between a task and an epic. Lives in a file of its own: the work queue audit stands at
 * the length limit even without it, and these two checks are read separately.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * The label of an epic card. Not named — the link is not judged: there would be nothing left to
 * tell an epic card from an ordinary task by.
 */
const EPIC_LABEL = CONFIG.board?.epicLabel ?? '';

/**
 * The rows of the epic makeup — those standing in the table with the task column.
 *
 * The epic plan holds other tables too: the sources of findings, the makeup of families, the count
 * of items. Numbers taken from the whole text, and even from all the tables, would make an epic
 * task out of everything it mentioned — the previous epic its findings grew from, a review, a task
 * of a neighbouring tree.
 */
function planRows(plan) {
    const rows = [];
    let inside = false;
    for (const line of plan.split('\n')) {
        const isRow = line.trimStart().startsWith('|');
        if (!isRow) {
            inside = false;
            continue;
        }
        if (!inside) {
            // A word boundary is no good here: `\b` knows only Latin letters and never matches
            // Cyrillic — the check would stay silent on any plan.
            inside = /\|[^|]*Задача/.test(line);
            continue;
        }
        rows.push(line);
    }
    return rows.join('\n');
}

/**
 * The link between a task and an epic, read in both directions.
 *
 * A task created under an epic names it in its body, and the epic plan names the task from its own
 * side. A one-sided binding looks whole exactly as a two-sided one does: the reader comes now from
 * the epic plan, now from its card, and the second side exists only for one of them. It held by
 * imitation — while a body was written from the sample of a neighbouring task of the same epic, the
 * line travelled with the shape, and a task created in the middle of work out of a finding was not
 * written from a sample.
 *
 * The path to the plan is taken from the body of the epic card: it has to name it anyway, and a
 * directory setting would create a second source of truth. A path counts as a spelling with a
 * directory — a bare file name in the body occurs in prose and would lead the check to the very
 * first mention. A plan absent from disk is a discrepancy of its own: the card points into
 * emptiness.
 *
 * Only what is open is judged, as in the rest of the audit: a closed task of an epic is history,
 * and there is nothing to close a line about it with.
 */
export function checkEpicLinks(open, report) {
    // The label is not named — there is nothing to tell an epic card from an ordinary task by, and
    // the check stays silent. Silent exactly so, not "there are no epics": a tree without epics and
    // a tree that has not named the label are indistinguishable here.
    if (!EPIC_LABEL) {
        return;
    }

    const byNumber = new Map(open.map((issue) => [issue.number, issue]));
    const epics = open.filter((issue) => (issue.labels ?? []).some((label) => label.name === EPIC_LABEL));
    const listedBy = new Map();
    // Epics whose makeup could not be read. Their tasks are not judged from the other side: an
    // unread plan has already been reported by a line of its own, and four lines "the task is not in
    // the plan" beside it speak of the same miss again, naming other tasks as guilty.
    const unreadable = new Set();

    for (const epic of epics) {
        const planPath = String(epic.body ?? '').match(/(?:^|[\s(`])([\w.-]+(?:\/[\w.-]+)+\.md)/)?.[1] ?? null;
        if (planPath === null) {
            report(`#${epic.number}: карточка эпика не называет путь к замыслу — состав эпика читать негде`);
            unreadable.add(epic.number);
            continue;
        }
        if (!existsSync(join(ROOT, planPath))) {
            report(`#${epic.number}: замысла эпика «${planPath}» нет на диске — карточка ссылается в пустоту`);
            unreadable.add(epic.number);
            continue;
        }

        const plan = readFileSync(join(ROOT, planPath), 'utf8');
        const mentions = planRows(plan).matchAll(new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`, 'g'));
        const numbers = new Set([...mentions].map((match) => Number(match[1])));
        for (const number of numbers) {
            if (number === epic.number || !byNumber.has(number)) {
                continue;
            }
            listedBy.set(number, epic.number);
            const body = String(byNumber.get(number).body ?? '');
            if (!new RegExp(`(?:#|${TASK_KEY}-)${epic.number}\\b`).test(body)) {
                report(
                    `#${number}: замысел эпика #${epic.number} задачу называет, а её тело эпика — нет. Допиши строку «Задача эпика #${epic.number}, замысел — ${planPath}»`
                );
            }
        }
    }

    // The other side: the body named the epic, and the epic plan does not know this task. It reads
    // as a task under an epic, but "take the next one" will never hand it out.
    const epicNumbers = new Set(epics.map((issue) => issue.number));
    for (const issue of open) {
        if (epicNumbers.has(issue.number)) {
            continue;
        }
        const named = String(issue.body ?? '').match(new RegExp(`эпика?\\s+(?:#|${TASK_KEY}-)(\\d+)`, 'i'))?.[1];
        if (named === undefined || !epicNumbers.has(Number(named)) || unreadable.has(Number(named))) {
            continue;
        }
        if (listedBy.get(issue.number) !== Number(named)) {
            report(`#${issue.number}: тело называет эпик #${named}, а в его замысле задачи нет — «взять следующую» её не отдаст`);
        }
    }
}
