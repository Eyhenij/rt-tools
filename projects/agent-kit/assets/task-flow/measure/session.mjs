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
/**
 * The last of the refusals of a stop, the calls and the menus is a refusal of a stop: the move it
 * named was not taken. While a background task of the session runs the stop is a wait, not an idle
 * one: the executor has a move, and it is to wait.
 */
export function idle({ session }) {
    return () => {
        const events = session.events();
        let last = null;
        for (const event of events) if (event.kind === 'refusal' || event.kind === 'call' || event.kind === 'menu') last = event;
        return last?.kind === 'refusal' && running(events, timeOf(session)).length === 0;
    };
}

/** A background task older than this releases nothing and counts as no task, in minutes. */
export const BACKGROUND_BOUND = 20;

const timeOf = (session) => (typeof session.now === 'function' ? session.now() : Date.now());

/**
 * The background tasks of the session that have a start, no end, and are younger than the bound at
 * `now`: [{ id, task, at, spent }]. A task is spent once a turn ended while it ran, and fresh again
 * after the next call of a tool.
 */
function running(events, now) {
    const open = new Map();
    for (const event of events) {
        if (event.kind === 'background') open.set(event.id, { ...event, spent: false });
        else if (event.kind === 'backgroundEnd') {
            for (const [id, task] of open) if (id === event.id || (event.task && task.task === event.task)) open.delete(id);
        } else if (event.kind === 'ended') for (const task of open.values()) task.spent = true;
        else if (event.kind === 'call') for (const task of open.values()) task.spent = false;
    }
    return [...open.values()].filter((task) => Number.isFinite(task.at) && now - task.at < BACKGROUND_BOUND * 60_000);
}

/**
 * The session waits for a background task of its own: a task runs, and no turn ended on it yet with
 * no call since. One task releases one stop — a chain of waits does not keep a turn released.
 */
export function waiting({ session }) {
    return () => running(session.events(), timeOf(session)).some((task) => !task.spent);
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
        return last.by === before.by && last.reason === before.reason ? last.by : false;
    };
}
