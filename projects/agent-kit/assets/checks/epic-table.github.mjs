#!/usr/bin/env node
// rt-kit v0.26.0 · checks/epic-table.github.mjs · ca65adf7e1b9 · правится надстройкой, не здесь
/**
 * The table of the epic's tasks: the order from the plan, the state from the hosting.
 *
 * The shape of the answer to the question "where is the work" is written down — the rule of the
 * status report and the pattern next to it — and the table itself was assembled by the session: it
 * remembered which calls to make and how to fold the answers into cells. A session that has just
 * started remembers none of that, and two sessions fold the same answers differently: one names the
 * run on the head, another the last run of the branch.
 *
 *   node tools/epic-table.mjs        # the epic of the current branch
 *   node tools/epic-table.mjs 1940   # the epic named by its number
 *
 * The answer goes to the standard output and is carried to the owner as it is. A non-zero code
 * means the table was not assembled, and then no table is printed at all: an empty one reads as an
 * empty epic.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { OfflineError, TASK_KEY, botToken, fetchBoard, fetchOpenPulls, ghJson, numberFromBranch, numberFromTitle } from './board.mjs';
import { declaredEpicOf, planPathOf, planRows } from './board-epics.mjs';
import { verdictOnHead } from './board-runs.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

/** The machine account's token is substituted per call, as everywhere in the work with the queue. */
const OPTIONS = { token: botToken() };

/** How the outcome of the run is named in the cell: the word of the hosting says nothing to the owner. */
const VERDICT = {
    success: 'зелёный',
    failure: 'красный',
    running: 'идёт',
    none: 'не начинался',
};

