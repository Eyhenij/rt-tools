/**
 * Засев хранилища стенда.
 *
 * Груз кладётся приёмом — теми же операциями, которыми его кладут деревья: набор проверяет, что
 * админка читает то, что кладёт приём, и записи, вставленные мимо приёма, отвечали бы на другой
 * вопрос. Мимо приёма идут только те три вещи, которых приём не умеет: учётная запись и деревья
 * заводятся командами строки запуска, а время приезда правится прямым запросом — его ставит
 * приёмник часами машины, а сценариям нужны и равные времена у соседних записей, и конец суток
 * по всемирному времени.
 *
 * Записи стенда узнаваемы с первого взгляда и настоящими не притворяются: деревья зовутся
 * «Стенд первый» и дальше по счёту, разборы называют случай набора, предложения — правку набора.
 * Прогон стирает базу целиком перед засевом.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ACCOUNT, API_ORIGIN, ENROLLED_SLUG, INVITES, SERVER_DATABASE_URL, STAND_DATABASE, STAND_DATABASE_URL, TREES } from './stand.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

/** Точка входа приёмника: прод-сборка, та же, что поднимается службой. */
const API_ENTRY = 'dist/apps/message-bus/main.js';

/** Сколько разборов у первого дерева: больше страницы по умолчанию — иначе второй страницы нет. */
const POSTMORTEMS_ONE = 23;

/** Сколько разборов у второго дерева. */
const POSTMORTEMS_TWO = 5;

/**
 * Разбор с разметкой и строкой скрипта внутри.
 *
 * Лежит он текстом и текстом же обязан показаться: экран, исполнивший его как разметку, показал
 * бы вместо строк заголовок и ничего не сказал бы об этом.
 */
const MARKUP_POSTMORTEM = Object.freeze({
    file: 'markup-case.md',
    text: [
        '# Разбор с разметкой',
        '',
        'Строка ниже приехала с дерева и показывается как есть:',
        '',
        '<script>window.__standScriptRan = true;</script>',
        '',
        '<b>жирным это тоже не становится</b>',
    ].join('\n'),
});

/** Запуск команды с ожиданием её конца. Возвращает вывод целиком. */
function run(command, args, { env = {}, input = null } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: ROOT, env: { ...process.env, ...env } });
        let out = '';
        let err = '';

        child.stdout.on('data', (chunk) => {
            out += String(chunk);
        });
        child.stderr.on('data', (chunk) => {
            err += String(chunk);
        });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve(out);

                return;
            }
            reject(new Error(`${command} ${args.join(' ')} — код выхода ${code}\n${out}\n${err}`));
        });

        if (input !== null) {
            child.stdin.write(input);
        }
        child.stdin.end();
    });
}

/** Запрос к хранилищу мимо приёмника: заведение базы, вычистка, правка времён. */
function sql(script, url = STAND_DATABASE_URL) {
    return run('npx', ['prisma', 'db', 'execute', '--stdin'], { env: { DATABASE_URL: url }, input: script });
}

/** Команда приёмника: деревья и учётные записи заводятся только ею. */
function command(args, input = '') {
    return run('node', [API_ENTRY, ...args], { env: { DATABASE_URL: STAND_DATABASE_URL }, input });
}

/**
 * База стенда и её схема.
 *
 * `CREATE DATABASE` идёт отдельным запросом и его отказ не разбирается: база переживает прогон, и
 * второй раз она уже есть. Схема накатывается каждый раз — миграция, приехавшая веткой, иначе
 * доехала бы до набора только после того, как кто-то вспомнил про базу стенда руками.
 */
async function database() {
    try {
        await sql(`CREATE DATABASE ${STAND_DATABASE};`, SERVER_DATABASE_URL);
    } catch {
        // база уже заведена прошлым прогоном — это и есть обычный случай
    }

    await run('npx', ['prisma', 'migrate', 'deploy'], { env: { DATABASE_URL: STAND_DATABASE_URL } });
}

/** Вычистка: набор начинает с пустого хранилища, чтобы числа на экране не зависели от прошлых прогонов. */
async function wipe() {
    await sql(
        'TRUNCATE TABLE "session", "account", "postmortem", "proposal", "month_record", "tree_invite", "tree_token", "tree" CASCADE;'
    );
}

/**
 * Учётная запись стенда.
 *
 * Пароль уходит команде через стандартный ввод — тем же путём, каким его вводит владелец: доводом
 * он остался бы и в истории оболочки, и в списке процессов машины.
 */
async function account() {
    await command(['account:add', ACCOUNT.name], `${ACCOUNT.password}\n`);
}

/**
 * Деревья и их токены.
 *
 * Токен команда печатает один раз и восстановить его неоткуда — он забирается из вывода сразу.
 * Строка перед ним у команды своя, поэтому берётся последняя непустая: она и есть токен.
 */
