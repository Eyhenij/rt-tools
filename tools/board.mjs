#!/usr/bin/env node
// rt-kit v0.8.3 · checks/board.github.mjs · faeffbbee9b1 · правится надстройкой, не здесь
/**
 * Общая работа с очередью работ: борда проекта, тикеты и их состояние.
 *
 * Один и тот же вопрос — «задача N в порядке?» — задают трое: команда заведения
 * задачи (tools/task-new.mjs), сверка очереди (tools/check-board.mjs) и гард
 * поставки (.claude/hooks/git-guard-delivery.sh). Пока ответ на него был записан
 * готовыми строками в паттерне, каждый из них отвечал по-своему: тикет заводился
 * без добавления на борду, и две задачи так и простояли вне очереди.
 *
 * Борда к репозиторию не привязана — `projectsV2` у него пуст, — поэтому тикет
 * попадает на неё только явным вызовом, а не сам.
 *
 * Гард зовёт этот файл как команду: `node tools/board.mjs task <номер>` печатает
 * состояние задачи одной строкой JSON. Колонку задачи двигает второй режим —
 * `node tools/board.mjs move <номер> <колонка>`, он же `npm run task:move`.
 *
 * Нет сети или нет токена — это не расхождение, а невозможность проверить:
 * функции возвращают `null`, командный режим печатает `{"offline":true}`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * Адрес борды и её колонки живут в `.claude/rt-kit/checks.json`: идентификаторы проекта, поля
 * и вариантов выдаёт сам GitHub при заведении борды, и угадать их нельзя. Пустое значение
 * означает, что дерево борду не завело, — тогда работа с ней отказывается вслух, а не молча
 * правит чужую.
 */
const BOARD = CONFIG.board ?? {};

export const OWNER = BOARD.owner ?? '';
export const REPO = BOARD.repo ?? '';
export const PROJECT_ID = BOARD.projectId ?? '';
/** Поле «Status» борды — колонка, в которой задача стоит сейчас */
export const STATUS_FIELD_ID = BOARD.statusFieldId ?? '';
/**
 * Колонки борды под своими короткими именами. Ход работы читается по ним, а не по
 * тому, есть ли у задачи ветка: ветки на борде не видно вовсе.
 */
export const STATUS_OPTIONS = BOARD.statusOptions ?? {};
/** Колонка вновь заведённой задачи */
export const BACKLOG_OPTION_ID = STATUS_OPTIONS.backlog?.id ?? '';
/** Колонка задачи, взятой в работу, и задачи, PR по которой ждёт разбора */
export const IN_PROGRESS_STATUS = 'in-progress';
export const IN_REVIEW_STATUS = 'in-review';
/** Учётная запись машинной работы — та же, от которой идут коммиты */
export const BOT = BOARD.bot ?? '';
/**
 * Ключ задач: даёт ветку `<КЛЮЧ>-<номер>-<slug>` и заголовок `[<КЛЮЧ>-<номер>]`.
 *
 * Единственное в форме имени, что дерево выбирает само, — и потому единственное, что закон о
 * поставке разрешает настраивать. Назвать его дерево обязано: из пустого ключа собирается
 * `[-317]`, и такой заголовок не совпадает ни с чем. Отказ поимённый, потому что молчание
 * здесь дороже: сверка очереди не падает, а помечает каждую задачу неправильно названной, и
 * настоящее расхождение тонет среди этих строк.
 */
export const TASK_KEY = BOARD.taskKey ?? '';
if (PROJECT_ID && !TASK_KEY) {
    console.error(
        'board: ключ задач не назван — задать его ключом `board.taskKey` в .claude/rt-kit/checks.json.\n' +
            'Из него собираются заголовок задачи `[<КЛЮЧ>-<номер>]` и имя ветки `<КЛЮЧ>-<номер>-<краткое-имя>`.'
    );
    process.exit(1);
}
/** Кого запрашивают на разбор: без ревьювера PR не попадает во входящие владельца. */
export const REVIEWER = BOARD.reviewer ?? '';
const BOT_TOKEN_FILE = BOARD.tokenPath ? BOARD.tokenPath.replace(/^~/, homedir()) : '';

/**
 * `gh` у владельца подменён обёрткой менеджера паролей, и вызов по имени уходит в неё.
 * Поэтому сначала пробуется настоящий исполняемый файл, и только потом имя из PATH.
 */
