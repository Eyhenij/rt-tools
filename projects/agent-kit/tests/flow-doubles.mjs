#!/usr/bin/env node
/**
 * Doubles of the task flow sources for the engine suite, and a runner of one measurer over them.
 *
 *   node flow-doubles.mjs <measurer file> <capability> <case.json>   prints `true` or `false`
 *
 * The case names what the sources answer:
 *   branch    the checked-out branch
 *   commits   [{ sha, text, own, files: { path: text | null } }] — the branch history, oldest first; a
 *             text writes the file, null removes it, an unnamed file stays as it was; `text` is the
 *             message, `own: false` — a commit a merge brought
 *   tree      { path: text } — the working copy
 *   main      [path] — the paths the main branch on the server holds in its history
 *   approval  the approval mark of the branch, or null; `placed(answer, plan)` writes one with a place
 *   answers   { uuid: text } — the menu answers the owner chose, by the uuid of their entry
 *   steps     { "N.M": mark } — the marks of the steps
 *   local     [{ name, sha }] — the local branches
 *   host      what the hosting answers, see `hostDouble`
 *   owner     [text] — the messages the owner typed
 *   copyEpic  the epic the assignment table gives the working copy, or null
 *
 * The double of `git` keeps the contract of the real source: the same names, the same answers for
 * the same history. The `steps` source is the real one: it parses text and reads nothing else. The
 * reader gets the words and the forms of the package description, as the engine passes them.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { approvalFault as realFault } from '../assets/task-flow/source/records.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, '..', 'assets');

/** The record every placed mark names: a file that exists, so the record double confirms it. */
export const RECORD = fileURLToPath(import.meta.url);

/** An approval mark whose place is the entry `uuid` of the record double. */
export const placed = (answer, plan, uuid = 'a1') => ({ answer, plan, place: { record: RECORD, uuid } });

const inside = (path, key) => key === path || key.startsWith(`${path.replace(/\/$/, '')}/`);

/** The double of `source.git` over a written history. */
export function gitDouble({ branch = '', commits = [], main = [], local = [] }) {
    const snapshots = [];
    const changes = [];
    let current = {};
    for (const c of commits) {
        const next = { ...current };
        const change = { sha: c.sha, text: c.text ?? '', own: c.own ?? true, added: [], deleted: [], modified: [] };
        for (const [path, text] of Object.entries(c.files ?? {})) {
            if (text === null) {
                if (path in next) change.deleted.push(path);
                delete next[path];
            } else {
                if (!(path in next)) change.added.push(path);
                else if (next[path] !== text) change.modified.push(path);
                next[path] = text;
            }
        }
        snapshots.push(next);
        changes.push(change);
        current = next;
    }
    const at = (sha) => snapshots[commits.findIndex((c) => c.sha === sha.replace(/\^$/, '')) - (sha.endsWith('^') ? 1 : 0)];
    return {
        branch: () => branch,
        commits: () => changes,
        versionAt: (path, sha) => at(sha)?.[path] ?? null,
        lastVersion(path) {
            for (const s of [...snapshots].reverse()) if (path in s) return s[path];
            return null;
        },
        addedBy: (path) => changes.find((c) => c.added.includes(path))?.sha ?? null,
        everExisted: (path) => snapshots.some((s) => Object.keys(s).some((k) => inside(path, k))) || main.some((k) => inside(path, k)),
        existsAtHead: (path) => Object.keys(snapshots.at(-1) ?? {}).some((k) => inside(path, k)),
        branches: (prefix) => local.filter((b) => b.name.startsWith(prefix)),
        head: () => commits.at(-1)?.sha ?? '',
        filesAt: (dir, sha) => Object.keys(at(sha) ?? {}).filter((k) => dir === '.' || inside(dir, k)),
    };
}

/**
 * The double of `source.host`. `issues` — { number: { open, status, epic } }; `remote` — the
 * branches on the server [{ name, sha }]; `contains` — the commits a branch on the server holds;
 * `pulls` — { head: [{ number, state, base, reviewers, headRefOid }] }; `merged` — the merged PRs;
 * `landed` — { branch: [sha] }, the commits `origin/<branch>` holds; `met` — exits kept before.
 * `silent: true` makes every read throw `HostSilent`.
 */
