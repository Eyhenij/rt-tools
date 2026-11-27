// rt-kit v0.41.1 · task-flow/measure/ci.mjs · 888381ddb1b3 · правится надстройкой, не здесь
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
 * The owner's stop word passes a fresh head and nothing else. It lifts the wait, not the watch: a
 * running run still asks for one background watch, whose notice wakes the session when the run
 * ends, and a red run holds until one call reads it. The owner's Esc passes all three: after it a
 * notice does not put the work back on until the owner writes again.
 */
import { epicOfWork } from './epic-of.mjs';
import { interrupted, saidStop } from './owner.mjs';

/** How long a head without a run holds the stop, in minutes: the hosting shows a run within seconds. */
export const FRESH_MINUTES = 2;

/** The conclusions that are no red: the run passed, or did not need to run. */
const NOT_RED = new Set(['success', 'skipped', 'neutral']);

/** A number or a sha as a whole word of a text: «3472» is not found inside «44884034720». */
const names = (text, value) =>
    value !== null && value !== undefined && value !== '' && new RegExp(`(?<![\\w./-])${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text);

/** The text of a call that may name a run: its command, or its whole input. */
const callText = (event) => (typeof event.input?.command === 'string' ? event.input.command : JSON.stringify(event.input ?? {}));

/** The arguments of a command tail, with its redirections cut off: `> /tmp/push.log` names no branch. */
const argsOf = (tail) =>
    tail
        .replace(/\d*&?>>?\s*\S+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((arg) => arg && !arg.startsWith('-') && !/[<>]/.test(arg));

/**
 * A command as the shell splits it into words: a substitution `$(…)` or `\`…\`` is one word, a line
 * continued by a backslash is one line, and a quoted text with a space or a separator in it is one
 * word. The branch of `git push "https://…$(cat t)@…" X` and of `git -c h='!f() { …; }; f' push o X`
 * is X.
 */
const QUOTED_WORD = (quoted) => (/[\s;&|]/.test(quoted) ? 'QUOTED' : quoted);
const flat = (command) => {
    let text = command.replace(/\\\n/g, ' ').replace(/'[^']*'/g, QUOTED_WORD).replace(/`[^`]*`/g, 'SUB');
    for (let before = ''; before !== text; ) [before, text] = [text, text.replace(/\$\([^()]*\)/g, 'SUB')];
    return text.replace(/"[^"]*"/g, QUOTED_WORD);
};

/** An argument without its quotes: `"RT-1-a"` names RT-1-a. */
const unquote = (arg) => arg.replace(/^(['"])(.*)\1$/, '$2');

/** The tail of a command up to its end: `;`, a pipe, `&&` or a lone `&`, not the `&` of `2>&1`. */
const TAIL = String.raw`((?:[^;&|\n]|>&|&>)*)`;

/**
 * The branches the session pushed: { head: the time of the last push }. The time is the result of
 * the call: a push runs the push set for minutes, and the hosting shows the run only after it.
 */
export function pushedHeads(events) {
    const heads = new Map();
    const put = (head, at) => {
        if (!head || head.includes('$')) return;
        heads.set(head, Math.max(heads.get(head) ?? -Infinity, Number.isFinite(at) ? at : -Infinity));
    };
    // A push sent to the background ends with the notice of its task, not with the result of its call.
    const ended = new Map(events.filter((e) => e.kind === 'backgroundEnd' && e.id).map((e) => [e.id, e.at]));
    for (const event of events) {
        if (event.kind !== 'call' || event.blocked || event.failed || event.name !== 'Bash') continue;
        const command = flat(event.input?.command ?? '');
        const at = event.input?.run_in_background ? ended.get(event.id) : Number.isFinite(event.doneAt) ? event.doneAt : event.at;
        // `git checkout -b X && git push origin HEAD` pushes X, not the branch the call started on.
        const switched = (index) => [...command.slice(0, index).matchAll(/\bgit\s+(?:checkout\s+-[bB]|switch\s+-[cC])\s+(\S+)/g)].pop()?.[1] ?? event.branch;
        const own = (ref, index) => (!ref || ref === 'HEAD' ? switched(index) : ref);
        for (const match of command.matchAll(new RegExp(String.raw`\bgit\s+(?:-[Cc]\s+\S+\s+)*push\b${TAIL}`, 'g'))) {
            const refspecs = argsOf(match[1]).map(unquote).slice(1);
            if (refspecs.length === 0) put(switched(match.index), at);
            for (const refspec of refspecs) put(own(refspec.replace(/^\+/, '').split(':').pop().replace(/^refs\/heads\//, ''), match.index), at);
        }
        for (const match of command.matchAll(new RegExp(String.raw`\bgh\s+pr\s+(?:create|new)\b${TAIL}`, 'g'))) {
            // `--head owner:branch` names the branch of a fork: the PR list names it without the owner.
            put(own(/(?:--head|-H)[=\s]+['"]?([^\s'"]+)/.exec(match[1])?.[1]?.replace(/^[^:]+:/, ''), match.index), at);
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

/**
 * A background task watches the run: its command calls the hosting client and names the run, the PR
 * or the head. A log file named after the PR is no watch.
 */
const watches = (task, run, pr) =>
    typeof task.command === 'string' &&
    /\bgh\b[\s\S]*\bwatch\b/.test(task.command) &&
    (names(task.command, run?.id) ||
        names(task.command, pr.number) ||
        names(task.command, pr.head) ||
        (pr.headRefOid && task.command.includes(pr.headRefOid.slice(0, 7))));

/**
 * A command after the end of the run that a hook did not refuse and that did not fail names it, or a
 * read of the output of a watch of it. An edit of a text that names the run reads nothing.
 */
function wasRead(events, run, pr) {
    const outputs = new Set(events.filter((e) => e.kind === 'background' && e.output && watches(e, run, pr)).map((e) => e.output));
    return events.some(
        (event) =>
            event.kind === 'call' &&
            !event.blocked &&
            !event.failed &&
            Number.isFinite(event.at) &&
            event.at > run.endedAt &&
            ((event.name === 'Bash' && /\bgh\b/.test(callText(event)) && names(callText(event), run.id)) ||
                (event.name === 'Bash' && [...outputs].some((output) => callText(event).includes(output))) ||
                (event.name === 'Read' && outputs.has(event.input?.file_path))),
    );
}

/** A base the pipeline wakes for: a name of the list, or a mask with `*`. */
const wakes = (bases, base) =>
    bases === null || bases.some((name) => (name.includes('*') ? new RegExp(`^${name.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*+/g, '.*')}$`).test(base) : name === base));

/**
 * The hold: { kind: 'running' | 'red' | 'fresh', pr, run, file }, or false. `pr` — { number, head,
 * headRefOid, base }; `run` — { id, attempt, conclusion, endedAt }, null for a fresh head; `file` —
 * the pipeline file.
 */
export function hold({ git, host, tree, session, owner }) {
    return (data) => {
        if (owner && interrupted({ owner })(data)) return false;
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
        const { bases, file } = host.pipeline();
        if (Array.isArray(bases) && bases.length === 0) return false;
        const pulls = host.openPulls().filter((p) => heads.has(p.head) && wakes(bases, p.base));
        if (pulls.length === 0) return false;
        const stopped = owner ? saidStop({ owner })(data) : false;
        const now = typeof session.now === 'function' ? session.now() : Date.now();
        const tasks = openTasks(events);
        for (const pr of pulls) {
            const runs = host.runs(pr.headRefOid);
            const red = runs.find((run) => run.status === 'completed' && !NOT_RED.has(run.conclusion) && !wasRead(events, run, pr));
            if (red) return { kind: 'red', pr, run: red, file };
            const running = runs.find((run) => run.status !== 'completed');
            if (running && !tasks.some((task) => watches(task, running, pr))) return { kind: 'running', pr, run: running, file };
            if (runs.length === 0 && !stopped) {
                const since = Math.max(pushes.get(pr.head) ?? -Infinity, Number.isFinite(pr.createdAt) ? pr.createdAt : -Infinity);
                if (now - since < FRESH_MINUTES * 60_000 && !tasks.some((task) => watches(task, null, pr))) return { kind: 'fresh', pr, run: null, file };
            }
        }
        return false;
    };
}
