/**
 * The source «source.session» of the task flow description: what this session did, read from the
 * record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`, and the role it runs as, named
 * by the hook in `RT_FLOW_AGENT`.
 *
 *   toolUses()       the calls of the agent, oldest first: { name, input }
 *   events()         what happened in the record, oldest first: a refusal at the end of a turn
 *                    { kind: 'refusal', text }, a menu { kind: 'menu', answered }, a call of a tool
 *                    { kind: 'call', name, input, blocked }, a refusal of a call by a hook
 *                    { kind: 'blocked', by, reason }, the start of a background task
 *                    { kind: 'background', id, task, at }, its end { kind: 'backgroundEnd', id, task }
 *                    and a turn that ended { kind: 'ended' }
 *   now()            the time the session is judged at, in milliseconds
 *   agent()          the role the session runs as, or null
 *   roleTools(role)  the `tools:` line of the role's header, or null
 *
 * Without a record the session did nothing: no write, no refusal, no menu.
 */
import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

/** The text a refusal at the end of a turn arrives with. */
const STOP_FEEDBACK = /^Stop hook feedback:/;
/** A hook refused a call: the result of the call names the guard that refused it. */
const CALL_REFUSAL = /hook error:[\s\S]*?BLOCKED by ([\w-]+):\s*([^\n]*)/;

/** The end of a background task in its notice. */
const TASK_OVER = /<status>(?:completed|failed|killed|stopped)<\/status>/;
/** A notice with a final status of an agent that goes on: it stopped with background work of its own and notifies again. */
const STILL_RUNNING = /<summary>[^<]*is waiting on its own background work<\/summary>/;
/** A refusal of a stop hook in the summary of the stop hooks. */
const STOP_BLOCK = /BLOCKED by |"decision"\s*:\s*"block"/;
/** The tools whose call ends a background task. */
const STOP_TOOLS = new Set(['TaskStop', 'KillShell', 'KillBash']);

/**
 * The lines of a file, read by pieces of `piece` bytes: a record longer than one string of the
 * runtime is never held whole. A line cut by the edge of a piece is put together from its parts.
 */
export function* linesOf(file, piece = 1 << 22) {
    const fd = openSync(file, 'r');
    const chunk = Buffer.alloc(piece);
    let rest = [];
    try {
        for (let read; (read = readSync(fd, chunk, 0, chunk.length, null)) > 0; ) {
            let start = 0;
            for (let at = chunk.indexOf(10, 0); at !== -1 && at < read; at = chunk.indexOf(10, start)) {
                if (rest.length === 0) yield chunk.toString('utf8', start, at);
                else {
                    rest.push(Buffer.from(chunk.subarray(start, at)));
                    yield Buffer.concat(rest).toString('utf8');
                    rest = [];
                }
                start = at + 1;
            }
            if (start < read) rest.push(Buffer.from(chunk.subarray(start, read)));
        }
    } finally {
        closeSync(fd);
    }
    if (rest.length > 0) yield Buffer.concat(rest).toString('utf8');
}

const parse = (file) => {
    if (!file || !existsSync(file)) return [];
    const entries = [];
    for (const line of linesOf(file)) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            // A broken line is no entry.
        }
    }
    return entries;
};

const parts = (entry) => (Array.isArray(entry?.message?.content) ? entry.message.content : []);

const feedbackText = (entry) => {
    const content = entry?.message?.content;
    const text = typeof content === 'string' ? content : parts(entry).map((part) => (part?.type === 'text' ? part.text : '')).join('\n');
    return STOP_FEEDBACK.test(text) ? text : null;
};

const resultText = (part) =>
    typeof part.content === 'string'
        ? part.content
        : Array.isArray(part.content)
          ? part.content.map((piece) => (piece?.type === 'text' ? piece.text : '')).join('\n')
          : '';

/** The notice of a background task that is over: { id, task }, or null. */
const taskOver = (entry) => {
    const content = entry?.type === 'queue-operation' ? entry.content : entry?.type === 'user' ? entry.message?.content : null;
    const text = typeof content === 'string' ? content : '';
    if (!text.includes('<task-notification>') || !TASK_OVER.test(text) || STILL_RUNNING.test(text)) return null;
    return { id: text.match(/<tool-use-id>([^<]+)</)?.[1] ?? null, task: text.match(/<task-id>([^<]+)</)?.[1] ?? null };
};

/**
 * The start of a background task in the result of its call: a command sent to the background whose
 * result names the task, an agent whose result is asynchronous, or an agent a message resumed — it
 * runs in the background again and sends its notice again.
 */
