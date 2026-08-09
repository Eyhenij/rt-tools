#!/usr/bin/env node
/**
 * Сверка очереди работ с тем, что закон о поставке требует от задачи и её отчёта.
 *
 * Гард поставки отбивает промах в момент, когда его совершают, но действует только
 * на команды агента: тикет, заведённый мимо него, и PR, открытый руками, он не
 * видит. Эта сверка отвечает на другой вопрос — «а вся ли очередь в порядке
 * сейчас», — и потому смотрит на состояние, а не на команду.
 *
 * Судит только открытое. Закрытые задачи и влитые PR — это история: из сорока
 * последних влитых PR тридцать шесть пришли с веток, за которыми задачи не стояло,
 * и красная навсегда проверка ничем не отличалась бы от её отсутствия.
 *
 * Имя ветки не судит. У открытого PR его не переименовать — это новая ветка и новый
 * PR, — а проверка, требующая невыполнимого, обходится, а не исполняется. Имя ветки
 * стережёт гард в момент `git checkout -b` и `gh pr create`.
 *
 * Колонку задачи судит по её отчёту: открытый PR означает разбор, отсутствие — нет.
 * Момент, когда задачу берут в работу, отсюда не виден вовсе — ветки на борде нет, —
 * и «In progress» здесь не требуется ни от кого.
 *
 * Нет сети или нет токена — код возврата ноль: проверка, падающая в самолёте,
 * перестаёт что-либо значить.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
    IN_REVIEW_STATUS,
    OfflineError,
    STATUS_OPTIONS,
    TASK_KEY,
    botToken,
    fetchBoard,
    fetchIssues,
    fetchOpenPulls,
    numberFromTitle,
} from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const IN_REVIEW = STATUS_OPTIONS[IN_REVIEW_STATUS].name;
const TASKS_DIR = join(ROOT, CONFIG.tasksDir);
/** Возраст брошенного черновика, после которого он перестаёт выглядеть начатым сегодня. */
const DRAFT_DAYS = 7;

const problems = [];
const report = (message) => problems.push(message);

function taskDirs() {
    if (!existsSync(TASKS_DIR)) {
        return [];
    }
    return readdirSync(TASKS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== '_template')
        .map((entry) => entry.name);
}

/**
 * Разбор просьбы владельца идёт до заведения задачи и лежит в `_draft-<slug>`. Заглохший на
 * середине, он остаётся на диске вне истории и выглядит так же, как начатый сегодня: второй
 * заход берётся за то же самое заново. Возраст здесь — единственный доступный признак:
 * задачи за черновиком ещё нет, и спросить о нём некого.
 */
function checkDrafts() {
    const now = Date.now();
    for (const name of taskDirs()) {
        if (!name.startsWith('_draft-')) {
            continue;
        }
        const age = Math.floor((now - statSync(join(TASKS_DIR, name)).mtimeMs) / 86400000);
        if (age >= DRAFT_DAYS) {
            report(`docs/tasks/${name}/: разбор брошен ${age} дн. назад — заведи задачу или удали папку`);
        }
    }
}

