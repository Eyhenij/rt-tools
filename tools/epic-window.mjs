#!/usr/bin/env node
// rt-kit v0.40.0 · checks/epic-window.mjs · a2477c16544f · правится надстройкой, не здесь
/**
 * The windows of an epic, built from the observations of the tree: the hook at the end of a turn
 * writes the events of the session records, the reading of merges writes the merges.
 *
 * A window opens at a merge of a task request into the epic branch (`task-merged` with `opens`). It
 * closes at the first of three events after the opening:
 *   - the next such merge into the same epic branch;
 *   - the merge of the epic request into the main branch (`epic-merged`);
 *   - the owner message that opens a turn with an incident analysis, written after the session left
 *     the epic branch itself. An analysis written while the session stands on the epic branch is a
 *     part of the work on the epic: on 13 November one was written at 01:56 in the middle of it.
 * A window none of them closed by the end of the report day is open up to that end.
 *
 * A window counts the sessions that stood on the epic branch or on the branch of a task of the epic
 * within it, each whole inside the window, and only the moments inside it: a turn that runs past the
 * end is cut at the end.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const endOf = (day) => `${day}T23:59:59.999Z`;

/** The tasks of an epic: the epic itself and every task merged into its branch. */
export function epicTasksOf(observations, epic) {
    return new Set([epic, ...observations.filter((o) => o.ev === 'task-merged' && o.epic === epic).map((o) => o.task)]);
}

/**
 * The moments that close a window by an analysis: per analysis change, the last typed owner word of
 * the same session before it, when the session stood then on a task of the epic but not on the epic
 * branch.
 */
export function analysisStartsOf(observations, epic, tasks) {
    const words = observations.filter((o) => o.ev === 'record-word' && o.kind === 'typed').sort((a, b) => String(a.t).localeCompare(String(b.t)));
    const out = [];
    for (const change of observations.filter((o) => o.ev === 'record-change' && o.analysis)) {
        const opening = words.filter((w) => w.sid === change.sid && w.t <= change.t).at(-1);
        if (opening && opening.task !== epic && tasks.has(opening.task)) out.push(opening.t);
    }
    return [...new Set(out)].sort();
}

/** The windows of every epic opened by the end of the day, each with its counts. */
export function epicWindows(observations, day) {
    const end = endOf(day);
    const seen = observations.filter((o) => String(o.t) <= end);
    // A merge into the branch of an epic already merged into the main branch opens nothing: the epic is over.
    const epicMergedAt = new Map(seen.filter((o) => o.ev === 'epic-merged').map((o) => [o.task, o.t]));
    const openings = seen
        .filter((o) => o.ev === 'task-merged' && o.opens && o.epic && !(epicMergedAt.get(o.epic) < o.t))
        .sort((a, b) => String(a.t).localeCompare(String(b.t)));
    const out = [];
    for (const opening of openings) {
        const epic = opening.epic;
        const tasks = epicTasksOf(seen, epic);
        const closers = [
            ...openings.filter((o) => o.epic === epic && o.t > opening.t).map((o) => ({ t: o.t, by: 'task-merged' })),
            ...seen.filter((o) => o.ev === 'epic-merged' && o.task === epic && o.t > opening.t).map((o) => ({ t: o.t, by: 'epic-merged' })),
            ...analysisStartsOf(seen, epic, tasks).filter((t) => t > opening.t).map((t) => ({ t, by: 'analysis' })),
        ].sort((a, b) => String(a.t).localeCompare(String(b.t)));
        const close = closers[0] ?? null;
        const to = close ? close.t : end;
        const inside = seen.filter((o) => o.t >= opening.t && o.t < to);
        const sessions = new Set(inside.filter((o) => String(o.ev).startsWith('record-') && tasks.has(o.task)).map((o) => o.sid));
        const ofWindow = inside.filter((o) => sessions.has(o.sid));
        const refusals = ofWindow.filter((o) => o.ev === 'record-refusal');
        const byKind = {};
        for (const r of refusals) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
        out.push({
            epic,
            from: opening.t,
            to: close ? close.t : null,
            closedBy: close ? close.by : 'open',
            calls: ofWindow.filter((o) => o.ev === 'record-call').length,
            refusals: refusals.length,
            byKind,
            reasks: ofWindow.filter((o) => o.ev === 'record-ask' && o.reask).length,
        });
    }
    return out;
}

/** Every observation line under a directory of day files. */
export function readObservations(dir) {
    const out = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.jsonl'))) {
        for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
            if (!line.trim()) continue;
            try {
                out.push(JSON.parse(line));
            } catch {
                // A broken line is no observation.
            }
        }
    }
    return out;
}
