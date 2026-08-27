#!/usr/bin/env node
// rt-kit v0.16.1 · checks/check-board.github.mjs · 5f901bd9eb74 · правится надстройкой, не здесь
/**
 * Сверка очереди работ с тем, что закон о поставке требует от задачи и её PR.
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
 * Колонку задачи судит по её PR: открытый PR означает разбор, отсутствие — нет.
 * Момент, когда задачу берут в работу, отсюда не виден вовсе — ветки на борде нет, —
 * и «In progress» здесь не требуется ни от кого.
 *
 * Прогон на вершине спрашивает тоже она: страница PR без прогона выглядит так же, как
 * страница с зелёным, — цвета у неё нет ни там, ни там, — и вершина, за которой прогон
 * не встал, узнаётся только тем, что кто-то открыл список прогонов руками.
 *
 * Нет сети или нет токена — код возврата ноль: проверка, падающая в самолёте,
 * перестаёт что-либо значить.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
    IN_REVIEW_STATUS,
    OWNER,
    OfflineError,
    REPO,
    STATUS_OPTIONS,
    TASK_KEY,
    botToken,
    fetchBoard,
    fetchIssues,
    fetchOpenPulls,
    gh,
    ghJson,
    numberFromTaskDir,
    numberFromTitle,
    taskDirs,
} from './board.mjs';
import { deployLag, evictedOnHead, headCommittedAt, runsOnHead, verdictOnHead } from './board-runs.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const IN_REVIEW = STATUS_OPTIONS[IN_REVIEW_STATUS].name;
const TASKS_DIR = join(ROOT, CONFIG.tasksDir);
/** Возраст брошенного черновика, после которого он перестаёт выглядеть начатым сегодня. */
const DRAFT_DAYS = 7;
/**
 * Сколько времени вершине даётся на то, чтобы прогон за ней встал. Событие доходит до хостинга
 * не мгновенно, и сверка, позванная сразу после пуша, иначе краснела бы на здоровой ветке.
 */
const RUN_GRACE_MINUTES = 10;
/**
 * Конвейер дерева. Прогоны спрашиваются только там, где ему есть откуда взяться: дерево без
 * конвейера получило бы строку на каждый открытый PR, и не о чём.
 */
const PIPELINE = CONFIG.pushGate?.pipelineFile ?? '';
const HAS_PIPELINE = PIPELINE !== '' && existsSync(join(ROOT, PIPELINE));
/**
 * Рабочий поток выкатки и ветка, с которой прод сравнивают. Не назвав потока, дерево сверки
 * прода не получает — и сверка говорит об этом вслух: молчание читалось бы как «прод сошёлся».
 */
const DEPLOY_WORKFLOW = CONFIG.deploy?.workflow ?? '';
const MAIN_BRANCH = CONFIG.deploy?.mainBranch ?? 'main';

const problems = [];
const report = (message) => problems.push(message);

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
            report(`${CONFIG.tasksDir}/${name}/: разбор брошен ${age} дн. назад — заведи задачу или удали папку`);
        }
    }
}

/**
 * Значимые слова заголовка: ключ задачи и короткие служебные слова выброшены.
 *
 * Разбор нарочно грубый — совпадение слов здесь не приговор, а повод посмотреть: точное
 * сравнение заголовков не находит ничего, потому что дубль пишут другими словами.
 */
function titleWords(title) {
    return [
        ...new Set(
            String(title)
                .replace(/^\s*\[[^\]]+\]\s*/, '')
                .toLowerCase()
                .split(/[^\p{L}\p{N}]+/u)
                .filter((word) => word.length > 3)
        ),
    ];
}

/** Доля общих слов, начиная с которой две задачи стоит посмотреть глазами. */
const TITLE_OVERLAP = 0.6;
/** Меньше трёх общих слов совпадением не считается: два длинных слова совпадают у любой пары. */
const TITLE_COMMON_MIN = 3;
/** Больше скольких задач в группе — это серия эпика, а не дубль. */
const TITLE_GROUP_MAX = 4;

/**
 * Открытые задачи, чьи заголовки сильно совпали.
 *
 * Печатается строкой сводки, а не отказом: серия однотипных задач эпика — законное состояние
 * очереди, и отказ отбивал бы работу на каждой такой серии. Дубль же по отдельности исправен —
 * у обеих задач номер, исполнитель и колонка, — и не находит его ничто: разошлись они словами
 * заголовка, а совпадают дефектом и признаком закрытия.
 */