function ghBinary() {
    if (process.env.GH_BIN) {
        return process.env.GH_BIN;
    }
    const homebrew = '/opt/homebrew/bin/gh';
    return existsSync(homebrew) ? homebrew : 'gh';
}

/**
 * Токен машинной записи лежит вне репозитория и в вывод не попадает. Его отсутствие — не отказ:
 * дерево, не назвавшее токена в `board.tokenPath`, работает с очередью учётной записью, под
 * которой залогинен клиент хостинга.
 */
export function botToken() {
    if (!existsSync(BOT_TOKEN_FILE)) {
        return null;
    }
    const token = readFileSync(BOT_TOKEN_FILE, 'utf8').trim();
    return token.length > 0 ? token : null;
}

export class OfflineError extends Error {}

/**
 * Отказ сети от отказа по существу отличается только текстом: `gh` на оба отвечает
 * ненулевым кодом. Сюда попадает то, после чего проверять нечем, — а не то, что
 * проверено и оказалось не так.
 */
function isOffline(stderr) {
    return /dial tcp|no such host|network is unreachable|timeout|TLS handshake|connection refused|Bad credentials|authentication|not logged/i.test(
        stderr
    );
}

export function gh(args, { token } = {}) {
    const env = { ...process.env };
    if (token) {
        env.GH_TOKEN = token;
    }
    try {
        return execFileSync(ghBinary(), args, { env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
        const stderr = String(error.stderr ?? error.message ?? '');
        if (error.code === 'ENOENT' || isOffline(stderr)) {
            throw new OfflineError(stderr.trim() || 'gh недоступен');
        }
        const failure = new Error(stderr.trim() || `gh ${args[0]} завершился с ошибкой`);
        failure.stderr = stderr;
        throw failure;
    }
}

export function ghJson(args, options) {
    return JSON.parse(gh(args, options));
}

export function graphql(query, options) {
    return ghJson(['api', 'graphql', '-f', `query=${query}`], options);
}

/**
 * Тикеты, стоящие на борде, и элементы борды, тикетами не являющиеся. У каждого тикета —
 * его элемент борды и колонка: переставить задачу можно только по идентификатору элемента,
 * а не по номеру тикета, и берётся он здесь же, чтобы не спрашивать борду дважды.
 */
export function fetchBoard(options) {
    const items = new Map();
    const foreign = [];
    let after = 'null';
    for (;;) {
        const page = graphql(
            `{ node(id: "${PROJECT_ID}") { ... on ProjectV2 { items(first: 100, after: ${after}) {
                pageInfo { hasNextPage endCursor }
                nodes { id
                    status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name optionId } }
                    content { __typename ... on Issue { number } ... on PullRequest { number } ... on DraftIssue { title } } } } } } }`,
            options
        ).data.node.items;
        for (const node of page.nodes) {
            const content = node.content ?? {};
            if (content.__typename === 'Issue') {
                items.set(content.number, { itemId: node.id, status: node.status?.name ?? null });
            } else {
                foreign.push(content.__typename === 'PullRequest' ? `PR #${content.number}` : `черновик «${content.title}»`);
            }
        }
        if (!page.pageInfo.hasNextPage) {
            return { issues: new Set(items.keys()), items, foreign };
        }
        after = `"${page.pageInfo.endCursor}"`;
    }
}

/**
 * Перевод задачи в другую колонку. Состояние задачи на борде — единственное, по чему
 * видно ход работы: ветку и открытый PR борда сама не читает.
 */
export function moveTask(number, status, options) {
    const option = STATUS_OPTIONS[status];
    if (!option) {
        throw new Error(`неизвестная колонка «${status}» — есть ${Object.keys(STATUS_OPTIONS).join(', ')}`);
    }
    const item = fetchBoard(options).items.get(number);
    if (!item) {
        throw new Error(`задачи #${number} нет на борде — заводится она командой npm run task:new`);
    }
    graphql(
        `mutation { updateProjectV2ItemFieldValue(input: {projectId: "${PROJECT_ID}", itemId: "${item.itemId}", fieldId: "${STATUS_FIELD_ID}", value: {singleSelectOptionId: "${option.id}"}}) { projectV2Item { id } } }`,
        options
    );
    return { from: item.status, to: option.name };
}

export function fetchIssues(state, options) {
    return ghJson(['issue', 'list', '--state', state, '--limit', '400', '--json', 'number,title,state,assignees,labels'], options);
}

export function fetchIssue(number, options) {
    try {
        return ghJson(['issue', 'view', String(number), '--json', 'number,title,state,assignees,labels'], options);
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }
        return null;
    }
}

/**
 * Вершина берётся вместе с остальным: спросить её потом значило бы второй вызов на каждый PR,
 * а судят по ней и папку задачи, и прогон.
 */
export function fetchOpenPulls(options) {
    return ghJson(
        ['pr', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,headRefName,headRefOid,isDraft,body'],
        options
    );
}

/**
 * Сколько прогонов завелось на этой вершине.
 *
 * Спрашивается вершина, а не ветка: прогон промежуточного коммита о состоянии вершины не
 * говорит ничего, а список прогонов ветки отдаёт их вперемешку.
 */
export function runsOnHead(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=1`, '--jq', '.total_count'], options);
    return Number(String(answer).trim());
}

/**
 * Чем кончились прогоны на этой вершине: `success`, если все завершились успехом, `running`,
 * если хоть один ещё идёт, `failure` — если хоть один упал. Прогонов нет вовсе — `none`.
 *
 * Цвет спрашивается отдельно от факта: факт отвечает на вопрос «событие дошло», цвет — на
 * вопрос «работу можно отдавать». Второй вопрос задаётся там, где готовое стоит черновиком.
 */
export function verdictOnHead(sha, options) {
    const answer = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=20`,
            '--jq',
            '[.workflow_runs[] | {status, conclusion}] | if length == 0 then "none"' +
                ' elif any(.status != "completed") then "running"' +
                ' elif any(.conclusion != "success") then "failure"' +
                ' else "success" end',
        ],
        options
    );
    return String(answer).trim();
}