async function trees() {
    const tokens = new Map();

    for (const tree of TREES) {
        const report = await command(['tree:add', tree.name, tree.slug]);
        const lines = report
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        tokens.set(tree.slug, lines[lines.length - 1]);
    }

    return tokens;
}

/**
 * Отправка груза приёму — тем же запросом, каким его шлёт дерево.
 *
 * Токен идёт своим заголовком, а не общим заголовком доступа: приём груза опознаёт дерево
 * именно им, и токен, названный иначе, читается как запрос без токена вовсе.
 */
async function intake(kind, token, body) {
    const answer = await fetch(`${API_ORIGIN}/api/intake/${kind}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tree-token': token },
        body: JSON.stringify(body),
    });

    if (!answer.ok) {
        throw new Error(`приём груза «${kind}» отбит: ${answer.status} ${await answer.text()}`);
    }

    return answer.json();
}

/** Разборы происшествий обоих деревьев. Один из них несёт разметку и строку скрипта. */
async function postmortems(tokens) {
    const one = Array.from({ length: POSTMORTEMS_ONE }, (item, index) => ({
        file: `stand-case-${String(index + 1).padStart(2, '0')}.md`,
        text: [
            `# Случай набора ${index + 1}`,
            '',
            'Разбор заведён засевом стенда: он проверяет экран, а не описывает происшествие.',
            'Текст нарочно длиннее строки списка — в строке его быть не должно.',
        ].join('\n'),
    }));

    await intake('postmortems', tokens.get(TREES[0].slug), {
        schema: '1',
        tree: TREES[0].slug,
        items: [...one, MARKUP_POSTMORTEM],
    });

    await intake('postmortems', tokens.get(TREES[1].slug), {
        schema: '1',
        tree: TREES[1].slug,
        items: Array.from({ length: POSTMORTEMS_TWO }, (item, index) => ({
            file: `stand-second-${String(index + 1).padStart(2, '0')}.md`,
            text: `# Случай второго дерева ${index + 1}\n\nЗаведён засевом стенда.`,
        })),
    });
}

/** Предложения обоих деревьев: они же заводят записи месяца, если сводка ещё не приезжала. */
async function proposals(tokens) {
    await intake('proposals', tokens.get(TREES[0].slug), {
        schema: '1',
        tree: TREES[0].slug,
        items: [
            { text: 'Правило списка не называет, чем меряется пустота по отбору.', address: 'пакет', resource: 'rules/lists.md' },
            { text: 'Паттерн панели не показывает уход на связанную запись.', address: 'пакет', resource: 'patterns/entity-aside.md' },
            { text: 'Закон о проверяемости молчит про стенд из прод-сборки.', address: 'пакет', resource: 'laws/verifiability.md' },
        ],
    });

    await intake('proposals', tokens.get(TREES[1].slug), {
        schema: '1',
        tree: TREES[1].slug,
        items: [
            {
                text: 'Проверка спеков не видит заголовка теста без номера сценария.',
                address: 'дерево',
                resource: 'checks/check-specs.mjs',
            },
            { text: 'Гейт пуша не назвал места сквозному набору.', address: 'дерево', resource: 'checks/check-push-gate.mjs' },
        ],
    });
}

/** Сводка одного дерева. У второго её нет вовсе: запись месяца ему завели предложения. */
async function summaries(tokens) {
    await intake('summary', tokens.get(TREES[0].slug), {
        schema: '1',
        tree: TREES[0].slug,
        days: 30,
        sessions: 48,
        loads: 512,
        denials: 3,
        kinds: { rule: 12, pattern: 9 },
        guards: { 'task-flow-guard': 4 },
        unused: ['patterns/testing-e2e.md'],
        unpicked: ['rules/observability.md'],
        overrides: { 'gate-map.sh': 1 },
        versions: { 'agent-kit': '0.8.1' },
        total: 21,
    });
}

/**
 * Приглашения — по одному на каждое состояние.
 *
 * Идут теми же путями, какими они случаются в жизни: выдача и отзыв — командами владельца,
 * погашение — обращением дерева за токеном. Мимо этих путей идёт одно просроченное: срок ему
 * сдвигается прямым запросом, потому что ждать двое суток набор не может.
 *
 * Код приглашения забирается из вывода команды: печатается он один раз, и второй раз показать
 * его неоткуда. Строка с ним у команды предпоследняя — последней идёт готовая команда заведения
 * дерева, в которой тот же код стоит доводом.
 */
