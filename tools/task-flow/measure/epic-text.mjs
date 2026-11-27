// rt-kit v0.42.1 · task-flow/measure/epic-text.mjs · 6a01f795d334 · правится надстройкой, не здесь

/**
 * The plan of an epic: its number, its branch and the rows of its task table, in their order.
 * A row is `| <#> | <KEY>-<n> — <name> | <state> |`; the state «отложено» defers the task,
 * «влито» marks it merged. Any other state, the old mark «шаг владельца» among them, is an ordinary
 * row.
 */
export function epicPlan(text) {
    const epic = text.match(/\*\*Эпик:\*\*\s+[A-Z]+-(\d+)/)?.[1] ?? null;
    const branch = text.match(/\*\*Ветка эпика:\*\*\s+`([^`]+)`/)?.[1] ?? null;
    const rows = [];
    for (const line of text.split('\n')) {
        const m = line.match(/^\|\s*(?:\d+|—|-)\s*\|\s*[A-Z]+-(\d+)\b[^|]*\|\s*([^|]*?)\s*\|\s*$/);
        if (!m) continue;
        const state = m[2];
        rows.push({
            task: Number(m[1]),
            state,
            deferred: state === 'отложено',
            merged: state === 'влито',
        });
    }
    return { epic: epic === null ? null : Number(epic), branch, rows };
}

/** The plan of the epic numbered so among the texts of the plans directory, or null. */
export function findEpicPlan(texts, epic) {
    return texts.map(epicPlan).find((p) => p.epic === epic) ?? null;
}

/** The task number a branch name carries, by the key of the plan, or null. */
export function taskOfBranch(branch) {
    const m = String(branch).match(/^[A-Z]+-(\d+)-[a-z0-9][a-z0-9-]*$/);
    return m ? Number(m[1]) : null;
}
