#!/usr/bin/env node
/**
 * Закрытие записей груза издателем редакции: команда, которой закрывают чужие записи.
 *
 * Второй путь к состоянию записи, а не замена первому. Свою запись двигает приславшее дерево —
 * это команда отметки, и она остаётся; но предложение соседа входит в редакцию пакета здесь, и
 * перевести его в «выпущено» отправитель не может: он о выпуске не знает. Токена соседа у
 * издателя нет, и открывать им чужую запись нельзя — поэтому закрытие закрыто входом человека,
 * той же парой учётной записи службы, какой читается груз.
 *
 * Запись называется признаком из приёма, а не ключом отправителя: имя файла и признак текста
 * уникальны у своего дерева, а не в приёме, и названный ключ нашёл бы у двух деревьев две
 * записи. Печатает этот признак чтение — строкой `в приёме <признак>`.
 *
 * Ненулевой код возврата у всего, что не легло: отбитая строка кончает команду ненулевым кодом.
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const REFUSED = 1;
const TIMEOUT_MS = 15_000;
const SESSION_COOKIE = 'message_bus_session';

const POSTMORTEM_FLAG = '--postmortem';
const PROPOSAL_FLAG = '--proposal';
const FIX_FLAG = '--fix';
const RELEASE_FLAG = '--release';
const DRY_RUN_FLAG = '--dry-run';
const STATE_FLAG = '--state';

/** Состояния, которыми запись закрывают. Остальные ставит дерево: они говорят о его работе. */
const CLOSE_STATES = ['fixed', 'released'];

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** Причина отбоя словами человека: по каждой видно, что делать дальше. */
const DENIAL_WORDS = {
    missing: 'записи с таким признаком в приёме нет',
    forbidden: 'закрытие ходит только вперёд и только в «fixed» либо «released»',
    'no-fix-note': 'переход в починку без довода `--fix`',
    'extra-fix-note': 'довод `--fix` приехал не с переходом в починку',
    'no-release-version': 'переход в выпуск без довода `--release`',
    'extra-release-version': 'довод `--release` приехал не с переходом в выпуск',
};

/** Значение довода: то, что стоит сразу за ним и само доводом не является. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** Записи, названные доводами строки запуска: род у каждой свой, порядок — как их назвали. */
export function itemsOf(argv, state, attached = { fixNote: '', releaseVersion: '' }) {
    const items = [];

    for (let at = 0; at < argv.length; at += 1) {
        const kind = argv[at] === POSTMORTEM_FLAG ? 'postmortem' : argv[at] === PROPOSAL_FLAG ? 'proposal' : null;
        const key = argv[at + 1] ?? '';

        if (kind && key && !key.startsWith('--')) {
            items.push({
                kind,
                key,
                state,
                ...(attached.fixNote ? { fixNote: attached.fixNote } : {}),
                ...(attached.releaseVersion ? { releaseVersion: attached.releaseVersion } : {}),
            });
        }
    }

    return items;
}

/**
 * Пара учётной записи службы из файла, названного настройкой.
 *
 * Тот же файл и тот же приём, что у чтения груза: читает и закрывает один человек, и вторая пара
 * под тем же входом означала бы вторую учётную запись, которой никто не заводил.
 */