/** The current branch: the task number is read from it when the epic is not named by an argument. */
function branchOf() {
    try {
        return execFileSync('git', ['branch', '--show-current'], { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch {
        return '';
    }
}

/**
 * A card with its body: the belonging to an epic and the path to the plan are declared exactly
 * there, and the reading of the queue takes the body of the task apart, not its title.
 */
function issueOf(number) {
    try {
        return ghJson(['issue', 'view', String(number), '--json', 'number,title,state,body,labels'], OPTIONS);
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }
        return null;
    }
}

/**
 * Which epic is asked about: the argument names it, and without an argument it is taken from the
 * current branch — the branch gives the task, the body of the task declares the epic.
 */
function epicAsked(argv) {
    const named = argv.map((one) => one.replace(/^#/, '')).find((one) => /^\d+$/.test(one));
    if (named !== undefined) {
        return { number: Number(named), why: '' };
    }

    const branch = branchOf();
    const number = numberFromBranch(branch);
    if (number === null) {
        return { number: null, why: `ветка «${branch}» не несёт номера задачи — назовите эпик доводом: node tools/epic-table.mjs <номер>` };
    }

    const issue = issueOf(number);
    if (!issue) {
        return { number: null, why: `у хостинга нет задачи #${number} — назовите эпик доводом` };
    }

    const declared = declaredEpicOf(String(issue.body ?? ''));
    if (declared === undefined) {
        return {
            number: null,
            why: `задача #${number} не объявляет эпика — в теле задачи под эпиком стоит строка «Задача эпика #<номер>»`,
        };
    }

    return { number: Number(declared), why: '' };
}

/** The makeup of the epic: the ordinal, the number of the task and what it is about, in the order of the plan. */
function makeupOf(plan) {
    const key = new RegExp(`(?:#|${TASK_KEY}-)(\\d+)`);
    const rows = [];
    for (const line of planRows(plan).split('\n')) {
        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
        if (cells.length < 2 || cells.every((cell) => /^:?-+:?$/.test(cell))) {
            continue;
        }

        const found = cells.map((cell) => key.exec(cell)).find(Boolean);
        if (found) {
            rows.push({ order: cells[0], number: Number(found[1]), about: cells[cells.length - 1] });
        }
    }
    return rows;
}

/** The name of a task without the key in front: the key stands in a column of its own. */
function nameOf(title) {
    return String(title ?? '').replace(new RegExp(`^\\[${TASK_KEY}-\\d+\\]\\s*`), '');
}

/**
 * One row of the table filled from the hosting: the name of the task and the state cell.
 *
 * The run is asked by the head of the request, not by the branch: the list of the runs of a branch
 * answers about the last commit that started one, and a green run of a commit gone by then reads as
 * a green head.
 */
function rowOf(number, board, pulls) {
    const issue = issueOf(number);
    if (!issue) {
        return { name: '—', state: 'не заведена' };
    }

    const name = nameOf(issue.title);
    if (issue.state !== 'OPEN') {
        return { name, state: 'влито' };
    }

    const pull = pulls.find((one) => numberFromTitle(String(one.title ?? '')) === number);
    if (!pull) {
        const column = board.items.get(number)?.status ?? null;
        return { name, state: column ? `в очереди, столбец «${column}»` : 'заведена, столбца нет' };
    }

    const verdict = verdictOnHead(pull.headRefOid, OPTIONS);
    const draft = pull.isDraft === true ? 'черновик' : 'готова к слиянию';
    return { name, state: `заявка #${pull.number} ${draft}, прогон на вершине ${VERDICT[verdict] ?? verdict}` };
}

/**
 * Why the epic exists, in one sentence — the first phrase of the section the plan opens with.
 *
 * A plan whose first section is worded otherwise loses the phrase, and the paragraph then names
 * only the count of the tasks: that is the open question `Q-WC-9` of the subdomain.
 */
function whyOf(plan) {
    const section = /^##\s+Зачем\s*$/m.exec(plan);
    if (!section) {
        return '';
    }

    const rest =
        plan
            .slice(section.index + section[0].length)
            .split(/\n\s*\n/)
            .find((piece) => piece.trim() !== '') ?? '';
    const sentence = rest.trim().replace(/\s+/g, ' ');
    const end = sentence.indexOf('. ');
    return end === -1 ? sentence : sentence.slice(0, end + 1);
}

/** The paragraph above the table: an epic squeezed into columns loses what it is named for. */
function paragraphOf(epic, plan, rows) {
    const running = rows.findIndex((row) => row.state !== 'влито');
    const where = running === -1 ? 'все закрыты' : `идёт ${running + 1}`;
    const why = whyOf(plan);
    const tail = why === '' ? '' : ` — ${why}`;
    return `**Эпик «${nameOf(epic.title)}» (${TASK_KEY}-${epic.number})**${tail} Задач ${rows.length}, ${where}.`;
}

/** The table itself: the ordinal, the name, the key, what it is about, the state. */
function tableOf(rows) {
    const head = ['| № | Задача | Номер | О чём | Состояние |', '| --- | --- | --- | --- | --- |'];
    const body = rows.map((row) => `| ${row.order} | ${row.name} | ${TASK_KEY}-${row.number} | ${row.about} | ${row.state} |`);
    return [...head, ...body];
}

/** The lines of the answer, or the refusal with the reason: the caller prints and ends. */
export function epicTable(argv) {
    const asked = epicAsked(argv);
    if (asked.number === null) {
        return { ok: false, lines: [asked.why] };
    }

    const epic = issueOf(asked.number);
    if (!epic) {
        return { ok: false, lines: [`у хостинга нет карточки эпика #${asked.number}`] };
    }

    const found = planPathOf(epic.body);
    if (found.path === null) {
        return { ok: false, lines: [`карточка эпика #${asked.number}: ${found.why}`] };
    }

    const plan = readFileSync(join(ROOT, found.path), 'utf8');
    const rows = makeupOf(plan);
    if (rows.length === 0) {
        return { ok: false, lines: [`замысел «${found.path}» не несёт состава эпика: состав — таблица со столбцом задач`] };
    }

    const board = fetchBoard(OPTIONS);
    const pulls = fetchOpenPulls(OPTIONS);
    const filled = rows.map((row) => ({ ...row, ...rowOf(row.number, board, pulls) }));
    return { ok: true, lines: [paragraphOf(epic, plan, filled), '', ...tableOf(filled)] };
}

const isEntryPoint = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isEntryPoint) {
    let outcome;
    try {
        outcome = epicTable(process.argv.slice(2));
    } catch (error) {
        const why = error instanceof OfflineError ? error.message : String(error?.message ?? error);
        outcome = { ok: false, lines: [`состояние спросить нечем: ${why}`, 'таблица не печатается: пустая читается как пустой эпик'] };
    }
    process.stdout.write(`${outcome.lines.join('\n')}\n`);
    process.exit(outcome.ok ? 0 : 1);
}