async function invites() {
    await command(['tree:invite', INVITES.waiting]);
    await command(['tree:invite', INVITES.revoked]);
    await command(['tree:uninvite', INVITES.revoked]);
    await command(['tree:invite', INVITES.expired]);

    const issued = await command(['tree:invite', INVITES.redeemed]);
    const lines = issued
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const code = lines[lines.length - 2];

    const answer = await fetch(`${API_ORIGIN}/api/intake/enroll`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, tree: ENROLLED_SLUG }),
    });

    if (!answer.ok) {
        throw new Error(`обращение за токеном отбито: ${answer.status} ${await answer.text()}`);
    }
}

/**
 * Время приезда записей.
 *
 * Приёмник ставит его часами машины, и весь засев ложится в одну секунду: порядок «свежие
 * сверху» на таких данных не отличить от любого другого, а страницы перемешивались бы между
 * прогонами. Времена поэтому раздаются здесь — по минуте на запись, свежая позже.
 *
 * Две записи получают одно и то же время нарочно: они встают на границу страниц, и сценарий про
 * записи с равным временем проверяет, что ни одна из них не показана дважды и ни одна не
 * потеряна. Ещё одна ставится на конец суток по всемирному времени: в поясе того, кто смотрит,
 * это уже следующий день, и список обязан показать местное время, не сломав порядок.
 */
async function moments() {
    await sql(
        [
            // свежие сверху: чем позже номер файла, тем позже приезд
            `UPDATE "postmortem" SET "arrivedAt" = TIMESTAMP '2026-08-01 06:00:00' + (ordered.pos * INTERVAL '1 hour'),`,
            `    "updatedAt" = TIMESTAMP '2026-08-01 06:00:00' + (ordered.pos * INTERVAL '1 hour')`,
            'FROM (SELECT "id", row_number() OVER (ORDER BY "file") AS pos FROM "postmortem") AS ordered',
            'WHERE "postmortem"."id" = ordered."id";',
            // две записи с одним и тем же временем на границе первой и второй страницы: по
            // порядку «свежие сверху» они стоят двадцатой и двадцать первой
            `UPDATE "postmortem" SET "arrivedAt" = TIMESTAMP '2026-08-01 19:00:00', "updatedAt" = TIMESTAMP '2026-08-01 19:00:00'`,
            `WHERE "file" IN ('stand-case-11.md', 'stand-case-12.md');`,
            // конец суток по всемирному времени: в поясе смотрящего это уже следующий день
            `UPDATE "postmortem" SET "arrivedAt" = TIMESTAMP '2026-08-03 23:40:00', "updatedAt" = TIMESTAMP '2026-08-03 23:40:00'`,
            `WHERE "file" = 'markup-case.md';`,
            // предложения: по одному часу между ними, чтобы порядок был виден
            `UPDATE "proposal" SET "arrivedAt" = TIMESTAMP '2026-08-04 09:00:00' + (ordered.pos * INTERVAL '1 hour')`,
            'FROM (SELECT "id", row_number() OVER (ORDER BY "text") AS pos FROM "proposal") AS ordered',
            'WHERE "proposal"."id" = ordered."id";',
            // записи месяца: у каждой свой прогон, чтобы порядок по времени прогона был виден
            `UPDATE "month_record" SET "ranAt" = TIMESTAMP '2026-08-05 10:00:00' + (ordered.pos * INTERVAL '1 hour')`,
            'FROM (SELECT "id", row_number() OVER (ORDER BY "treeId") AS pos FROM "month_record") AS ordered',
            'WHERE "month_record"."id" = ordered."id";',
            // приглашения: времена выдачи разведены по часу, чтобы порядок «выданные позже
            // сверху» был виден и не зависел от того, за сколько прошёл засев
            `UPDATE "tree_invite" SET "issuedAt" = TIMESTAMP '2026-08-06 08:00:00' + (ordered.pos * INTERVAL '1 hour')`,
            'FROM (SELECT "id", row_number() OVER (ORDER BY "name") AS pos FROM "tree_invite") AS ordered',
            'WHERE "tree_invite"."id" = ordered."id";',
            // срок годности считается от нынешнего момента, а не датой: состояние приглашения
            // приёмник считает на момент запроса, и написанная дата сделала бы ждущее
            // просроченным через двое суток — набор покраснел бы сам, без единой правки
            `UPDATE "tree_invite" SET "expiresAt" = now() + INTERVAL '2 days' WHERE "name" <> 'Стенд просроченный';`,
            `UPDATE "tree_invite" SET "expiresAt" = now() - INTERVAL '1 day' WHERE "name" = 'Стенд просроченный';`,
        ].join('\n')
    );
}

/** Засев целиком. Зовётся подъёмом стенда после того, как приёмник поднят. */
export async function seed() {
    await wipe();
    await account();
    const tokens = await trees();
    await postmortems(tokens);
    await proposals(tokens);
    await summaries(tokens);
    await invites();
    await moments();
}

/** Подготовка хранилища: база и схема. Идёт до подъёма приёмника — он ждёт готовой схемы. */
export async function prepareDatabase() {
    await database();
}
