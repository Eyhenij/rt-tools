#!/usr/bin/env node
/**
 * Reading the cargo from the intake: the command by which the executor takes what was sent to them.
 *
 * It lives in the tree rather than in the rules package, for the same reason as the mark command:
 * the cargo is read by whoever sorts it out, and that is the tree where the receiver stands.
 *
 * It is closed not by the tree's token but by a service account's sign-in. A token opens the intake
 * and only its own tree's, while all the cargo about the package has to be sorted out — four trees
 * send it and one fixes it. The account's pair lies outside the repository, like the token: it does
 * not outlive the history.
 *
 * A record's key is printed next to it, and it is the same one the record is marked by: for an
 * incident analysis that is the file name and it arrives in the list row, for a proposal it is the
 * sign of its text, and here it is counted by the same technique as at the intake. So the page
 * reads on the texts: without them a proposal is visible but not markable, and an analysis without
 * its text is nothing to sort out.
 *
 * A non-zero exit code for everything that did not land: no pair, the sign-in not accepted, the
 * intake silent.
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

/** The receiver's page limit: it gives no more, and asking for more means silently getting the same. */
const SIZE_MAX = 100;
const SIZE_DEFAULT = 20;

/** How many characters of the text to show in a list row: the row must fit the terminal's width. */
const GLIMPSE = 70;

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** The two kinds of cargo and what tells them apart in the reading: the path, the mark key and the kind's word. */
const KINDS = {
    proposal: {
        path: 'proposals',
        word: 'proposal',
        /** The mark key is the text's sign: the intake counts it by the same technique when it puts the record. */
        keyOf: (row) => (typeof row.text === 'string' ? createHash('sha256').update(row.text, 'utf8').digest('hex') : ''),
        /** What the record is named by in the list: the rules-layer resource the proposal is about. */
        titleOf: (row) => `${row.resource ?? '?'} · ${row.address ?? '?'}`,
    },
    postmortem: {
        path: 'postmortems',
        word: 'analysis',
        /** The mark key is the file name, and it arrives in the list row: there is nothing to read on for it. */
        keyOf: (row) => String(row.file ?? ''),
        titleOf: (row) => String(row.file ?? '?'),
    },
};

/** An argument's value: what stands right after it and is not an argument itself. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** A whole number from an argument, if it is whole and positive there. */
function wholeOf(argv, flag, fallback) {
    const said = Number(valueOf(argv, flag));

    return Number.isInteger(said) && said > 0 ? said : fallback;
}

/**
 * The service account's pair from the file named by the settings.
 *
 * The file lies outside the tree and does not outlive the history — by the same technique as the
 * token. Two lines rather than one with a separator: a password may hold any character, and a
 * separator met inside it would cut the pair silently.
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

/** What the intake said in words: the message from the answer, and for an unreadable one the answer itself. */
function saidOf(text) {
    try {
        const said = JSON.parse(text);

        return typeof said.message === 'string' ? said.message : text.trim();
    } catch {
        return text.trim();
    }
}

/** The sign-in cookie's value from the answer's headers: the client does not keep them, and it is put in by hand. */
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

/** A sign-in by the service account. A refusal is as much an answer as an accepted one. */
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

/** A request to the intake with the sign-in cookie. The reading of the answer is one for a list and for one record. */
export async function read(intake, cookie, path) {
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
        return { ok: false, status: answer.status, said: 'the intake answer did not parse', body: null };
    }
}

/** The page selection as a query string: nothing empty is written, so the receiver parses no emptiness. */
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

/** The first meaningful line of a text: a record is recognised by it without opening it whole. */
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
 * A list row: the mark key, what the record is named by, whose tree it is, the state and the beginning of the text.
 *
 * An incident analysis's key is its name, and there is no point repeating it a second time: two
 * identical rows in a row read as two records.
 */
function listLine(kind, row, key, glimpse) {
    const tail = glimpse ? ` — ${glimpse}` : '';
    const title = KINDS[kind].titleOf(row);
    const named = title === key ? '' : `${title} · `;

    return `  ${key || '(there is no key: the text is not read on)'}\n    ${named}${row.tree?.slug ?? '?'} · ${row.state}${closedMark(row)}${quarantineMark(row)} · in the intake ${row.id ?? '?'}${tail}`;
}

/**
 * What makes the record disputable: it stands next to the state of the quarantine, in the list row.
 *
 * Without it the list of the quarantine answers only «this one is disputable» and stays silent
 * about what by — and the record is taken apart anew, which is what the quarantine was started
 * against. It is cut to the width of the row by the same measure as the beginning of the text: a
 * reason of several lines would break the row apart.
 */
function quarantineMark(row) {
    const said = String(row.quarantineNote ?? '').trim();

    if (!said) {
        return '';
    }

    return ` · disputable: ${said.length > GLIMPSE ? `${said.slice(0, GLIMPSE)}…` : said}`;
}

