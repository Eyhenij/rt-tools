#!/usr/bin/env node
// rt-kit v0.41.0 · checks/flow-override.mjs · 1550a2d34aa4 · правится надстройкой, не здесь
/**
 * The tree override of the task flow description: the same language, merged with the package
 * description key by key before the model is built.
 *
 * The override holds only the sections it changes. An entry of a section — a source, a measurer, a
 * state, a release case, a word list, a form — is added when the package has no such key and is
 * replaced whole when it has one. A source or a measurer the override names lies next to the
 * override, in its own `source/` or `measure/`, and passes the same contract as a package one.
 *
 * A key of the package is removed only by `null` with the key `reason` next to it in the same
 * section: `state: { epic: null, reason: 'this tree keeps no epics' }`. Without a reason the
 * description does not build — a silent removal would leave the reader of the package text sure the
 * key still works. A reason with nothing removed is refused too, and so is `null` over a key the
 * package does not have. The removed keys come out in `changes`, and the engine prints them.
 *
 * A state of the override stands after the state its field `after` names — a reference
 * `state.<key>` or the key as a string; without the field a new state goes to the end and a replaced
 * one keeps its place. Several states after one state keep the order of the override. A release
 * case goes by its `order`, and a repeated order is refused by the model, as in the package.
 *
 * The module has no command line of its own: the model calls it with the parsed texts, and the
 * engine asks it where the override lies and what lines name the removed keys.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Call, Ref, SECTIONS } from './flow-syntax.mjs';

/** The key of a section of the override that carries the reason of a removal. */
export const REASON = 'reason';

/** The tree override of the description, relative to the root of the tree. */
export const OVERRIDE_PATH = '.claude/rt-kit/overrides/task-flow/flow.js';

/**
 * The override the engine merges: the one named, or the tree's own when it lies in the tree and no
 * other description is named — a description named by hand is read as it is written. Returns a
 * path or undefined.
 */
export function overridePath(given, flowGiven) {
    if (given) return given;
    if (flowGiven) return undefined;
    const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim() || process.cwd();
    const path = join(root, OVERRIDE_PATH);
    return existsSync(path) ? path : undefined;
}

/** The lines the engine prints for the keys the override removed, each with its reason. */
export function removedLines(model) {
    return (model.changes ?? []).filter((c) => c.kind === 'removed').map((c) => `removed by the tree: ${c.key} — ${c.reason}`);
}

const plain = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Ref) && !(value instanceof Call);

/** The state an `after` names: its key, or a refusal. */
function afterKey(value, where, fail) {
    if (typeof value === 'string' && value !== '') return value;
    if (value instanceof Ref && value.path[0] === 'state' && value.path.length === 2) return value.path[1];
    return fail(`${where}: «after» names a state — «state.<key>» or its key as a string`);
}

/** Puts the states of the override in their places: replaced in place, `after` behind its state. */
function placeStates(base, over, changes, fail) {
    const list = Object.entries(base);
    const behind = new Map();
    for (const [key, value] of Object.entries(over)) {
        if (value === null) continue;
        if (!plain(value)) fail(`override state.${key}: a state is an object`);
        const { after, ...state } = value;
        const at = list.findIndex(([k]) => k === key);
        changes.push({ kind: at >= 0 ? 'replaced' : 'added', key: `state.${key}`, ...(after === undefined ? {} : { after: afterKey(after, `override state.${key}`, fail) }) });
        if (after === undefined) {
            if (at >= 0) list[at] = [key, state];
            else list.push([key, state]);
            continue;
        }
        const target = afterKey(after, `override state.${key}`, fail);
        if (at >= 0) list.splice(at, 1);
        const index = list.findIndex(([k]) => k === target);
        if (index < 0) fail(`override state.${key}.after: «${target}» names no state of the description`);
        const shift = behind.get(target) ?? 0;
        list.splice(index + 1 + shift, 0, [key, state]);
        behind.set(target, shift + 1);
    }
    return Object.fromEntries(list);
}

/**
 * Merges a parsed override into a parsed package description. `dir` is the directory of the
 * override. Returns `{ description, origins, changes }`: `origins` maps `source.<entry>` and
 * `measure.<entry>` of the override to `dir`, `changes` lists `{ kind, key, reason?, after? }` with
 * `kind` one of `added`, `replaced`, `removed`.
 */
export function mergeOverride(base, over, dir, fail) {
    if (!plain(over)) fail('override: the override is one object of sections');
    const description = { ...base };
    const origins = new Map();
    const changes = [];
    for (const [section, entries] of Object.entries(over)) {
        if (!SECTIONS.includes(section)) fail(`override: «${section}» is not one of the six sections`);
        if (!plain(entries)) fail(`override ${section}: a section is an object of entries`);
        const removed = Object.keys(entries).filter((key) => key !== REASON && entries[key] === null);
        const hasReason = REASON in entries;
        const reason = entries[REASON];
        if (hasReason && (typeof reason !== 'string' || reason.trim() === '')) fail(`override ${section}.${REASON}: the reason is a non-empty string`);
        if (hasReason && removed.length === 0) fail(`override ${section}.${REASON}: a reason stands only next to a null that removes a key`);
        const own = { ...(plain(base[section]) ? base[section] : {}) };
        for (const key of removed) {
            if (!hasReason) fail(`override ${section}.${key}: null removes a key of the package only with a reason next to it — ${REASON}: '…'`);
            if (!(key in own)) fail(`override ${section}.${key}: null removes nothing — the package has no «${key}»`);
            delete own[key];
            changes.push({ kind: 'removed', key: `${section}.${key}`, reason });
        }
        const kept = Object.fromEntries(Object.entries(entries).filter(([key, value]) => key !== REASON && value !== null));
        if (section === 'state') {
            description.state = placeStates(own, kept, changes, fail);
            continue;
        }
        for (const [key, value] of Object.entries(kept)) {
            changes.push({ kind: key in own ? 'replaced' : 'added', key: `${section}.${key}` });
            own[key] = value;
            if (section === 'source' || section === 'measure') origins.set(`${section}.${key}`, dir);
        }
        description[section] = own;
    }
    return { description, origins, changes };
}