export function accountOf(where) {
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

/** Запрос закрытия с кукой входа. Отказ — такой же ответ, как принятое. */
export async function callClose(intake, cookie, body) {
    let answer;

    try {
        answer = await fetch(`${intake.replace(/\/+$/, '')}/api/intake/close`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', cookie: `${SESSION_COOKIE}=${cookie}` },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        return { ok: false, status: 0, said: error.message, accepted: null };
    }

    const text = await answer.text();
    let accepted = null;

    if (answer.ok) {
        try {
            const parsed = JSON.parse(text);

            accepted = {
                changed: Number(parsed.changed ?? 0),
                same: Number(parsed.same ?? 0),
                denied: Array.isArray(parsed.denied) ? parsed.denied : [],
            };
        } catch {
            accepted = null;
        }
    }

    return { ok: answer.ok, status: answer.status, said: saidOf(text), accepted };
}

/** Пакет одной строкой: её читает человек перед тем, как отправить. */
function describe(items, state) {
    const postmortems = items.filter((one) => one.kind === 'postmortem').length;

    return `в «${state}»: разборов ${postmortems}, предложений ${items.length - postmortems}`;
}

/** Отбитая строка человеку: род, признак и причина словами. */
function deniedLine(kind, key, denial) {
    return `  ${kind === 'postmortem' ? 'разбор' : 'предложение'} ${key} — ${DENIAL_WORDS[denial] ?? denial}`;
}

/** Что не сошлось до сети: состояние, записи и вход. Всё, что можно отбить здесь, отбивается здесь. */
function refusalOf(options) {
    if (!CLOSE_STATES.includes(options.state)) {
        return [
            `закрытием состояние «${options.state}» не ставится`,
            `закрывают в: ${CLOSE_STATES.join(', ')} — остальные ставит само дерево, они говорят о его работе`,
        ];
    }

    if (options.items.length === 0) {
        return [
            'закрывать нечего: ни одной записи в доводах',
            `запись называется \`${POSTMORTEM_FLAG} <признак в приёме>\` либо \`${PROPOSAL_FLAG} <признак в приёме>\``,
            'признак печатает чтение груза — строкой «в приёме»; ключ отметки сюда не годится',
        ];
    }

    if (!options.account.name || !options.account.password) {
        return [
            'пары учётной записи службы нет: закрытие осталось неотправленным',
            'она лежит вне дерева, тем же приёмом, что и токен, — файлом, названным настройкой',
        ];
    }

    return null;
}

/** Закрыть названные записи. */
export async function close(options) {
    const refused = refusalOf(options);

    if (refused) {
        return { code: REFUSED, lines: refused };
    }

    // Перечень печатается обоими прогонами, и разделены они не окончанием глагола, а первой
    // строкой: «уехало» и «уехало бы» отличаются двумя буквами в хвосте, а строки под ними
    // одинаковы до знака, и вывод сухого прогона читается сделанной работой
    const listed = `  ${describe(options.items, options.state)}`;

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                'СУХОЙ ПРОГОН — наружу не ушло ничего, в приёме не закрыто ни одной записи',
                `уехало бы в ${options.intake} под входом ${options.account.name}:`,
                listed,
                'закрывает это тот же вызов без `--dry-run`',
            ],
        };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return { code: REFUSED, lines: [`вход в ${options.intake} не принят: ${entered.status || 'молчание'} — ${entered.said}`] };
    }

    const closed = await options.call(options.intake, entered.cookie, { items: options.items });

    if (!closed.ok || !closed.accepted) {
        return { code: REFUSED, lines: [`${options.intake} ответил ${closed.status || 'молчанием'} — ${closed.said}`] };
    }

    const { changed, same, denied } = closed.accepted;

    return {
        code: denied.length ? REFUSED : 0,
        lines: [
            `ЗАКРЫТИЕ — уходит в ${options.intake} под входом ${options.account.name}:`,
            listed,
            `закрыто: переведено ${changed}, уже стояло ${same}, отбито ${denied.length}`,
            ...denied.map((one) => deniedLine(one.kind, one.key, one.denial)),
        ],
    };
}

async function main() {
    const argv = process.argv.slice(2);
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const named = accountOf(config.account ?? '');
    const state = valueOf(argv, STATE_FLAG);

    const outcome = await close({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        account: {
            name: process.env.RT_ACCOUNT_NAME || named.name,
            password: process.env.RT_ACCOUNT_PASSWORD || named.password,
        },
        state,
        items: itemsOf(argv, state, { fixNote: valueOf(argv, FIX_FLAG), releaseVersion: valueOf(argv, RELEASE_FLAG) }),
        dryRun: argv.includes(DRY_RUN_FLAG),
        enter: login,
        call: callClose,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-close.mjs')) {
    main().then((code) => process.exit(code));
}
