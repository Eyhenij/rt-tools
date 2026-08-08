#!/usr/bin/env node
/**
 * Заведение задачи, с которой начинается правка.
 *
 * Заведение состоит из четырёх шагов, и правка начинается только после всех
 * четырёх: тикет, номер в его заголовке, добавление на борду, состояние
 * «Backlog». Пока шаги переписывались руками из паттерна, промах на любом из
 * них давал задачу, которой нет в очереди работ: две такие простояли месяц.
 *
 * Ветку команда не заводит — печатает готовую строку. Заведение ветки отдельным
 * вызовом требует гард главной ветки: составную «создать ветку и сразу
 * коммитить» он отклоняет целиком.
 *
 *   npm run task:new -- --title 'Письма владельцу не уходят' --label bug --label area:api
 *   npm run task:new -- --title '…' --slug mail-owner-silence < описание.md
 *
 * Тело читается со стандартного ввода. Автор и исполнитель — учётная запись бота,
 * та же, от которой идут коммиты; `--assignee` перекрывает исполнителя.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
    BACKLOG_OPTION_ID,
    BOT,
    IN_PROGRESS_STATUS,
    OfflineError,
    OWNER,
    PROJECT_ID,
    REPO,
    STATUS_FIELD_ID,
    TASK_KEY,
    TOKEN_PATH,
    botToken,
    gh,
    ghJson,
    graphql,
    numberFromTitle,
} from './board.mjs';

function parseArgs(argv) {
    const args = { labels: [], assignee: BOT, title: null, slug: null };
    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index + 1];
        switch (argv[index]) {
            case '--title':
                args.title = value;
                index += 1;
                break;
            case '--label':
                args.labels.push(value);
                index += 1;
                break;
            case '--assignee':
                args.assignee = value;
                index += 1;
                break;
            case '--slug':
                args.slug = value;
                index += 1;
                break;
            default:
                fail(`неизвестный ключ ${argv[index]}`);
        }
    }
    return args;
}

function fail(message) {
    console.error(`task-new: ${message}`);
    process.exit(1);
}

function readBody() {
    if (process.stdin.isTTY) {
        return '';
    }
    try {
        return readFileSync(0, 'utf8').trim();
    } catch {
        return '';
    }
}

const args = parseArgs(process.argv.slice(2));
if (!args.title) {
    fail("нужен --title '<Что не так>'");
}
if (numberFromTitle(args.title) !== null || args.title.startsWith(`[${TASK_KEY}-`)) {
    fail('номер в заголовок не пишется руками: он известен только после заведения и дописывается сам');
}
if (args.slug !== null && !/^[a-z0-9][a-z0-9-]*$/.test(args.slug)) {
    fail('slug — строчные латинские буквы, цифры и дефисы: имя ветки читают в списке из полусотни строк');
}

const token = botToken();
if (!token) {
    fail(`нет токена бота (${TOKEN_PATH}): задача завелась бы от чужого имени`);
}

let number = null;
try {
    const created = gh(
        [
            'issue',
            'create',
            '--repo',
            `${OWNER}/${REPO}`,
            '--title',
            args.title,
            '--body',
            readBody(),
            '--assignee',
            args.assignee,
            ...args.labels.flatMap((label) => ['--label', label]),
        ],
        { token }
    ).trim();
    number = Number(created.split('/').pop());
    if (!Number.isInteger(number)) {
        fail(`не разобрать номер заведённой задачи в ответе: ${created}`);
    }

    // Номер известен только теперь, поэтому заголовок дописывается вторым вызовом.
    gh(['api', '-X', 'PATCH', `repos/${OWNER}/${REPO}/issues/${number}`, '-f', `title=[${TASK_KEY}-${number}] ${args.title}`], {
        token,
    });

    const issueId = ghJson(['api', `repos/${OWNER}/${REPO}/issues/${number}`, '--jq', '{id:.node_id}'], { token }).id;
    const itemId = graphql(
        `mutation { addProjectV2ItemById(input: {projectId: "${PROJECT_ID}", contentId: "${issueId}"}) { item { id } } }`,
        { token }
    ).data.addProjectV2ItemById.item.id;
    graphql(
        `mutation { updateProjectV2ItemFieldValue(input: {projectId: "${PROJECT_ID}", itemId: "${itemId}", fieldId: "${STATUS_FIELD_ID}", value: {singleSelectOptionId: "${BACKLOG_OPTION_ID}"}}) { projectV2Item { id } } }`,
        { token }
    );
} catch (error) {
    const reason = error instanceof OfflineError ? `нет связи с GitHub: ${error.message}` : String(error.message ?? error);
    if (number === null) {
        fail(reason);
    }
    // Тикет уже есть, а на борде его может не быть — ровно то состояние, из-за которого
    // задачи и терялись. Молчать здесь нельзя: номер печатается, чтобы доделать руками.
    console.error(`task-new: задача #${number} заведена, но доведена не до конца — ${reason}`);
    console.error(`task-new: проверь и доправь — npm run check:board`);
    process.exit(1);
}

const branch = args.slug ? `${TASK_KEY}-${number}-${args.slug}` : `${TASK_KEY}-${number}-<короткий-slug>`;

/**
 * Папка задачи переименовывается здесь, потому что номер и имя ветки в этот момент известны
 * единственный раз за всю работу. Разбор просьбы владельца идёт до заведения задачи — до
 * конца разбора неизвестно даже, сколько задач из него выйдет, — и лежит в
 * `docs/tasks/_draft-<slug>`. Оставленный черновиком, он остаётся вне истории, а следующий
 * заход его не находит: хук запуска ищет папку по имени ветки.
 */
function adoptDraft() {
    if (!args.slug) {
        console.log(`\nПапка задачи: --slug не задан, переименовать черновик нечем.`);
        return;
    }
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const draft = join(root, 'docs/tasks', `_draft-${args.slug}`);
    const target = join(root, 'docs/tasks', branch);

    if (existsSync(target)) {
        console.log(`\nПапка задачи уже на месте: docs/tasks/${branch}/`);
    } else if (existsSync(draft)) {
        renameSync(draft, target);
        console.log(`\nПапка задачи: docs/tasks/_draft-${args.slug}/ → docs/tasks/${branch}/`);
    } else {
        console.log(`\nПапка задачи собирается с образца:\n  cp -r docs/tasks/_template docs/tasks/${branch}`);
        return;
    }

    // Шапку замысла читает гард: по ней он находит договорённость о продукте. Номер в ней
    // проставляется здесь же — руками его переписывают из подсказки и ошибаются.
    const plan = join(target, 'plan.md');
    if (!existsSync(plan)) {
        return;
    }
    const before = readFileSync(plan, 'utf8');
    const after = before.replace(/^\*\*Задача:\*\*.*$/m, `**Задача:** ${TASK_KEY}-${number} · **Ветка:** ${branch}`);
    if (after !== before) {
        writeFileSync(plan, after);
        console.log(`Шапка замысла проставлена: docs/tasks/${branch}/plan.md`);
    }
}

adoptDraft();

console.log(`[${TASK_KEY}-${number}] ${args.title}`);
console.log(`https://github.com/${OWNER}/${REPO}/issues/${number}`);
console.log(`\nВетка заводится отдельным вызовом:\n  git checkout -b ${branch}`);
console.log(`Взятая в работу задача переставляется на борде:\n  npm run task:move -- ${number} ${IN_PROGRESS_STATUS}`);
