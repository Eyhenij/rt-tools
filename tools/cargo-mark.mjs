#!/usr/bin/env node
/**
 * The cargo state mark: the command by which the executor moves its own records in the intake.
 *
 * It lives in the tree rather than in the rules package. The records are marked by whoever sorts
 * out the cargo, and that is the tree where the receiver stands; a tree that only installs the
 * package has no intake and no admin panel — there is nobody to call this command there. The sign
 * and its two questions — the rule `agent-kit`.
 *
 * The shape of the cargo is taken from the package: the sending side declares it, and both sides
 * must read one declaration. Of two copies only one is compiled, and they diverge silently.
 *
 * Sorting out the arguments and assembling the body stand apart from the request on purpose:
 * everything that can be refused before the network is refused before it — an unknown state, a
 * call without records and a missing token.
 *
 * A non-zero exit code for everything that did not land: a refused line ends the command with a
 * non-zero code.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const REFUSED = 1;
const TIMEOUT_MS = 15_000;
const TREE_TOKEN_HEADER = 'x-tree-token';

const POSTMORTEM_FLAG = '--postmortem';
const PROPOSAL_FLAG = '--proposal';
const FIX_FLAG = '--fix';
const RELEASE_FLAG = '--release';
const QUARANTINE_FLAG = '--quarantine-note';
const DRY_RUN_FLAG = '--dry-run';
const STATE_FLAG = '--state';

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** The reason for a refusal in a person's words: by each it is visible what to do next. */
const DENIAL_WORDS = {
    missing: 'the tree has no such record',
    forbidden: 'the move is not allowed by the order',
    'no-fix-note': 'a move into the fix without the argument `--fix`',
    'extra-fix-note': 'the argument `--fix` arrived not with a move into the fix',
    'no-release-version': 'a move into the release without the argument `--release`',
    'extra-release-version': 'the argument `--release` arrived not with a move into the release',
    'no-quarantine-note': 'a move into the quarantine without the argument `--quarantine-note`',
    'extra-quarantine-note': 'the argument `--quarantine-note` arrived not with a move into the quarantine',
};

/** The package's cargo shape: the schema version and the state list. Not built — the command says so. */
function shapeOfCargo() {
    const built = join(ROOT, 'dist/agent-kit/lib/cargo.js');

    if (!existsSync(built)) {
        return null;
    }

    return built;
}

/** An argument's value: what stands right after it and is not an argument itself. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** The records named by the launch line's arguments: each has its kind, the order as named. */
export function itemsOf(argv, state, attached = { fixNote: '', releaseVersion: '', quarantineNote: '' }) {
    const items = [];

    for (let at = 0; at < argv.length; at += 1) {
        const kind = argv[at] === POSTMORTEM_FLAG ? 'postmortem' : argv[at] === PROPOSAL_FLAG ? 'proposal' : null;
        const key = argv[at + 1] ?? '';

        if (kind && key && !key.startsWith('--')) {
            // The attached value travels as a field of the line rather than by a call of its own:
            // the mark is one, and all its records were fixed by one sorting out or left in one release
            items.push({
                kind,
                key,
                state,
                ...(attached.fixNote ? { fixNote: attached.fixNote } : {}),
                ...(attached.releaseVersion ? { releaseVersion: attached.releaseVersion } : {}),
                ...(attached.quarantineNote ? { quarantineNote: attached.quarantineNote } : {}),
            });
        }
    }

    return items;
}

/**
 * The tree's sign: a snapshot of its remote ref rather than a directory name on somebody's machine.
 *
 * It is counted by the same technique as on the send, and that technique is taken from the package
 * rather than written here anew. A count of its own has already diverged from the package one
 * silently: it took one last word of the address, and the package the whole address in lower case
 * — and the tree sent the cargo under one sign and marked it under another. The intake answered
 * that with «the tree sign in the cargo belongs to another tree», and not one record was marked.
 */
async function treeSlug(shape) {
    try {
        const { treeSlugOf } = await import(shape.replace(/cargo\.js$/, 'shipment.js'));
        const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();

        return treeSlugOf(remote, '');
    } catch {
        return '';
    }
}