export function hostDouble({
    issues = {},
    remote = [],
    contains = [],
    pulls = {},
    merged = [],
    landed = {},
    met = [],
    silent = false,
} = {}) {
    const kept = new Set(met);
    const answer = (value) => {
        if (silent) {
            const error = new Error('the hosting did not answer twice');
            error.name = 'HostSilent';
            throw error;
        }
        return value;
    };
    return {
        issue: (number) => answer(issues[number] ?? null),
        remoteBranch: (name) => answer(remote.some((b) => b.name === name)),
        remoteBranches: (prefix) => answer(remote.filter((b) => b.name.startsWith(prefix))),
        remoteContains: (sha) => answer(contains.includes(sha)),
        pulls: (head) => answer(pulls[head] ?? []),
        mergedPulls: () => answer(merged),
        inRemote: (sha, branch) => answer((landed[branch] ?? []).includes(sha)),
        remember: (key) => kept.add(key),
        recalled: (key) => kept.has(key),
        silent: () => silent,
        reset: () => {},
    };
}

/** The double of `source.owner`: the messages the owner typed. */
export function ownerDouble(messages = []) {
    return { messages: () => messages, said: (quote) => messages.some((text) => text.includes(quote)) };
}

/** The double of `source.tree` over written files, with the epic the copy is assigned. */
export function treeDouble(files = {}, copyEpic = null) {
    return {
        copyEpic: () => copyEpic,
        read: (path) => files[path] ?? null,
        exists: (path) => Object.keys(files).some((k) => inside(path, k)),
        list(dir) {
            const prefix = `${dir.replace(/\/$/, '')}/`;
            return [
                ...new Set(
                    Object.keys(files)
                        .filter((k) => k.startsWith(prefix))
                        .map((k) => k.slice(prefix.length).split('/')[0])
                ),
            ].sort();
        },
    };
}

/** The double of `source.marks`: the marks belong to the branch of the case and to no other. */
export function marksDouble({ branch = '', approval = null, steps = {} }) {
    return {
        approval: (asked) => (asked === branch ? approval : null),
        step: (asked, number) => (asked === branch ? (steps[number] ?? null) : null),
    };
}

/**
 * The double of `source.records`: every path is a session record of this repository, and the entry
 * of a uuid is the owner's menu answer the case names. A placed mark answers its own text unless the
 * case names another for its uuid.
 */
export function recordsDouble(answers = {}, approval = null) {
    const own = approval?.place?.uuid ? { [approval.place.uuid]: approval.answer } : {};
    const all = { ...own, ...answers };
    const api = {
        holds: (path) => (typeof path === 'string' && path.endsWith('.jsonl')) || path === RECORD,
        entry: (_path, uuid) => (uuid in all ? { type: 'user', uuid, toolUseResult: { answers: { q: all[uuid] } } } : null),
    };
    api.approvalFault = (mark, planSha, task) => realFault(mark, planSha, task, api);
    return api;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const [file, cap, casePath] = process.argv.slice(2);
    const spec = JSON.parse(readFileSync(casePath, 'utf8'));
    const { buildModel } = await import(pathToFileURL(join(KIT, 'checks', 'flow-model.mjs')).href);
    const { open: openSteps } = await import(pathToFileURL(join(KIT, 'task-flow', 'source', 'steps.mjs')).href);
    const model = buildModel(join(KIT, 'task-flow', 'flow.js'));
    const sources = {
        git: gitDouble(spec),
        tree: treeDouble(spec.tree, spec.copyEpic ?? null),
        marks: marksDouble(spec),
        records: recordsDouble(spec.answers, spec.approval),
        steps: openSteps(),
        host: hostDouble(spec.host),
        owner: ownerDouble(spec.owner),
    };
    const measurer = await import(pathToFileURL(resolve(file)).href);
    const entry = model.measures.find((m) => resolve(KIT, 'task-flow', m.file) === resolve(file));
    const ports = Object.fromEntries(Object.keys(entry.caps[cap]).map((port) => [port, sources[port]]));
    console.log(String(measurer[cap](ports)({ words: model.words, expect: model.expect })));
}
