// rt-kit v0.38.0 · task-flow/measure/session.mjs · 36545ffd63b9 · правится надстройкой, не здесь
/**
 * The measurer «measure.session» — what this session did: a write to the tree, a role it runs as, a
 * menu of a refusal that did not reach the owner, a step another check forbids, a stop after a
 * refusal of a stop with no call in between, and a wait for a background task of its own.
 */
/** The tools that edit a file. */
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

/** The session wrote to the tree: an edit of a file, or a command of the work of `words.write`. */
export function wrote({ session }) {
    return ({ words, rules }) =>
        session.toolUses().some((use) => EDIT_TOOLS.has(use.name) || (use.name === 'Bash' && rules.isWriteCommand(use.input.command ?? '', words)));
}

/** The session runs as a role whose header gives it no edit tool: its report is its work. */
export function role({ session }) {
    return () => {
        const tools = session.roleTools(session.agent());
        if (!tools || tools.includes('*')) return false;
        return !/(?:^|[^\w])(?:Write|Edit|MultiEdit|NotebookEdit)(?:[^\w]|$)/.test(tools);
    };
}

/**
 * The menu of a refusal did not reach the owner a second time in a row: the last two refusals name
 * the menu of `words.menu`, after each the agent called the menu, and no call was answered.
 */
export function menuLost({ session }) {
    return ({ words }) => {
        const options = (words.menu ?? []).map((option) => option.replace(/RT-N$/, ''));
        if (options.length === 0) return false;
        let streak = 0;
        let awaiting = false;
        for (const event of session.events()) {
            if (event.kind === 'refusal') {
                // A refusal with a menu the agent never tried to ask breaks the streak, as does any
                // refusal that names no menu.
                if (awaiting) streak = 0;
                awaiting = options.every((option) => event.text.includes(option));
                if (!awaiting) streak = 0;
            } else if (event.kind === 'menu' && awaiting) {
                streak = event.answered ? 0 : streak + 1;
                awaiting = false;
            }
        }
        return streak >= 2;
    };
}

/**
 * Another check forbids the step: the last two refusals of calls come from the same guard for the
 * same reason, and no call wrote to the tree after the first of them. Answers the name of the guard,
 * or false — the exit check then names the owner's menu about that guard.
 */
/** The hook of the engine itself, the one that holds a turn by the scenario. */
const ENGINE_HOOK = 'turn-exit-guard';

/**
 * The refusals of a stop stand after the last call and menu: the move they named was not taken. The
 * stop is idle when one of them is the engine's own, or names no hook: true. When every one of them
 * is another hook's, the stop is no idle one: { foreign: <the hook of the last of them> }. While a
 * background task of the session runs the stop is a wait, not an idle one: the executor has a move,
 * and it is to wait.
 */
export function idle({ session }) {
    return () => {
        const events = session.events();
        let refusals = [];
        for (const event of events) {
            if (event.kind === 'call' || event.kind === 'menu') refusals = [];
            else if (event.kind === 'refusal') refusals.push(event);
        }
        if (refusals.length === 0 || running(events, timeOf(session)).tasks.length > 0 || unreadOf(events) !== null) return false;
        if (refusals.some((refusal) => !refusal.by || refusal.by === ENGINE_HOOK)) return true;
        return { foreign: refusals[refusals.length - 1].by };
    };
}

/**
 * The background task of the session whose notice has not reached it: { task, output, agent }, or null. A
 * task is unread when its start stands in the record, its notice ended it with a result, and no call
 * or menu followed that notice: the notice reaches the session only when the turn goes on, and a
 * call is the first sign it went on. A task the session stopped itself, or one the harness killed,
 * holds nothing.
 */
