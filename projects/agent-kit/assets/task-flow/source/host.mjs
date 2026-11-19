/**
 * The source «source.host» of the task flow description: the hosting and the work queue, read by
 * the board module of the tree and by `git` against the server.
 *
 * Every read is repeated once when it fails; failed twice, it throws `HostSilent`, and `silent()`
 * answers true from then on. A met exit read from the hosting is kept for the life of the branch in
 * the common directory of git (`remember`, `recalled`): exits 2 and 4 do not turn back, and a commit
 * does not drop them. An answer for exits 10–13 lives `TTL_SECONDS`; `reset()` drops it — the hook
 * calls it after a call of the hosting client or of the column command.
 *
 *   issue(number)            { open, status, epic } of a card — `status` is the key of its column —
 *                            or null where there is none
 *   remoteBranch(name)       the server holds the branch
 *   remoteBranches(prefix)   [{ name, sha }] — the branches on the server whose name begins so
 *   remoteContains(sha)      a branch on the server holds the commit
 *   pulls(head)              [{ number, state, base, reviewers, headRefOid }] — the PRs of a branch
 *   mergedPulls()            [{ number, head, headRefOid, base, mergedAt }] — the merged PRs of the repository
 *   inRemote(sha, branch)    the commit lies in `origin/<branch>`
 *   remember(key) / recalled(key)   a met exit kept for the life of the branch
 *   silent()                 a read failed twice
 *   reset()                  drop the answers that live by the clock
 *
 * The board module is the laid-out one: next to the laid-out engine one level up, or in `tools/` of
 * the tree root. The package copy is not imported: its neighbours carry the names of their variants
 * until the layout gives them the tree's names.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { marksDir } from './marks.mjs';

/** How long an answer for exits 10–13 lives. */
export const TTL_SECONDS = 60;

/** The hosting did not answer twice. */
export class HostSilent extends Error {
    constructor(message) {
        super(message);
        this.name = 'HostSilent';
    }
}

const HERE = dirname(fileURLToPath(import.meta.url));
const BOARD = [join(HERE, '..', '..', 'board.mjs'), join(process.cwd(), 'tools', 'board.mjs')].find((p) => existsSync(p));
let board = null;
try {
    board = BOARD ? await import(pathToFileURL(BOARD).href) : null;
} catch {
    // A board module that does not load is the same as none: a read of the hosting then refuses aloud.
    board = null;
}

/** A read repeated once; failed twice, it throws `HostSilent` and calls `onSilent`. */
export function attempt(fn, onSilent = () => {}) {
    try {
        return fn();
    } catch {
        try {
            return fn();
        } catch (error) {
            onSilent();
            throw new HostSilent(error?.message ?? 'the hosting did not answer');
        }
    }
}

const readJson = (file) => {
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
};

/** The answers that live by the clock, kept in one file. */
export function createStore(file) {
    return {
        all: () => (file && readJson(file)) ?? {},
        put(key, entry) {
            if (!file) return;
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, JSON.stringify({ ...this.all(), [key]: entry }));
        },
        reset() {
            if (file) rmSync(file, { force: true });
        },
    };
}

/** The answer under the key while it is younger than `TTL_SECONDS` at `now`, otherwise read anew. */
export function timedRead(store, key, read, now) {
    const hit = store.all()[key];
    if (hit && now - hit.at < TTL_SECONDS) return hit.value;
    const value = read();
    store.put(key, { at: now, value });
    return value;
}

const git = (args) => {
    const out = spawnSync('git', args, { encoding: 'utf8' });
    if (out.status !== 0 && /Could not read from remote|unable to access|Could not resolve/.test(out.stderr ?? '')) {
        throw new Error(out.stderr.trim());
    }
    return out;
};

const heads = (text) =>
    text
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [sha, ref] = line.split('\t');
            return { name: ref.replace('refs/heads/', ''), sha };
        });

/** The key of a column by its name on the board. */
const columnKey = (name) => Object.entries(board?.STATUS_OPTIONS ?? {}).find(([, option]) => option.name === name)?.[0] ?? name;

export function open() {
    const dir = marksDir();
    const store = createStore(dir && join(dir, 'cache', 'answers.json'));
    const metFile = (key) => dir && join(dir, 'cache', 'met', `${key.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
    let silent = false;
    const read = (key, fn) => timedRead(store, key, () => attempt(fn, () => (silent = true)), Date.now() / 1000);
    const need = () => {
        if (!board) throw new Error('source.host: the board module lies neither next to the engine nor in the package');
        return board;
    };

    return {
        issue: (number) =>
            read(`issue:${number}`, () => {
                const state = need().taskState(number);
                return state?.exists ? { open: state.open, status: columnKey(state.status), epic: state.epic } : null;
            }),
        remoteBranch: (name) => read(`remote:${name}`, () => git(['ls-remote', '--heads', 'origin', name]).stdout.trim() !== ''),
        remoteBranches: (prefix) => read(`remotes:${prefix}`, () => heads(git(['ls-remote', '--heads', 'origin', `${prefix}*`]).stdout)),
        remoteContains: (sha) => read(`contains:${sha}`, () => git(['branch', '-r', '--contains', sha]).stdout.trim() !== ''),
        pulls: (head) =>
            read(`pulls:${head}`, () =>
                (need().ghJson(['pr', 'list', '--head', head, '--state', 'all', '--json', 'number,state,baseRefName,headRefOid,reviewRequests,latestReviews']) ?? []).map((p) => ({
                    number: p.number,
                    state: p.state,
                    base: p.baseRefName,
                    headRefOid: p.headRefOid,
                    reviewers: [...(p.reviewRequests ?? []).map((r) => r.login ?? r.name), ...(p.latestReviews ?? []).map((r) => r.author?.login)].filter(Boolean),
                })),
            ),
        mergedPulls: () =>
            read('merged', () =>
                (need().ghJson(['pr', 'list', '--state', 'merged', '--limit', '300', '--json', 'number,headRefName,headRefOid,baseRefName,mergedAt']) ?? []).map((p) => ({
                    number: p.number,
                    head: p.headRefName,
                    headRefOid: p.headRefOid,
                    base: p.baseRefName,
                    mergedAt: p.mergedAt ?? null,
                })),
            ),
        inRemote: (sha, branch) => git(['merge-base', '--is-ancestor', sha, `origin/${branch}`]).status === 0,
        remember(key) {
            const file = metFile(key);
            if (!file) return;
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, '{"met":true}');
        },
        recalled: (key) => Boolean(metFile(key) && readJson(metFile(key))?.met),
        silent: () => silent,
        reset: () => store.reset(),
    };
}
