#!/usr/bin/env node
/**
 * Doubles of the task flow sources for the engine suite, and a runner of one measurer over them.
 *
 *   node flow-doubles.mjs <measurer file> <capability> <case.json>   prints `true` or `false`
 *
 * The case names what the sources answer:
 *   branch    the checked-out branch
 *   commits   [{ sha, files: { path: text | null } }] — the branch history, oldest first; a text
 *             writes the file, null removes it, an unnamed file stays as it was
 *   tree      { path: text } — the working copy
 *   main      [path] — the paths the main branch on the server holds in its history
 *   approval  the approval mark of the branch, or null
 *   steps     { "N.M": mark } — the marks of the steps
 *
 * The double of `git` keeps the contract of the real source: the same names, the same answers for
 * the same history. The `steps` source is the real one: it parses text and reads nothing else. The
 * reader gets the words and the forms of the package description, as the engine passes them.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, '..', 'assets');

const inside = (path, key) => key === path || key.startsWith(`${path.replace(/\/$/, '')}/`);

/** The double of `source.git` over a written history. */
export function gitDouble({ branch = '', commits = [], main = [] }) {
    const snapshots = [];
    const changes = [];
    let current = {};
    for (const c of commits) {
        const next = { ...current };
        const change = { sha: c.sha, added: [], deleted: [], modified: [] };
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
    const at = (sha) => snapshots[commits.findIndex((c) => c.sha === sha)];
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
    };
}

/** The double of `source.tree` over written files. */
export function treeDouble(files = {}) {
    return {
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const [file, cap, casePath] = process.argv.slice(2);
    const spec = JSON.parse(readFileSync(casePath, 'utf8'));
    const { buildModel } = await import(pathToFileURL(join(KIT, 'checks', 'flow-model.mjs')).href);
    const { open: openSteps } = await import(pathToFileURL(join(KIT, 'task-flow', 'source', 'steps.mjs')).href);
    const model = buildModel(join(KIT, 'task-flow', 'flow.js'));
    const sources = { git: gitDouble(spec), tree: treeDouble(spec.tree), marks: marksDouble(spec), steps: openSteps() };
    const measurer = await import(pathToFileURL(resolve(file)).href);
    const entry = model.measures.find((m) => resolve(KIT, 'task-flow', m.file) === resolve(file));
    const ports = Object.fromEntries(Object.keys(entry.caps[cap]).map((port) => [port, sources[port]]));
    console.log(String(measurer[cap](ports)({ words: model.words, expect: model.expect })));
}