const taskStarted = (entry) => {
    const result = entry?.toolUseResult;
    if (!result || typeof result !== 'object') return null;
    if (result.backgroundTaskId) return String(result.backgroundTaskId);
    if (result.resumedAgentId) return String(result.resumedAgentId);
    return result.isAsync ? String(result.agentId ?? '') : null;
};

/** The refusals, the menus, the calls, the background tasks and the ended turns of a record, in their order. */
export function eventsOf(entries) {
    const menus = new Map();
    const calls = new Map();
    const events = [];
    // The agent closed its turn, and the record does not say yet whether the stop was released. A
    // refusal of the stop comes as its feedback; a released stop is seen only by what follows it —
    // the summary of the stop hooks with no refusal, a new message or a new turn of the agent. The
    // last entry of a record is therefore never an ended turn. The service entries the harness
    // flushes at any minute — the last prompt, the title, the mode — say nothing: in the records
    // they stand between a closed turn and the feedback of its stop.
    let closing = false;
    const ended = () => {
        if (closing) events.push({ kind: 'ended' });
        closing = false;
    };
    for (const entry of entries) {
        if (entry?.type === 'system' && entry.subtype === 'stop_hook_summary') {
            if ((entry.hookErrors ?? []).some((error) => STOP_BLOCK.test(String(error)))) closing = false;
            else {
                closing = true;
                ended();
            }
            continue;
        }
        // A record of a subagent is no part of the session's own turn.
        if (entry?.isSidechain) continue;
        if (entry?.type === 'user' && feedbackText(entry) === null) ended();
        const over = taskOver(entry);
        if (over) {
            events.push({ kind: 'backgroundEnd', ...over });
            continue;
        }
        if (entry?.type === 'assistant') {
            if (entry.message?.stop_reason !== 'end_turn') ended();
            closing = entry.message?.stop_reason === 'end_turn';
            for (const part of parts(entry)) {
                if (part?.type !== 'tool_use') continue;
                if (part.name === 'AskUserQuestion') {
                    const event = { kind: 'menu', answered: false };
                    menus.set(part.id, event);
                    events.push(event);
                    continue;
                }
                const call = { kind: 'call', name: part.name, input: part.input ?? {}, blocked: false };
                calls.set(part.id, call);
                events.push(call);
                if (STOP_TOOLS.has(part.name)) {
                    const task = call.input.task_id ?? call.input.shell_id ?? call.input.bash_id;
                    events.push({ kind: 'backgroundEnd', id: null, task: task ? String(task) : null });
                }
            }
            continue;
        }
        if (entry?.type !== 'user') continue;
        const refusal = feedbackText(entry);
        if (refusal) {
            closing = false;
            events.push({ kind: 'refusal', text: refusal });
            continue;
        }
        for (const part of parts(entry)) {
            if (part?.type !== 'tool_result') continue;
            const menu = menus.get(part.tool_use_id);
            if (menu) menu.answered = !part.is_error && Boolean(entry.toolUseResult?.answers);
            // A monitor is no background task: it ends by itself.
            const started = part.is_error || calls.get(part.tool_use_id)?.name === 'Monitor' ? null : taskStarted(entry);
            if (started !== null) events.push({ kind: 'background', id: part.tool_use_id, task: started || null, at: Date.parse(entry.timestamp ?? '') });
            const refused = part.is_error ? resultText(part).match(CALL_REFUSAL) : null;
            if (!refused) continue;
            const call = calls.get(part.tool_use_id);
            if (call) call.blocked = true;
            events.push({ kind: 'blocked', by: refused[1], reason: refused[2].trim() });
        }
    }
    return events;
}

export function open() {
    let cached = null;
    const entries = () => (cached ??= parse(process.env.RT_FLOW_TRANSCRIPT));
    return {
        toolUses: () =>
            entries()
                .filter((entry) => entry?.type === 'assistant')
                .flatMap((entry) => parts(entry).filter((part) => part?.type === 'tool_use'))
                .map((part) => ({ name: part.name, input: part.input ?? {} })),
        events: () => eventsOf(entries()),
        now: () => Date.now(),
        agent: () => process.env.RT_FLOW_AGENT || null,
        roleTools: (role) => {
            if (!role || /[/\\]|^\./.test(role)) return null;
            const file = join(process.cwd(), '.claude', 'agents', `${role}.md`);
            if (!existsSync(file)) return null;
            const lines = readFileSync(file, 'utf8').split('\n');
            if (lines[0] !== '---') return null;
            for (const line of lines.slice(1)) {
                if (line === '---') return null;
                if (line.startsWith('tools:')) return line.slice('tools:'.length).trim();
            }
            return null;
        },
    };
}