function unreadOf(events) {
    const started = new Map();
    const unread = new Map();
    for (const event of events) {
        if (event.kind === 'background' && event.task) {
            // An agent a message resumed runs again under the same number and sends a notice again.
            started.set(event.task, { ...event, over: false });
            unread.delete(event.task);
        } else if (event.kind === 'backgroundEnd') {
            // A notice that names its call ends that run alone, as in the count of running tasks: a
            // late copy of the notice of a former run does not end the run a message resumed.
            const task = event.id ? [...started.values()].find((one) => one.id === event.id) : started.get(event.task);
            if (!task || task.over) continue;
            task.over = true;
            if (event.stopped || event.status === 'killed' || event.status === 'stopped') continue;
            unread.set(task.task, { task: task.task, output: event.output ?? task.output ?? null, agent: Boolean(task.agent) });
        } else if (event.kind === 'call' || event.kind === 'menu') unread.clear();
    }
    return [...unread.values()].pop() ?? null;
}

/** The measurer «measure.session.unread»: the unread background task of the session, or false. */
export function unread({ session }) {
    return () => unreadOf(session.events()) ?? false;
}

/** The command of a background watch of a CI run: the hosting client with `run watch` or `--watch`. */
const CI_WATCH = /\bgh\b[\s\S]*(?:\brun\s+watch\b|--watch\b)/;

/** A background task older than this releases nothing and counts as no task, in minutes. */
export const BACKGROUND_BOUND = 20;

const timeOf = (session) => (typeof session.now === 'function' ? session.now() : Date.now());

/**
 * The background tasks of the session that have a start, no end, and are younger than the bound at
 * `now`, and how many of the open tasks have released their stop: { tasks, spent }.
 */
function running(events, now) {
    const open = new Map();
    // The calls whose end stands in the record before their start: a command that finished at once.
    const over = new Set();
    // How many of the open tasks have released their stop: an ended turn takes one, the end of a
    // task gives one back, and a call of a tool gives all back.
    let spent = 0;
    const close = (id) => {
        if (!open.delete(id)) return false;
        spent = Math.max(0, spent - 1);
        return true;
    };
    for (const event of events) {
        // A watch of a CI run is no wait: the CI hold asks for it, and the work goes on while it runs.
        if (event.kind === 'background' && CI_WATCH.test(event.command ?? '')) continue;
        if (event.kind === 'background') {
            if (!over.has(event.id)) open.set(event.id, event);
        } else if (event.kind === 'backgroundEnd') {
            // A notice that names its call ends that run alone: an agent a message resumed runs
            // under a new call, and a late copy of the notice of its former run does not end it.
            if (event.id) {
                if (!close(event.id)) over.add(event.id);
            } else for (const [id, task] of open) if (event.task && task.task === event.task) close(id);
        } else if (event.kind === 'ended') spent = Math.min(open.size, spent + 1);
        else if (event.kind === 'call') spent = 0;
    }
    // A start stamped ahead of the clock by more than a minute is no start to wait for.
    const age = (task) => now - task.at;
    const tasks = [...open.values()].filter((task) => Number.isFinite(task.at) && age(task) < BACKGROUND_BOUND * 60_000 && age(task) > -60_000);
    return { tasks, spent };
}

/**
 * The session waits for a background task of its own: more tasks run than turns ended on them with
 * no call since. One task releases one stop — a chain of waits does not keep a turn released, and
 * two tasks release two stops: the notice of the first wakes the session while the second runs.
 */
export function waiting({ session }) {
    return () => {
        const { tasks, spent } = running(session.events(), timeOf(session));
        return tasks.length > spent;
    };
}

export function forbidden({ session }) {
    return ({ words, rules }) => {
        const writes = (event) =>
            event.kind === 'call' &&
            !event.blocked &&
            (EDIT_TOOLS.has(event.name) || (event.name === 'Bash' && rules.isWriteCommand(event.input.command ?? '', words)));
        let last = null;
        let before = null;
        for (const event of session.events()) {
            if (event.kind === 'blocked') {
                before = last;
                last = event;
            } else if (writes(event)) {
                before = null;
                last = null;
            }
        }
        if (!last || !before) return false;
        // While a background task ended unread, the move is to read it, not the owner's menu.
        if (unreadOf(session.events()) !== null) return false;
        return last.by === before.by && last.reason === before.reason ? last.by : false;
    };
}