function similarTitles(open) {
    const words = new Map(open.map((issue) => [issue.number, titleWords(issue.title)]));
    // Задачи сводятся в группы, а не в пары: серия однотипных задач эпика — законное состояние
    // очереди, и парами она даёт по строке на каждое сочетание, то есть заглушает сама себя.
    const groups = [];

    for (const issue of open) {
        const mine = words.get(issue.number);
        const near = groups.find((group) =>
            group.some((other) => {
                const theirs = words.get(other.number);
                const common = mine.filter((word) => theirs.includes(word)).length;
                const smaller = Math.min(mine.length, theirs.length);

                return smaller > 0 && common >= TITLE_COMMON_MIN && common / smaller >= TITLE_OVERLAP;
            })
        );
        if (near) {
            near.push(issue);
            continue;
        }
        groups.push([issue]);
    }

    // Группа больше предела — это серия однотипных задач, а не дубль: у эпика их бывает
    // полтора десятка, и строка о них говорит только то, что эпик существует.
    for (const group of groups.filter((one) => one.length > 1 && one.length <= TITLE_GROUP_MAX)) {
        const numbers = group.map((issue) => `#${issue.number}`).join(', ');
        console.log(
            `check-board: ${numbers} — заголовки сильно совпадают, посмотри, не одна ли это работа: ` +
                `«${group[0].title}»`
        );
    }
}