/** The tree's token from the file named by the settings: it lies outside the tree and does not outlive the history. */
function tokenOf(where) {
    if (!where) {
        return '';
    }

    const path = where.startsWith('~') ? join(homedir(), where.slice(1)) : resolve(ROOT, where);

    return existsSync(path) ? readFileSync(path, 'utf8').trim() : '';
}

/** The address of an intake operation. */
function intakeUrl(intake, operation) {
    return `${intake.replace(/\/+$/, '')}/api/intake/${operation}`;
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

/** A request to the intake. A refusal is as much an answer as an accepted one. */
async function callIntake(intake, token, body) {
    let answer;

    try {
        answer = await fetch(intakeUrl(intake, 'states'), {
            method: 'POST',
            headers: { 'content-type': 'application/json', [TREE_TOKEN_HEADER]: token },
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

/** A refused line for a person: the kind, the key and the reason in words. */
function deniedLine(kind, key, denial) {
    return `  ${kind === 'postmortem' ? 'analysis' : 'proposal'} ${key} — ${DENIAL_WORDS[denial] ?? denial}`;
}

/** Mark the tree's records with the named state. */
export async function mark(options) {
    if (!options.states.includes(options.state)) {
        return { code: REFUSED, lines: [`there is no state «${options.state}»`, `there are: ${options.states.join(', ')}`] };
    }

    if (options.items.length === 0) {
        return {
            code: REFUSED,
            lines: [
                'there is nothing to mark: not one record in the arguments',
                `an analysis is named \`${POSTMORTEM_FLAG} <file name>\`, a proposal — \`${PROPOSAL_FLAG} <text sign>\``,
            ],
        };
    }

    if (!options.token) {
        return {
            code: REFUSED,
            lines: [
                'there is no tree token: the mark stayed unsent',
                'a tree is enrolled by the package command `enroll` — by an invitation code or by a token from the intake admin panel',
            ],
        };
    }

    const body = { schema: options.schema, tree: options.tree, items: options.items };

    // The list is printed by both runs, and they are separated not by a verb ending but by the first
    // line: a dry run and a real one differ by two letters at the tail, while the lines under them
    // are the same to the character, and a dry run's output reads as done work.
    const listed = `  ${describe(options.items, options.state)}`;

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                'A DRY RUN — nothing left outward, not one record is moved in the intake',
                `it would have gone to ${options.intake}, tree ${options.tree}:`,
                listed,
                'this is marked by the same call without `--dry-run`',
            ],
        };
    }

    const marked = await options.call(options.intake, options.token, body);

    if (!marked.ok || !marked.accepted) {
        return { code: REFUSED, lines: [`${options.intake} answered ${marked.status || 'with silence'} — ${marked.said}`] };
    }

    const { changed, same, denied } = marked.accepted;

    return {
        code: denied.length ? REFUSED : 0,
        lines: [
            `THE MARK — going to ${options.intake}, tree ${options.tree}:`,
            listed,
            `marked: moved ${changed}, already stood ${same}, refused ${denied.length}`,
            ...denied.map((one) => deniedLine(one.kind, one.key, one.denial)),
        ],
    };
}

async function main() {
    const argv = process.argv.slice(2);
    const shape = shapeOfCargo();

    if (!shape) {
        console.log('the package is not built: the cargo shape is taken from it — `pnpm exec nx build @rt-tools/agent-kit`');
        return REFUSED;
    }

    const { CARGO_SCHEMA_VERSION, CARGO_STATES } = await import(shape);
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const state = valueOf(argv, STATE_FLAG);

    // The intake address and the token are taken from the environment when it names them: that is how
    // a spec puts its own intake next to it and checks the reading of the answer without going to the real one.
    const outcome = await mark({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        tree: await treeSlug(shape),
        token: process.env.RT_TREE_TOKEN ?? tokenOf(config.token ?? ''),
        state,
        schema: CARGO_SCHEMA_VERSION,
        states: CARGO_STATES,
        items: itemsOf(argv, state, {
            fixNote: valueOf(argv, FIX_FLAG),
            releaseVersion: valueOf(argv, RELEASE_FLAG),
            quarantineNote: valueOf(argv, QUARANTINE_FLAG),
        }),
        dryRun: argv.includes(DRY_RUN_FLAG),
        call: callIntake,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-mark.mjs')) {
    main().then((code) => process.exit(code));
}