function closesNumbers(body) {
    return [...String(body ?? '').matchAll(/\bCloses\s+#(\d+)\b/gi)].map((match) => Number(match[1]));
}

let checked = { issues: 0, pulls: 0 };

// Черновики судятся по диску и потому проверяются всегда: связи для этого не нужно.
checkDrafts();

let offline = false;
try {
    const options = { token: botToken() ?? undefined };
    const board = fetchBoard(options);
    const issues = fetchIssues('all', options);
    const open = issues.filter((issue) => issue.state === 'OPEN');
    const pulls = fetchOpenPulls(options);
    checked = { issues: issues.length, pulls: pulls.length };

    for (const item of board.foreign) {
        report(`борда: ${item} — на борде стоят задачи, а не отчёты о них`);
    }
    // Борду проверяем только у открытых задач. Закрытая ушла из очереди мержем, и колонки под
    // неё у борды нет: строку о ней нечем закрыть. Шесть таких строк висели в каждом прогоне и
    // заглушали собой настоящую задачу, которая на борду не попала.
    for (const issue of open) {
        if (!board.issues.has(issue.number)) {
            report(`#${issue.number}: задачи нет на борде — за ней никто не следит`);
        }
        if (numberFromTitle(issue.title) !== issue.number) {
            report(`#${issue.number}: заголовок не начинается с [${TASK_KEY}-${issue.number}] — «${issue.title}»`);
        }
        if (issue.assignees.length === 0) {
            report(`#${issue.number}: у задачи нет исполнителя — по очереди работ не видно, кто её взял`);
        }
    }

    const openNumbers = new Set(open.map((issue) => issue.number));
    const claimed = new Map();
    for (const pull of pulls) {
        const titleNumber = numberFromTitle(pull.title);
        if (titleNumber === null) {
            report(`PR #${pull.number}: заголовок не начинается с [${TASK_KEY}-<номер>] — «${pull.title}»`);
            continue;
        }
        if (!closesNumbers(pull.body).includes(titleNumber)) {
            report(`PR #${pull.number}: в теле нет строки «Closes #${titleNumber}» — на борде он не прикрепится к задаче`);
        }
        if (!openNumbers.has(titleNumber)) {
            report(`PR #${pull.number}: задачи #${titleNumber} нет среди открытых — у задачи одна ветка`);
        }
        if (claimed.has(titleNumber)) {
            report(`PR #${pull.number}: задачу #${titleNumber} уже закрывает PR #${claimed.get(titleNumber)} — у задачи одна ветка`);
        } else {
            claimed.set(titleNumber, pull.number);
        }
    }

    // Колонка задачи и её отчёт сверяются в обе стороны: открытый PR при задаче в «Backlog»
    // читается как работа, к которой не приступали, а «In review» без открытого PR — как
    // разбор, которого никто не ждёт.
    for (const issue of open) {
        const status = board.items.get(issue.number)?.status ?? null;
        const pull = claimed.get(issue.number);
        if (pull !== undefined && status !== IN_REVIEW) {
            report(
                `#${issue.number}: отчёт PR #${pull} открыт, а задача стоит «${status ?? 'вне колонок'}» — npm run task:move -- ${issue.number} ${IN_REVIEW_STATUS}`
            );
        }
        if (pull === undefined && status === IN_REVIEW) {
            report(`#${issue.number}: задача ждёт разбора, но открытого PR за ней нет — колонка отстала от работы`);
        }
    }

    // Папка задачи умирает вместе с задачей: то, что объясняет состоявшееся решение, уезжает
    // в `docs/archive/`, остальное удаляется. Оставленная рядом с текущими, она читается как
    // текущая — тем убедительнее, чем старше.
    for (const name of taskDirs()) {
        const number = Number(new RegExp(`^${TASK_KEY}-(\\d+)-`).exec(name)?.[1]);
        if (!Number.isInteger(number) || openNumbers.has(number)) {
            continue;
        }
        if (issues.some((issue) => issue.number === number)) {
            report(`docs/tasks/${name}/: задача #${number} закрыта, а папка лежит среди текущих — разбери её`);
        }
    }
} catch (error) {
    if (error instanceof OfflineError) {
        // Очередь работ без связи не проверить, а папки на диске — проверить: молчать про
        // них значило бы терять единственное, что здесь ещё можно сказать.
        console.log(`check-board: очередь работ пропущена, проверять нечем — ${error.message}`);
        offline = true;
    } else {
        console.error(`check-board: ${String(error.message ?? error)}`);
        process.exit(1);
    }
}

if (problems.length > 0) {
    console.error(`check-board: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nЗадача заводится командой npm run task:new — она делает все четыре шага сразу.');
    console.error('Папка задачи и её разбор — скил task-flow.');
    process.exit(1);
}

if (offline) {
    process.exit(0);
}

console.log(`check-board: задач ${checked.issues}, открытых PR ${checked.pulls}, расхождений нет`);
