#!/usr/bin/env node
/**
 * The only task of a grill: work outside an epic by the count the grill names, not by a word of the
 * owner about that work.
 *
 * The creating command asks `singleFault` before the card: a refusal after it leaves a card nobody but
 * an administrator takes off the board. A card that already stands gets the line by a call of its own:
 *
 *   node tools/task-new-single.mjs <number> --slug <slug>
 *
 * The count is read by the same function the engine reads it by, and the line of the body by the one
 * the audit reads it by: a second reading would let a task through one door and hold it at the other.
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SINGLE_WORDS, declaredEpicOf, outsideReasonOf } from './board-epic-link.mjs';
import { OWNER, REPO, TASK_KEY, botToken, gh, ghJson } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';
import { assignmentOf } from './tree-assignment.mjs';

const EPIC_LABEL = CONFIG.board?.epicLabel ?? '';
const MAIN = CONFIG.deploy?.mainBranch || 'main';
const TASKS = 'docs/tasks';

/** The line of the body by which the card stands outside an epic. */
const SINGLE_LINE = `Работа вне эпика — ${SINGLE_WORDS}`;

// The reading of the grill lies with the engine: next to it where it is laid out, one level up in the package.
const HERE = dirname(fileURLToPath(import.meta.url));
const TEXT = [join(HERE, 'task-flow/measure/text.mjs'), join(HERE, '../task-flow/measure/text.mjs')].find((path) => existsSync(path));

const carriesEpicLabel = (card) => EPIC_LABEL !== '' && (card.labels ?? []).some((label) => label.name === EPIC_LABEL);

/** What is wrong with the grill in the first of the folders that stands, or null where it names one task. */
async function grillFault(folders) {
    if (!TEXT) {
        return `the engine source task-flow/measure/text.mjs is not laid out next to ${HERE}`;
    }
    const { grillAnswered, tasksOfGrill } = await import(pathToFileURL(TEXT).href);
    const folder = folders.find((name) => existsSync(join(ROOT, TASKS, name, 'grill.md')));
    if (folder === undefined) {
        const looked = folders.map((name) => `${TASKS}/${name}/grill.md`).join(', ');
        return `there is no grill: ${looked}. The count of tasks is read from it, so it comes before the task`;
    }
    const where = `${TASKS}/${folder}/grill.md`;
    const text = readFileSync(join(ROOT, where), 'utf8');
    if (!grillAnswered(text)) {
        return `${where} is not answered: the request of the owner as a quote and at least one answer come before the task`;
    }
    const { count, why } = tasksOfGrill(text);
    if (count === undefined) {
        return `${where}: ${why}. The line stands once and holds the number`;
    }
    if (count > 1) {
        return `${where} says «**Задач в разборе:** ${count}»: a grill of several tasks is an epic, declared by --epic, and its tasks go under it`;
    }
    return null;
}

/** The epic of this copy, where its card is open and labelled as one; a row naming the task itself is not an epic. */
function liveCopyEpic(number, token) {
    const epic = assignmentOf(ROOT)?.epic ?? null;
    if (epic === null || epic === number) {
        return null;
    }
    const card = ghJson(['issue', 'view', String(epic), '--json', 'state,labels'], { token });
    return card.state === 'OPEN' && carriesEpicLabel(card) ? epic : null;
}

/** Why the task is not the only task of its grill; null where it is. The body is asked after the grill. */
export async function singleFault({ folders, body, number = null, token }) {
    const grill = await grillFault(folders);
    if (grill !== null) {
        return grill;
    }
    const named = declaredEpicOf(body());
    if (named !== undefined) {
        return `the body already names the epic #${named}: a task of an epic is not the only task of a grill`;
    }
    const epic = liveCopyEpic(number, token);
    if (epic !== null) {
        const outside = '--outside-epic "<the reason of the owner>"';
        return `this copy leads the open epic ${TASK_KEY}-${epic}: the task goes under it by --epic-of ${epic}, or outside it by ${outside}`;
    }
    return null;
}

/** The body with the line; a body that already stands outside an epic is returned as it is. */
export function withSingleLine(body) {
    return outsideReasonOf(body) === null ? [body.trimEnd(), SINGLE_LINE].filter((part) => part !== '').join('\n\n') : body;
}

/** Writes the line into a card that already stands. Answers the text of the refusal, or null. */
async function writeLine(number, slug) {
    const token = botToken() ?? undefined;
    const branch = `${TASK_KEY}-${number}-${slug}`;
    let card = null;
    const cardOf = () => (card ??= ghJson(['issue', 'view', String(number), '--json', 'body,labels'], { token }));
    const fault = await singleFault({ folders: [branch, `_draft-${slug}`], body: () => cardOf().body ?? '', number, token });
    if (fault !== null) {
        return fault;
    }
    if (carriesEpicLabel(cardOf())) {
        return `#${number} is an epic, and the line is of a task`;
    }
    const before = cardOf().body ?? '';
    const after = withSingleLine(before);
    if (after === before) {
        console.log(`#${number} already stands outside an epic: «${outsideReasonOf(before)}»`);
    } else {
        gh(['api', '-X', 'PATCH', `repos/${OWNER}/${REPO}/issues/${number}`, '-f', `body=${after}`], { token });
        console.log(`#${number}: the card got the line «${SINGLE_LINE}»`);
    }
    const draft = !existsSync(join(ROOT, TASKS, branch));
    console.log(`The branch is created by a separate call:\n  git checkout -b ${branch} origin/${MAIN}`);
    console.log(draft ? `The task folder is a draft yet: ${TASKS}/_draft-${slug}/ is renamed to ${TASKS}/${branch}/` : `The task folder: ${TASKS}/${branch}/`);
    return null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
    const [number, flag, slug, ...rest] = process.argv.slice(2);
    const shaped = /^\d+$/.test(number ?? '') && flag === '--slug' && /^[a-z0-9][a-z0-9-]*$/.test(slug ?? '') && rest.length === 0;
    const said = (error) => String(error.message ?? error);
    const fault = shaped ? await writeLine(Number(number), slug).catch(said) : 'node tools/task-new-single.mjs <number> --slug <slug>';
    if (fault !== null) {
        console.error(`task-new: ${fault}`);
        process.exit(1);
    }
}
