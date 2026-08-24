#!/usr/bin/env node
/**
 * Чтение груза из приёма: команда, которой исполнитель забирает то, что ему прислали.
 *
 * Живёт в дереве, а не в пакете правил, по той же причине, что и команда отметки: читает груз
 * тот, кто его разбирает, а разбирает дерево, где стоит приёмник.
 *
 * Закрыта не токеном дерева, а входом учётной записи службы. Токен открывает приём и только
 * своего дерева, а разбирать приходится весь груз о пакете — его шлют четыре дерева, а чинит
 * одно. Пара учётной записи лежит вне репозитория, как и токен: истории она не переживает.
 *
 * Ключ записи печатается рядом с ней, и он тот же, которым её отмечают: у разбора происшествия
 * это имя файла и приезжает оно строкой списка, у предложения — признак его текста, и он
 * считается здесь тем же приёмом, что на приёме. Поэтому страница дочитывает тексты: без них
 * предложение видно, но не отмечается, а разбор без текста разбирать нечем.
 *
 * Ненулевой код возврата у всего, что не легло: нет пары, не принят вход, не ответил приём.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const REFUSED = 1;
const TIMEOUT_MS = 15_000;
const SESSION_COOKIE = 'message_bus_session';

const KIND_FLAG = '--kind';
const STATE_FLAG = '--state';
const TREE_FLAG = '--tree';
const PAGE_FLAG = '--page';
const SIZE_FLAG = '--size';
const TEXT_FLAG = '--text';
const BRIEF_FLAG = '--brief';

/** Предел страницы у приёмника: больше он не отдаёт, и просить больше — молча получить столько же. */
const SIZE_MAX = 100;
const SIZE_DEFAULT = 20;

/** Сколько знаков текста показывать строкой списка: строка должна влезать в ширину терминала. */
const GLIMPSE = 70;

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** Два рода груза и то, чем они отличаются в чтении: путь, ключ отметки и как зовётся род. */
const KINDS = {
    proposal: {
        path: 'proposals',
        word: 'предложение',
        /** Ключ отметки — признак текста: тем же приёмом его считает приём, когда запись кладёт. */
        keyOf: (row) => (typeof row.text === 'string' ? createHash('sha256').update(row.text, 'utf8').digest('hex') : ''),
        /** Чем запись названа в списке: ресурс слоя правил, к которому предложение относится. */
        titleOf: (row) => `${row.resource ?? '?'} · ${row.address ?? '?'}`,
    },
    postmortem: {
        path: 'postmortems',
        word: 'разбор',
        /** Ключ отметки — имя файла, и он приезжает строкой списка: дочитывать ради него нечего. */
        keyOf: (row) => String(row.file ?? ''),
        titleOf: (row) => String(row.file ?? '?'),
    },
};

/** Значение довода: то, что стоит сразу за ним и само доводом не является. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** Целое из довода, если оно там целое и положительное. */
function wholeOf(argv, flag, fallback) {
    const said = Number(valueOf(argv, flag));

    return Number.isInteger(said) && said > 0 ? said : fallback;
}

/**
 * Пара учётной записи службы из файла, названного настройкой.
 *
 * Файл лежит вне дерева и историю не переживает — тем же приёмом, что и токен. Две строки, а не
 * одна с разделителем: пароль вправе держать любой знак, и разделитель, встретившийся в нём,
 * резал бы пару молча.
 */
function accountOf(where) {
    if (!where) {
        return { name: '', password: '' };
    }

    const path = where.startsWith('~') ? join(homedir(), where.slice(1)) : resolve(ROOT, where);

    if (!existsSync(path)) {
        return { name: '', password: '' };
    }

    const lines = readFileSync(path, 'utf8').split('\n');

    return { name: (lines[0] ?? '').trim(), password: (lines[1] ?? '').trim() };
}

/** Что приём сказал словами: сообщение из ответа, а при неразборчивом — сам ответ. */
function saidOf(text) {
    try {
        const said = JSON.parse(text);

        return typeof said.message === 'string' ? said.message : text.trim();
    } catch {
        return text.trim();
    }
}