/** Когда вершина легла в ветку — по времени коммита у хостинга, а не по местным часам ветки. */
export function headCommittedAt(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/commits/${sha}`, '--jq', '.commit.committer.date'], options);
    return Date.parse(String(answer).trim());
}

/** `[<КЛЮЧ>-<номер>]` в начале заголовка — единственная форма номера в названиях */
export const TITLE_NUMBER = new RegExp(`^\\[${TASK_KEY}-(\\d+)\\]\\s+\\S`);
/** `<КЛЮЧ>-<номер>-<slug>` — имя ветки, отведённой под задачу */
export const BRANCH_NUMBER = new RegExp(`^${TASK_KEY}-(\\d+)-[a-z0-9][a-z0-9-]*$`);

export function numberFromTitle(title) {
    const match = TITLE_NUMBER.exec(title ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * Номер задачи по имени папки. Ключ впереди необязателен: имя ветки вида `chore/312-slug`
 * тоже законно, и папка под ним называется голым числом. Если сверка не распознает в имени
 * номер, папка будет лежать среди текущих сколько угодно — одну такую нашли грепом, а не
 * проверкой.
 */
export function numberFromTaskDir(name) {
    // Ключ подставляем, только если дерево его задало: из пустого получилось бы `^(?:-)?`, и
    // папка с ключом в имени вообще перестала бы распознаваться.
    const prefix = TASK_KEY ? `(?:${TASK_KEY}-)?` : '';
    const match = new RegExp(`^${prefix}(\\d+)-`).exec(name ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * Папки задач, включая вложенные. Путь повторяет имя ветки целиком, вместе с косой, поэтому
 * папка ветки `chore/312-slug` лежит на втором уровне — обход только по верхнему её не видит.
 *
 * Вглубь спускаемся ровно на один уровень: в имени ветки одна косая, а всё, что глубже, папкой
 * задачи уже не будет — зато туда попал бы архив, если дерево держит его внутри.
 */
export function taskDirs(dir = join(ROOT, CONFIG.tasksDir), prefix = '') {
    if (!existsSync(dir)) {
        return [];
    }
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === '_template') {
            continue;
        }
        const name = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.name.startsWith('_draft-') || numberFromTaskDir(entry.name) !== null) {
            found.push(name);
            continue;
        }
        if (!prefix) {
            found.push(...taskDirs(join(dir, entry.name), name));
        }
    }
    return found;
}

export function numberFromBranch(branch) {
    const match = BRANCH_NUMBER.exec(branch ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * Состояние задачи в терминах закона: существует, стоит в очереди работ, у неё есть
 * исполнитель, она ещё не закрыта. Закрытая означает, что ветка под неё уже въехала
 * в главную, а у задачи ветка одна.
 */
export function taskState(number, options) {
    const issue = fetchIssue(number, options);
    if (!issue) {
        return { exists: false };
    }
    const item = fetchBoard(options).items.get(issue.number);
    return {
        exists: true,
        title: issue.title,
        open: issue.state === 'OPEN',
        onBoard: item !== undefined,
        status: item?.status ?? null,
        assigned: issue.assignees.length > 0,
        assignees: issue.assignees.map((assignee) => assignee.login),
        numbered: numberFromTitle(issue.title) === issue.number,
        labels: issue.labels.map((label) => label.name),
    };
}

/**
 * Ответ очереди работ о заведённой задаче, сложенный в строки, и приговор: обеспечена работа
 * или нет.
 *
 * Отделено от вызовов сети намеренно. Заведение кончается не выводом команды, а ответом
 * очереди, и решение о том, что напечатать и чем кончиться, — это то самое место, где
 * шестнадцать задач подряд прошли как успешные, не попав в очередь ни одна. Внутри вызовов
 * сети оно проверяется только живой бордой, то есть не проверяется никогда.
 *
 * `state` — то, что вернул `taskState`, либо `{ offline: <причина> }`, если спросить не удалось.
 */
export function describeTaskState(number, state) {
    if (state?.offline) {
        return {
            ok: false,
            lines: [
                `в очереди работ: спросить не удалось — ${state.offline}`,
                'состояние очереди неизвестно, и заведённым это не считается',
            ],
        };
    }
    if (!state?.exists) {
        return { ok: false, lines: [`задачи #${number} у хостинга нет — заведение не состоялось`] };
    }
    if (!state.onBoard) {
        return {
            ok: false,
            lines: [`в очереди работ: НЕТ`, 'задача, которой нет в очереди, работой не обеспечена — по ней никто не придёт'],
        };
    }

    const column = state.status ? `колонка «${state.status}»` : 'колонки нет';
    if (!state.assigned) {
        return {
            ok: false,
            lines: [`в очереди работ: ${column}, исполнителя нет`, 'ничья задача стоит в очереди невидимой для того, кто её делает'],
        };
    }
    return { ok: true, lines: [`в очереди работ: ${column}, исполнитель ${state.assignees.join(', ')}`] };
}