/**
 * A note that the record was closed by the edition's publisher rather than by the tree that sent it.
 *
 * It stands next to the state rather than on a line of its own: otherwise the sender reads a
 * released record as their own mark — and looks at home for work they did not do.
 */
function closedMark(row) {
    return row.closedByPublisher ? ' (closed by the publisher)' : '';
}

/** The record whole: what is read before the decision. */
function fullLines(kind, row, key) {
    return [
        `${KINDS[kind].word} ${KINDS[kind].titleOf(row)}`,
        `  the mark key: ${key}`,
        // The record's sign in the intake is not the mark key: by that key its own tree moves it, and
        // by this one the edition's publisher closes it, having no foreign key and never able to have one
        `  the sign in the intake: ${row.id ?? '?'}`,
        `  tree: ${row.tree?.slug ?? '?'} · state: ${row.state}${closedMark(row)} · arrived: ${row.arrivedAt ?? '?'}`,
        ...(row.fixNote ? [`  fixed by: ${row.fixNote}`] : []),
        ...(row.releaseVersion ? [`  released in: ${row.releaseVersion}`] : []),
        ...(row.quarantineNote ? [`  disputable: ${row.quarantineNote}`] : []),
        '',
        String(row.text ?? '').trimEnd(),
        '',
    ];
}

/**
 * Read on the texts of the page's records.
 *
 * The list carries no text, and without it a proposal is not marked — its key is the text's sign.
 * An incident analysis is marked by the file name, but it still has to be read: to mark without
 * reading means to say «sorted out» about what was not seen.
 *
 * A record that did not read on does not fall out of the list: it arrives without a text and
 * without a key, and the row about it says so. Vanishing silently, it would read as sorted out.
 */
export async function withTexts(intake, cookie, kind, rows) {
    const full = [];

    for (const row of rows) {
        const one = await read(intake, cookie, `${KINDS[kind].path}/${row.id}`);

        full.push(one.ok && one.body ? one.body : row);
    }

    return full;
}

/** Take the cargo from the intake and show it as a batch. */
export async function pull(options) {
    if (!KINDS[options.kind]) {
        return { code: REFUSED, lines: [`there is no kind «${options.kind}»`, `there are: ${Object.keys(KINDS).join(', ')}`] };
    }

    if (!options.intake) {
        return {
            code: REFUSED,
            lines: [
                'there is no intake address: there is nowhere to read from',
                'it is named by the key `intake` in `.claude/rt-kit.json` or by the variable `RT_INTAKE`',
            ],
        };
    }

    if (!options.account.name || !options.account.password) {
        return {
            code: REFUSED,
            lines: [
                'there is no service account pair: the sign-in did not happen',
                'it lies outside the repository as two lines — the name and the password — and the path to it is named by the key `account` in `.claude/rt-kit.json`',
                'the account itself is created in the people section of the receiver admin panel',
            ],
        };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return { code: REFUSED, lines: [`${options.intake} did not accept the sign-in: ${entered.status || 'silence'} — ${entered.said}`] };
    }

    return page(options, entered.cookie);
}

/** A page of the list: how much lies in all, what is on this page and what each record is marked by. */
async function page(options, cookie) {
    const asked = { page: options.page, size: Math.min(options.size, SIZE_MAX), state: options.state, tree: options.tree };
    const got = await options.fetchOne(options.intake, cookie, `${KINDS[options.kind].path}?${query(asked)}`);

    if (!got.ok || !got.body) {
        return { code: REFUSED, lines: [`${options.intake} answered ${got.status || 'with silence'} — ${got.said}`] };
    }

    const rows = Array.isArray(got.body.rows) ? got.body.rows : [];
    const full = options.brief ? rows : await options.fetchTexts(options.intake, cookie, options.kind, rows);
    const sifted = options.state ? '' : ' (there is no filter by state: everything lies here)';
    const total = Number(got.body.total ?? rows.length);

    return {
        code: 0,
        lines: [
            `THE READING — ${options.intake}, kind «${KINDS[options.kind].word}»${sifted}`,
            `  in all ${total}, on the page ${asked.page} of ${Math.max(1, Math.ceil(total / asked.size))} — ${full.length}`,
            ...(options.text
                ? full.flatMap((row) => fullLines(options.kind, row, KINDS[options.kind].keyOf(row)))
                : full.map((row) => listLine(options.kind, row, KINDS[options.kind].keyOf(row), glimpseOf(row.text)))),
            ...(options.brief
                ? ['the proposals have no keys: with `--brief` the texts are not read on, and the key is counted from the text']
                : []),
            ...(options.text ? [] : ['the texts whole are printed by `--text`; what is sorted out is marked by `cargo:mark`']),
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