/** Значение куки входа из заголовков ответа: клиент их не хранит, и подставляется она руками. */
function cookieOf(answer) {
    const set = answer.headers.getSetCookie ? answer.headers.getSetCookie() : [answer.headers.get('set-cookie') ?? ''];

    for (const one of set) {
        const at = one.indexOf('=');

        if (at > 0 && one.slice(0, at).trim() === SESSION_COOKIE) {
            return one.slice(at + 1).split(';')[0];
        }
    }

    return '';
}

/** Вход учётной записью службы. Отказ — такой же ответ, как принятое. */
export async function login(intake, account) {
    let answer;

    try {
        answer = await fetch(`${intake.replace(/\/+$/, '')}/api/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: account.name, password: account.password }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        return { ok: false, status: 0, said: error.message, cookie: '' };
    }

    const text = await answer.text();

    return { ok: answer.ok, status: answer.status, said: saidOf(text), cookie: answer.ok ? cookieOf(answer) : '' };
}

/** Запрос к приёму с кукой входа. Разбор ответа один на список и на одну запись. */
async function read(intake, cookie, path) {
    let answer;

    try {
        answer = await fetch(`${intake.replace(/\/+$/, '')}/api/${path}`, {
            headers: { cookie: `${SESSION_COOKIE}=${cookie}` },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        return { ok: false, status: 0, said: error.message, body: null };
    }

    const text = await answer.text();

    if (!answer.ok) {
        return { ok: false, status: answer.status, said: saidOf(text), body: null };
    }

    try {
        return { ok: true, status: answer.status, said: '', body: JSON.parse(text) };
    } catch {
        return { ok: false, status: answer.status, said: 'ответ приёма не разобрался', body: null };
    }
}

/** Выборка страницы строкой запроса: пустое не пишется, чтобы приёмник не разбирал пустоту. */
function query(asked) {
    const parts = [`page=${asked.page}`, `size=${asked.size}`, 'sort=arrivedAt', 'dir=asc'];

    if (asked.state) {
        parts.push(`state=${encodeURIComponent(asked.state)}`);
    }

    if (asked.tree) {
        parts.push(`tree=${encodeURIComponent(asked.tree)}`);
    }

    return parts.join('&');
}

/** Первая значащая строка текста: по ней запись узнают, не открывая её целиком. */
function glimpseOf(text) {
    const first = String(text ?? '')
        .split('\n')
        .map((line) =>
            line
                .replace(/^[\s>#*-]+/, '')
                .replace(/\*\*/g, '')
                .trim()
        )
        .find((line) => line.length > 0);

    if (!first) {
        return '';
    }

    return first.length > GLIMPSE ? `${first.slice(0, GLIMPSE)}…` : first;
}

/**
 * Строка списка: ключ отметки, чем запись названа, чьё дерево, состояние и начало текста.
 *
 * У разбора происшествия ключ и есть его имя, и повторять его второй раз незачем: две
 * одинаковые строки подряд читаются как две записи.
 */
function listLine(kind, row, key, glimpse) {
    const tail = glimpse ? ` — ${glimpse}` : '';
    const title = KINDS[kind].titleOf(row);
    const named = title === key ? '' : `${title} · `;

    return `  ${key || '(ключа нет: текст не дочитан)'}\n    ${named}${row.tree?.slug ?? '?'} · ${row.state}${tail}`;
}

/** Запись целиком: то, что читают перед решением. */
function fullLines(kind, row, key) {
    return [
        `${KINDS[kind].word} ${KINDS[kind].titleOf(row)}`,
        `  ключ отметки: ${key}`,
        `  дерево: ${row.tree?.slug ?? '?'} · состояние: ${row.state} · приехало: ${row.arrivedAt ?? '?'}`,
        ...(row.fixNote ? [`  чем починено: ${row.fixNote}`] : []),
        ...(row.releaseVersion ? [`  выпущено в: ${row.releaseVersion}`] : []),
        '',
        String(row.text ?? '').trimEnd(),
        '',
    ];
}

/**
 * Дочитать тексты записей страницы.
 *
 * Список текста не везёт, а без него предложение не отмечается — его ключ и есть признак текста.
 * Разбор происшествия отмечается именем файла, но читать его всё равно приходится: отметить, не
 * прочитав, значит сказать «разобрано» о том, чего не видели.
 *
 * Запись, которая не дочиталась, из списка не выпадает: она приезжает без текста и без ключа, и
 * строка о ней это говорит. Молча пропав, она читалась бы разобранной.
 */
async function withTexts(intake, cookie, kind, rows) {
    const full = [];

    for (const row of rows) {
        const one = await read(intake, cookie, `${KINDS[kind].path}/${row.id}`);

        full.push(one.ok && one.body ? one.body : row);
    }

    return full;
}

/** Забрать груз из приёма и показать его пачкой. */
export async function pull(options) {
    if (!KINDS[options.kind]) {
        return { code: REFUSED, lines: [`рода «${options.kind}» не бывает`, `бывают: ${Object.keys(KINDS).join(', ')}`] };
    }

    if (!options.intake) {
        return {
            code: REFUSED,
            lines: [
                'адреса приёма нет: читать неоткуда',
                'он называется ключом `intake` в `.claude/rt-kit.json` либо переменной `RT_INTAKE`',
            ],
        };
    }

    if (!options.account.name || !options.account.password) {
        return {
            code: REFUSED,
            lines: [
                'пары учётной записи службы нет: вход не состоялся',
                'она лежит вне репозитория двумя строками — имя и пароль, — а путь к ней называется ключом `account` в `.claude/rt-kit.json`',
                'сама запись заводится в приёмнике командой `account:add`',
            ],
        };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return { code: REFUSED, lines: [`${options.intake} вход не принял: ${entered.status || 'молчание'} — ${entered.said}`] };
    }

    return page(options, entered.cookie);
}

/** Страница списка: сколько всего лежит, что на этой странице и чем каждую запись отмечать. */
async function page(options, cookie) {
    const asked = { page: options.page, size: Math.min(options.size, SIZE_MAX), state: options.state, tree: options.tree };
    const got = await options.fetchOne(options.intake, cookie, `${KINDS[options.kind].path}?${query(asked)}`);

    if (!got.ok || !got.body) {
        return { code: REFUSED, lines: [`${options.intake} ответил ${got.status || 'молчанием'} — ${got.said}`] };
    }

    const rows = Array.isArray(got.body.rows) ? got.body.rows : [];
    const full = options.brief ? rows : await options.fetchTexts(options.intake, cookie, options.kind, rows);
    const sifted = options.state ? '' : ' (отбора по состоянию нет: лежит всё)';
    const total = Number(got.body.total ?? rows.length);

    return {
        code: 0,
        lines: [
            `ЧТЕНИЕ — ${options.intake}, род «${KINDS[options.kind].word}»${sifted}`,
            `  всего ${total}, на странице ${asked.page} из ${Math.max(1, Math.ceil(total / asked.size))} — ${full.length}`,
            ...(options.text
                ? full.flatMap((row) => fullLines(options.kind, row, KINDS[options.kind].keyOf(row)))
                : full.map((row) => listLine(options.kind, row, KINDS[options.kind].keyOf(row), glimpseOf(row.text)))),
            ...(options.brief ? ['ключей у предложений нет: с `--brief` тексты не дочитываются, а ключ считается из текста'] : []),
            ...(options.text ? [] : ['тексты целиком печатает `--text`; отмечает разобранное `cargo:mark`']),
        ],
    };
}

async function main() {
    const argv = process.argv.slice(2);
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const named = accountOf(config.account ?? '');

    const outcome = await pull({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        account: {
            name: process.env.RT_ACCOUNT_NAME || named.name,
            password: process.env.RT_ACCOUNT_PASSWORD || named.password,
        },
        kind: valueOf(argv, KIND_FLAG) || 'proposal',
        state: valueOf(argv, STATE_FLAG),
        tree: valueOf(argv, TREE_FLAG),
        page: wholeOf(argv, PAGE_FLAG, 1),
        size: wholeOf(argv, SIZE_FLAG, SIZE_DEFAULT),
        text: argv.includes(TEXT_FLAG),
        brief: argv.includes(BRIEF_FLAG),
        enter: login,
        fetchOne: read,
        fetchTexts: withTexts,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-pull.mjs')) {
    main().then((code) => process.exit(code));
}
