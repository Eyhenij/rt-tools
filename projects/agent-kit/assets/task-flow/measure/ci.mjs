/**
 * The measurer «measure.ci» — the CI runs the session answers for. The hold is read before the
 * release cases: a turn does not end over a run nobody watches or a red run nobody read.
 *
 * The PRs judged are the open ones whose branch is the current one, the epic branch of the work, or
 * a branch the session pushed in this record — by `git push`, or named by `--head` of `gh pr create`.
 * A task merged into the epic branch moves the head of the epic's PR without any call of the
 * session, so the epic branch is judged too. Only bases the pipeline wakes for are judged: a PR into
 * another base never gets a run, and waiting for one is a dead end.
 *
 * A run on the head of such a PR holds the stop when:
 *   - it is running, and no background task of the session that has not ended names its number,
 *     the PR number or the head sha — the watch;
 *   - it ended red, and no unrefused call after its end names its number or reads the output of a
 *     watch of it — the read; a watch call stands before the end and reads nothing;
 *   - there is no run yet, and the head was pushed or the PR opened less than `FRESH_MINUTES` ago.
 *
 * The owner's stop word passes a running run and a fresh head; a red attempt that ended after that
 * word still holds the stop until one call reads it.
 */
import { epicOfWork } from './epic-of.mjs';
import { saidStop } from './owner.mjs';

/** How long a head without a run holds the stop, in minutes: the hosting shows a run within seconds. */
export const FRESH_MINUTES = 2;

/** The conclusions that are no red: the run passed, or did not need to run. */
const NOT_RED = new Set(['success', 'skipped', 'neutral']);

/** A number or a sha as a whole word of a text: «3472» is not found inside «44884034720». */
const names = (text, value) => value !== null && value !== undefined && new RegExp(`(?<![\\w])${String(value)}(?![\\w])`).test(text);

/** The text of a call that may name a run: its command, or its whole input. */
const callText = (event) => (typeof event.input?.command === 'string' ? event.input.command : JSON.stringify(event.input ?? {}));

/** The branches the session pushed: { head: the time of the last push }. */
export function pushedHeads(events) {
    const heads = new Map();
    const put = (head, at) => {
        if (!head || head.includes('$') || head === 'HEAD') return;
        heads.set(head, Math.max(heads.get(head) ?? -Infinity, Number.isFinite(at) ? at : -Infinity));
    };
    for (const event of events) {
        if (event.kind !== 'call' || event.blocked || event.name !== 'Bash') continue;
        const command = event.input?.command ?? '';
        for (const match of command.matchAll(/\bgit\s+(?:-[Cc]\s+\S+\s+)*push\b([^;&|\n]*)/g)) {
            const args = match[1].trim().split(/\s+/).filter((arg) => arg && !arg.startsWith('-') && !/^\d?>/.test(arg));
            const refspec = args.length > 1 ? args[args.length - 1] : null;
            put(refspec ? refspec.replace(/^\+/, '').split(':').pop().replace(/^refs\/heads\//, '') : event.branch, event.at);
        }
        for (const match of command.matchAll(/\bgh\s+pr\s+(?:create|new)\b([^;&|\n]*)/g)) {
            put(/--head[=\s]+['"]?([^\s'"]+)/.exec(match[1])?.[1] ?? event.branch, event.at);
        }
    }
    return heads;
}

/** The background tasks of the session that started and have not ended: [{ command, output }]. */
function openTasks(events) {
    const open = new Map();
    for (const event of events) {
        if (event.kind === 'background') open.set(event.id, event);
        else if (event.kind === 'backgroundEnd') {
            if (event.id) open.delete(event.id);
            else for (const [id, task] of open) if (event.task && task.task === event.task) open.delete(id);
        }
    }
    return [...open.values()];
}

/** A background task watches the run: its command names the run, the PR or the head. */
const watches = (task, run, pr) =>
    typeof task.command === 'string' && (names(task.command, run?.id) || names(task.command, pr.number) || (pr.headRefOid && task.command.includes(pr.headRefOid.slice(0, 7))));

/** An unrefused call after the end of the run names it, or reads the output of a watch of it. */
function wasRead(events, run, pr) {
    const outputs = new Set(events.filter((e) => e.kind === 'background' && e.output && watches(e, run, pr)).map((e) => e.output));
    return events.some(
        (event) =>
            event.kind === 'call' &&
            !event.blocked &&
            Number.isFinite(event.at) &&
            event.at > run.endedAt &&
            (names(callText(event), run.id) || (event.name === 'Read' && outputs.has(event.input?.file_path))),
    );
}

/**
 * The hold: { kind: 'running' | 'red' | 'fresh', pr, run }, or false. `pr` — { number, head,
 * headRefOid, base }; `run` — { id, attempt, conclusion, endedAt }, null for a fresh head.
 */
export function hold({ git, host, tree, session, owner }) {
    return (data) => {
        const events = session.events();
        const pushes = pushedHeads(events);
        const heads = new Set(pushes.keys());
        const branch = git.branch();
        if (branch) heads.add(branch);
        let epic = null;
        try {
            epic = epicOfWork({ git, host, tree })?.branch ?? null;
        } catch (error) {
            if (error?.name !== 'HostSilent') throw error;
        }
        if (epic) heads.add(epic);
        const { bases } = host.pipeline();
        if (Array.isArray(bases) && bases.length === 0) return false;
        const pulls = host.openPulls().filter((p) => heads.has(p.head) && (bases === null || bases.includes(p.base)));
        if (pulls.length === 0) return false;
        const stopped = saidStop({ owner })(data);
        const stopAt = typeof session.ownerAt === 'function' ? session.ownerAt() : null;
        const now = typeof session.now === 'function' ? session.now() : Date.now();
        const tasks = openTasks(events);
        for (const pr of pulls) {
            const runs = host.runs(pr.headRefOid);
            const red = runs.find((run) => run.status === 'completed' && !NOT_RED.has(run.conclusion) && !wasRead(events, run, pr));
            if (red && !(stopped && Number.isFinite(stopAt) && red.endedAt <= stopAt)) return { kind: 'red', pr, run: red };
            if (stopped) continue;
            const running = runs.find((run) => run.status !== 'completed');
            if (running && !tasks.some((task) => watches(task, running, pr))) return { kind: 'running', pr, run: running };
            if (runs.length === 0) {
                const since = Math.max(pushes.get(pr.head) ?? -Infinity, Number.isFinite(pr.createdAt) ? pr.createdAt : -Infinity);
                if (now - since < FRESH_MINUTES * 60_000 && !tasks.some((task) => watches(task, null, pr))) return { kind: 'fresh', pr, run: null };
            }
        }
        return false;
    };
}