function closesNumbers(body) {
    return [...String(body ?? '').matchAll(/\bCloses\s+#(\d+)\b/gi)].map((match) => Number(match[1]));
}

/**
 * Строка обхода в теле PR. Форма та же, что читает гард поставки: строку она начинает и
 * подстановки не принимает — иначе текст, называющий эту строку, снимает требование сам собой.
 */
const FOLDER_SKIP = /^[ \t]*Task-folder-skip:[ \t]*[^\s<"'][^\s"']{2,}/im;

/**
 * Везёт ли ветка PR папку своей задачи.
 *
 * Спрашивается ветка, а не рабочее дерево: папка, снесённая на машине и не закоммиченная,
 * въедет вместе с веткой. Локальных ссылок тут мало — ветка PR может быть не подтянута
 * сюда вовсе, — поэтому содержимое берётся у хостинга. Отказ «нет такого пути» означает, что
 * папки нет; всё остальное поднимается выше и разбирается как отсутствие связи.
 */
function folderInBranch(branch, options) {
    const path = `${CONFIG.tasksDir}/${branch}`;
    try {
        gh(['api', `repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`, '--jq', 'length'], options);
        return path;
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }

        return null;
    }
}

/**
 * Пути, которых конвейер не слушает: `paths-ignore` у его событий.
 *
 * Разбирается построчно, а не разборщиком разметки: у проверки его нет, а список — плоский
 * перечень строк под одним ключом. Ключей в файле бывает несколько — по событию, — и все они
 * складываются в один набор: ветка, чей вклад целиком лежит под ними, прогона не создаёт ни на
 * одном событии.
 */
function ignoredPaths() {
    if (!HAS_PIPELINE) {
        return [];
    }

    const lines = readFileSync(join(ROOT, PIPELINE), 'utf8').split('\n');
    const found = [];
    let inside = false;

    for (const line of lines) {
        if (/^\s*paths-ignore:\s*$/.test(line)) {
            inside = true;
            continue;
        }
        if (!inside) {
            continue;
        }
        const item = /^\s*-\s+['"]?([^'"\s]+)['"]?\s*$/.exec(line);
        if (item) {
            found.push(item[1]);
            continue;
        }
        inside = false;
    }

    return found;
}

const IGNORED_PATHS = ignoredPaths();

/** Знаки образца, у которых в выражении своё значение: кроме звёздочек, они значат себя. */
const escapeForRegExp = (value) => value.replace(/[.+?^${}()|[\]\\-]/g, '\\$&');

/** Подпадает ли путь под образец конвейера: `**` — любой хвост, `*` — кусок имени. */
function underPattern(path, pattern) {
    const body = pattern
        .split('**')
        .map((piece) => piece.split('*').map(escapeForRegExp).join('[^/]*'))
        .join('.*');

    return new RegExp(`^${body}$`).test(path);
}

/**
 * Вклад заявки целиком лежит под путями, которых конвейер не слушает.
 *
 * Такой ветке прогона не будет никогда, и требовать его — то же, что требовать его у ветки без
 * единого коммита: признак верен по букве и лжёт по существу, а действие, которое он советует,
 * не исполнимо. Красная строка при этом стоит рядом с настоящими расхождениями и учит
 * пропускать сверку целиком.
 *
 * Состав не прочитать — отвечаем «нет»: молчать наугад дороже одной лишней строки.
 */
function onlyIgnoredPaths(pull, options) {
    if (!IGNORED_PATHS.length) {
        return false;
    }

    let files = [];
    try {
        files = ghJson(['pr', 'view', String(pull.number), '--json', 'files'], options).files ?? [];
    } catch {
        return false;
    }

    return files.length > 0 && files.every((file) => IGNORED_PATHS.some((pattern) => underPattern(file.path, pattern)));
}

/**
 * Прогон на вершине открытого PR.
 *
 * Молчание страницы и зелёный прогон читаются одинаково, а событие до хостинга доходит не
 * всегда: в час его отказов пуш прошёл, а прогона за ним не встало. Сверка называет такую
 * вершину, пока PR ещё открыт, — после слияния об этом узнавать поздно.
 *
 * Считается сам факт прогона, а не его цвет. Идущий и упавший прогон видны на странице PR оба;
 * невидимо только отсутствие, и говорит сверка ровно о нём.
 *
 * Свежая вершина не судится: между пушем и прогоном проходит время, и красная строка на этом
 * промежутке значила бы «подожди», а не «чини».
 *
 * У конфликтующей заявки прогона не бывает вовсе, и причина не в потерянном событии: конвейер
 * проверяет слияние ветки с базой, а слияния при конфликте нет. Совет вернуть событие
 * выполняется буквально и не помогает — за один заход заявка перезакрывалась дважды подряд, и
 * прогон встал только после вливания главной ветки. Строка поэтому называет ту причину, которая
 * чинится.
 */
function checkHeadRun(pull, options) {
    if (checkEvicted(pull, options)) {
        return;
    }

    if (runsOnHead(pull.headRefOid, options) > 0) {
        checkReadyDraft(pull, options);
        return;
    }

    const minutes = Math.floor((Date.now() - headCommittedAt(pull.headRefOid, options)) / 60000);
    if (minutes < RUN_GRACE_MINUTES) {
        return;
    }

    if (onlyIgnoredPaths(pull, options)) {
        return;
    }

    if (pull.mergeable === 'CONFLICTING') {
        report(
            `PR #${pull.number}: на вершине ${pull.headRefOid.slice(0, 8)} прогона нет и не будет, пока она конфликтует — ` +
                `конвейер проверяет слияние ветки с базой, а слияния при конфликте нет; влей главную ветку и запушь, ` +
                `перезакрытие PR тут не помогает`
        );

        return;
    }

    report(
        `PR #${pull.number}: на вершине ${pull.headRefOid.slice(0, 8)} прогона нет, а лежит она ${minutes} мин — ` +
            `конвейер события не получил; верни его новым коммитом либо перезакрытием PR ` +
            `(gh pr close ${pull.number} && gh pr reopen ${pull.number})`
    );
}

/**
 * Прогон вершины, вытесненный из очереди конвейера.
 *
 * Группа очереди бережёт идущий прогон и не бережёт ждущего: хостинг держит в группе один
 * ждущий, и следующий встающий вытесняет прежний. Ветка за таким прогоном не проверялась ни
 * строчкой, а по очереди работ выглядит проверенной — прогон на вершине есть, и сверка считает
 * именно факт.
 *
 * Судится раньше отсутствия прогона и раньше цвета: иначе одна вершина получает две строки об
 * одном. Отвечает `true`, когда строка сказана, и остальные проверки вершины пропускаются.
 *
 * Строка называет обе команды и в том порядке, в каком их зовут. Перезапуск отбивает гард, пока
 * за тот же ход не читался журнал этого задания, и порядок в строке выполняет требование сам:
 * исполнитель зовёт написанное и не упирается в отказ на втором шаге.
 */
function checkEvicted(pull, options) {
    const evicted = evictedOnHead(pull.headRefOid, options);
    if (evicted.length === 0) {
        return false;
    }

    const run = evicted[0];
    report(
        `PR #${pull.number}: прогон ${run} на вершине ${pull.headRefOid.slice(0, 8)} вытеснен из очереди конвейера — ` +
            `заданий у него ноль, ветка не проверялась, а в списке он выглядит упавшим; ` +
            `прочитай прогон и перезапусти его (gh run view ${run} && gh run rerun ${run})`
    );
    return true;
}

/**
 * Готовая работа, оставленная черновиком.
 *
 * У черновика кнопка слияния заблокирована самим хостингом, поэтому зелёная страница PR
 * владельцу ничего не разрешает: список, в котором всё серое, читается как «работа не сделана».
 * Гард снятия черновика сюда не достаёт — он судит один ход и молчит, пока ветка везёт папку
 * своей задачи; сверка же смотрит на состояние очереди целиком.
 *
 * Четыре PR так и простояли черновиками двое суток — разбор
 * `docs/postmortems/2026-08-18-ready-work-left-in-drafts.md`.
 */
function checkReadyDraft(pull, options) {
    if (pull.isDraft !== true) {
        return;
    }
    if (verdictOnHead(pull.headRefOid, options) !== 'success') {
        return;
    }

    report(
        `PR #${pull.number}: прогон на вершине ${pull.headRefOid.slice(0, 8)} зелёный, а PR черновик — ` +
            `разбери папку задачи и сними черновик (gh pr ready ${pull.number}) либо скажи владельцу, чего ждёшь`
    );
}

/**
 * Заявка, конфликтующая с главной веткой.
 *
 * Конфликт приезжает в отданную заявку чужим слиянием, без единого действия её автора: основание,
 * проверенное на открытии, устаревает в ту минуту, когда владелец влил соседнюю работу. Гард
 * снятия черновика сюда не достаёт — он судит один ход, а заявка стоит в очереди днями.
 *
 * Судится только прямое «конфликтует»: `UNKNOWN` означает, что хостинг сливаемость ещё считает,
 * и строка о нём краснела бы на каждой свежей вершине. Две заявки так и ушли в разбор с
 * конфликтом — разбор `docs/postmortems/2026-08-20-drafts-cleared-without-re-reading-pr-state.md`.
 */
function checkConflicting(pull) {
    if (pull.mergeable !== 'CONFLICTING') {
        return;
    }

    report(
        `PR #${pull.number}: конфликтует с главной веткой — влей её в ветку задачи, разбери конфликт и запушь; ` +
            `слить эту заявку владелец не может, а по странице это видно только внутри неё`
    );
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
        report(`борда: ${item} — на борде стоят задачи, а не PR о них`);
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

    similarTitles(open);

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

        // Папка задачи, лежащая в ветке открытого PR, — расхождение с первой минуты заявки:
        // уборка стоит до её открытия, и открытие с лежащей папкой отбивает гард поставки.
        // Дошедшая сюда папка означает обход — либо заявку, открытую мимо гарда. Сказанная
        // после слияния, эта строка уже не чинится тем же PR: работа перешла дальше, и на
        // разбор заводится вторая задача.
        if (HAS_PIPELINE && pull.headRefOid) {
            checkHeadRun(pull, options);
        }

        checkConflicting(pull);

        if (!FOLDER_SKIP.test(String(pull.body ?? '')) && pull.headRefName) {
            const folder = folderInBranch(pull.headRefName, options);
            if (folder !== null) {
                report(
                    `PR #${pull.number}: ветка везёт папку задачи «${folder}/» — заявка открывается после уборки. Разбери её этим же PR или поставь в тело строку «Task-folder-skip: <причина>»`
                );
            }
        }
    }

    // Колонка задачи и её PR сверяются в обе стороны: открытый PR при задаче в «Backlog»
    // читается как работа, к которой не приступали, а «In review» без открытого PR — как
    // разбор, которого никто не ждёт.
    for (const issue of open) {
        const status = board.items.get(issue.number)?.status ?? null;
        const pull = claimed.get(issue.number);
        if (pull !== undefined && status !== IN_REVIEW) {
            report(
                `#${issue.number}: PR #${pull} открыт, а задача стоит «${status ?? 'вне колонок'}» — npm run task:move -- ${issue.number} ${IN_REVIEW_STATUS}`
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
        const number = numberFromTaskDir(name.split('/').pop());
        if (number === null || openNumbers.has(number)) {
            continue;
        }
        if (issues.some((issue) => issue.number === number)) {
            report(`${CONFIG.tasksDir}/${name}/: задача #${number} закрыта, а папка лежит среди текущих — разбери её`);
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

// Прод сверяется с главной веткой по последней успешной выкатке. Задача уходит из очереди
// слиянием, но слияние — ещё не прод: там, где выкатку запускают рукой, между ними может лечь
// сколько угодно коммитов, и заметить это неоткуда.
if (!offline && DEPLOY_WORKFLOW) {
    try {
        const lag = deployLag(DEPLOY_WORKFLOW, MAIN_BRANCH, { token: botToken() ?? undefined });
        if (lag === null) {
            report(`выкаток по «${DEPLOY_WORKFLOW}» не было ни одной — сравнить прод не с чем`);
        } else if (lag.behind > 0) {
            report(
                `прод отстал от «${MAIN_BRANCH}» на ${lag.behind} коммитов: последняя выкатка — ${lag.sha.slice(0, 8)} от ${String(lag.at).slice(0, 10)}`
            );
        }
    } catch (error) {
        if (error instanceof OfflineError) {
            console.log(`check-board: прод не сверялся — ${error.message}`);
        } else {
            throw error;
        }
    }
}

// Непроверенное называется вслух: молчание о прогонах читалось бы как «прогоны на месте».
if (!offline && !DEPLOY_WORKFLOW) {
    console.log('check-board: прод с главной веткой не сверялся — рабочий поток выкатки в настройке дерева не назван');
}

if (!offline && !HAS_PIPELINE) {
    console.log('check-board: прогоны на вершинах не спрашивались — файла конвейера в дереве нет');
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
