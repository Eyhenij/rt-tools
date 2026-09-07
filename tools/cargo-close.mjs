#!/usr/bin/env node
/**
 * Closing cargo records by the edition's publisher: the command that closes foreign records.
 *
 * A second road to a record's state rather than a replacement for the first. Its own record is
 * moved by the tree that sent it — that is the mark command, and it stays; but a neighbour's
 * proposal enters an edition of the package here, and the sender cannot move it into «released»:
 * they do not know about the release. The publisher has no neighbour's token, and opening a foreign
 * record with it is not allowed — so the closing is closed by a person's sign-in, by the same
 * service account pair the cargo is read by.
 *
 * A record is named by a sign from the intake rather than by the sender's key: a file name and a
 * text sign are unique in their own tree, not in the intake, and a named key would find two records
 * at two trees. That sign is printed by the read — by the line `in the intake <sign>`.
 *
 * A non-zero exit code for everything that did not land: a refused line ends the command with a
 * non-zero code.
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

/** The states a record is closed with. The rest are set by the tree: they speak of its work. */
const CLOSE_STATES = ['fixed', 'released'];

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** The reason for a refusal in a person's words: by each it is visible what to do next. */
const DENIAL_WORDS = {
    missing: 'the intake has no record with such a sign',
    forbidden: 'closing goes only forward and only into «fixed» or «released»',
    'no-fix-note': 'a move into the fix without the argument `--fix`',
    'extra-fix-note': 'the argument `--fix` arrived not with a move into the fix',
    'no-release-version': 'a move into the release without the argument `--release`',
    'extra-release-version': 'the argument `--release` arrived not with a move into the release',
};

/** An argument's value: what stands right after it and is not an argument itself. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** The records named by the launch line's arguments: each has its kind, the order as named. */
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
 * The service account's pair from the file named by the settings.
 *
 * The same file and the same technique as the cargo read: one person reads and closes, and a
 * second pair under the same sign-in would mean a second account nobody created.
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

/** A closing request with the sign-in cookie. A refusal is as much an answer as an accepted one. */
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

/** The batch in one line: a person reads it before sending. */
function describe(items, state) {
    const postmortems = items.filter((one) => one.kind === 'postmortem').length;

    return `into «${state}»: analyses ${postmortems}, proposals ${items.length - postmortems}`;
}

/** A refused line for a person: the kind, the sign and the reason in words. */
function deniedLine(kind, key, denial) {
    return `  ${kind === 'postmortem' ? 'analysis' : 'proposal'} ${key} — ${DENIAL_WORDS[denial] ?? denial}`;
}

/** What did not match before the network: the state, the records and the sign-in. All that can be refused here is refused here. */
function refusalOf(options) {
    if (!CLOSE_STATES.includes(options.state)) {
        return [
            `the state «${options.state}» is not set by closing`,
            `they close into: ${CLOSE_STATES.join(', ')} — the rest the tree sets itself, they speak of its work`,
        ];
    }

    if (options.items.length === 0) {
        return [
            'there is nothing to close: not one record in the arguments',
            `a record is named \`${POSTMORTEM_FLAG} <sign in the intake>\` or \`${PROPOSAL_FLAG} <sign in the intake>\``,
            'the sign is printed by the cargo read — by the line «in the intake»; the mark key is no good here',
        ];
    }

    if (!options.account.name || !options.account.password) {
        return [
            'there is no service account pair: the closing stayed unsent',
            'it lies outside the tree, by the same technique as the token — as a file named by the settings',
        ];
    }

    return null;
}

/** Close the named records. */
export async function close(options) {
    const refused = refusalOf(options);

    if (refused) {
        return { code: REFUSED, lines: refused };
    }

    // The list is printed by both runs, and they are separated not by a verb ending but by the first
    // line: a dry run and a real one differ by two letters at the tail, while the lines under them
    // are the same to the character, and a dry run's output reads as done work
    const listed = `  ${describe(options.items, options.state)}`;

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                'A DRY RUN — nothing left outward, not one record is closed in the intake',
                `it would have gone to ${options.intake} under the sign-in ${options.account.name}:`,
                listed,
                'this is closed by the same call without `--dry-run`',
            ],
        };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return {
            code: REFUSED,
            lines: [`the sign-in to ${options.intake} was not accepted: ${entered.status || 'silence'} — ${entered.said}`],
        };
    }

    const closed = await options.call(options.intake, entered.cookie, { items: options.items });

    if (!closed.ok || !closed.accepted) {
        return { code: REFUSED, lines: [`${options.intake} answered ${closed.status || 'with silence'} — ${closed.said}`] };
    }

    const { changed, same, denied } = closed.accepted;

    return {
        code: denied.length ? REFUSED : 0,
        lines: [
            `THE CLOSING — going to ${options.intake} under the sign-in ${options.account.name}:`,
            listed,
            `closed: moved ${changed}, already stood ${same}, refused ${denied.length}`,
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
