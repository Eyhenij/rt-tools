#!/usr/bin/env node
// rt-kit v0.25.0 · checks/board-gh.github.mjs · 9d6f7bdaeef7 · правится надстройкой, не здесь
/**
 * The call to the hosting client: how it is found, what it is signed with and what counts as a
 * temporary refusal.
 *
 * Separated from the work with the work queue because the subject here is another one — not a task
 * and not a column, but the call itself: where to get the executable, which token to sign it with,
 * what to read as "there is no network" and what to repeat. Together with the queue this outgrew
 * the file length limit.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { CONFIG } from './rt-kit-checks.config.mjs';

const BOARD = CONFIG.board ?? {};
const BOT_TOKEN_FILE = BOARD.tokenPath ? BOARD.tokenPath.replace(/^~/, homedir()) : '';

/**
 * The owner's `gh` is substituted by a password manager wrapper, and a call by name goes into it.
 * So the real executable is tried first, and only then the name from PATH.
 */
function ghBinary() {
    if (process.env.GH_BIN) {
        return process.env.GH_BIN;
    }
    const homebrew = '/opt/homebrew/bin/gh';
    return existsSync(homebrew) ? homebrew : 'gh';
}

/**
 * The machine account token lies outside the repository and does not get into the output. Its
 * absence is not a refusal: a tree that has not named a token in `board.tokenPath` works with the
 * queue under the account the hosting client is signed in as.
 *
 * The token is supplied by reading a task, moving a column and listing one's own PRs in dispute.
 * Reading a PR goes without it deliberately: the review fields need rights to the organisation
 * accounts, which the machine account was not given, and a request with the token is refused
 * entirely. Whose eyes the answer was taken by is told by the `viewer` field in it.
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
 * A network refusal differs from a refusal on the merits only by its text: `gh` answers
 * both with a non-zero code. What lands here is what leaves nothing to check by — not
 * what was checked and turned out wrong.
 */
function isOffline(stderr) {
    return /dial tcp|no such host|network is unreachable|timeout|TLS handshake|connection refused|Bad credentials|authentication|not logged/i.test(
        stderr
    );
}

/**
 * A refusal that passes by itself: the hosting answered but could not.
 *
 * It differs from a refusal on the merits in that a repeat lifts it: the five-hundred codes, the
 * gateway and its timeout. A refusal by right, by a non-existent record and by an unknown column do
 * not land here — they will not pass on the third try either, and would make one wait.
 */
function isUnavailable(stderr) {
    return /HTTP 50[0234]\b|Bad Gateway|Service Unavailable|Gateway Time-?out|Server Error/i.test(stderr);
}

/** How many times to try a call refused by the hosting being unavailable. */
const TRIES = 3;

/**
 * The pause before the next attempt, twice as long as the previous one. Synchronous: the hosting
 * call here is synchronous too, and moving it into a promise would mean moving everyone who calls
 * it along with it.
 *
 * The number is taken from the environment for the sake of the tests: they need no pause of their
 * own, and are not obliged to wait three seconds for every scenario.
 */
const PAUSE_MS = Number(process.env.RT_GH_RETRY_MS ?? 1000) || 0;

function pause(ms) {
    if (ms > 0) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }
}

export function gh(args, { token } = {}) {
    const env = { ...process.env };
    if (token) {
        env.GH_TOKEN = token;
    }

    let waited = PAUSE_MS;
    for (let attempt = 1; ; attempt += 1) {
        try {
            return execFileSync(ghBinary(), args, { env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        } catch (error) {
            const stderr = String(error.stderr ?? error.message ?? '');
            if (error.code === 'ENOENT' || isOffline(stderr)) {
                throw new OfflineError(stderr.trim() || 'gh is unavailable');
            }
            // The rule demands moving the column by the same motion as the work, and the hosting
            // answered with unavailability for an hour straight: without a repeat the executor
            // either turns the call by hand or leaves the column behind — and the audit finds that
            // only after the PR is opened.
            if (isUnavailable(stderr) && attempt < TRIES) {
                pause(waited);
                waited *= 2;
                continue;
            }
            const failure = new Error(stderr.trim() || `gh ${args[0]} finished with an error`);
            failure.stderr = stderr;
            throw failure;
        }
    }
}

export function ghJson(args, options) {
    return JSON.parse(gh(args, options));
}

export function graphql(query, options) {
    return ghJson(['api', 'graphql', '-f', `query=${query}`], options);
}