const isEntryPoint = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isEntryPoint && process.argv[2] === 'task') {
    try {
        process.stdout.write(`${JSON.stringify(taskState(Number(process.argv[3])))}\n`);
    } catch (error) {
        if (error instanceof OfflineError) {
            process.stdout.write('{"offline":true}\n');
        } else {
            process.stdout.write(`${JSON.stringify({ error: String(error.message ?? error) })}\n`);
            process.exit(1);
        }
    }
}

// Перевод колонки правит борду. Токен машинной записи здесь необязателен: не назвавшее его
// дерево правит борду учётной записью, под которой залогинен клиент хостинга. Требование
// токена держало бы очередь работ у дерева, машинной записи не заводившего, и у дерева, чью
// запись ограничил хостинг. Отсутствие связи при этом — по-прежнему отказ, а не пропуск:
// непереставленная задача молча остаётся в прежней колонке, и расхождение всплывает только
// сверкой очереди.
if (isEntryPoint && process.argv[2] === 'move') {
    const number = Number(process.argv[3]);
    const status = process.argv[4];
    if (!Number.isInteger(number) || !status) {
        console.error(`board: нужен номер задачи и колонка — node tools/board.mjs move 263 ${IN_PROGRESS_STATUS}`);
        process.exit(1);
    }
    const token = botToken() ?? undefined;
    try {
        const moved = moveTask(number, status, { token });
        console.log(`#${number}: ${moved.from ?? 'вне колонок'} → ${moved.to}`);
    } catch (error) {
        const reason = error instanceof OfflineError ? `нет связи с GitHub: ${error.message}` : String(error.message ?? error);
        console.error(`board: задача #${number} осталась на прежнем месте — ${reason}`);
        process.exit(1);
    }
}
