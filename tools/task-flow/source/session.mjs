// rt-kit v0.38.0 · task-flow/source/session.mjs · c3967cc37488 · правится надстройкой, не здесь
/**
 * The source «source.session» of the task flow description: what this session did, read from the
 * record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`, and the role it runs as, named
 * by the hook in `RT_FLOW_AGENT`.
 *
 *   toolUses()       the calls of the agent, oldest first: { name, input }
 *   events()         what happened in the record, oldest first: a refusal at the end of a turn
 *                    { kind: 'refusal', text }, a menu { kind: 'menu', answered }, a call of a tool
 *                    { kind: 'call', id, name, input, blocked, at, branch, doneAt, failed } — `branch` is
 *                    the branch of its record entry, `doneAt` the time of its result, `failed` an
 *                    error result — a refusal of a call by a hook { kind: 'blocked', by, reason }, the
 *                    start of a background task { kind: 'background', id, task, at, output, agent,
 *                    command } — `command` is the command of its call — its end { kind: 'backgroundEnd', id,
 *                    task, output, status, stopped } — `stopped` when the session stopped it itself —
 *                    and a turn that ended { kind: 'ended' }
 *   now()            the time the session is judged at, in milliseconds
 *   ownerAt()        the time of the owner's last word — a typed message or a menu answer — or null
 *   agent()          the role the session runs as, or null
 *   roleTools(role)  the `tools:` line of the role's header, or null
 *
 * Without a record the session did nothing: no write, no refusal, no menu.
 */
import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import { join } from 'node:path';

import { wordOf } from './owner.mjs';

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
/** The file a background task writes its output to, named in the result of its call. */
const OUTPUT_FILE = /(?:Output is being written to|output_file):?[ \t]*([^\n]+)/;
/** The path in the line of the output file: the line up to a sentence that follows it, with no closing stop. */
const outputOf = (text) => text.match(OUTPUT_FILE)?.[1].replace(/\.\s+[A-Z].*$/, '').replace(/[.,]$/, '').trim() || null;
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

/** The notice of background tasks that are over: [{ id, task }], or null. */
const taskOver = (entry) => {
    // A notice comes as a queue operation, as a message, or as a queued command attached to the record.
    const content =
        entry?.type === 'queue-operation'
            ? entry.content
            : entry?.type === 'user'
              ? entry.message?.content
              : entry?.type === 'attachment' && entry.attachment?.type === 'queued_command'
                ? entry.attachment.prompt
                : null;
    const text = typeof content === 'string' ? content : '';
    if (!text.includes('<task-notification>') || !TASK_OVER.test(text) || STILL_RUNNING.test(text)) return null;
    const id = text.match(/<tool-use-id>([^<]+)</)?.[1] ?? null;
    const output = text.match(/<output-file>([^<]+)</)?.[1] ?? null;
    const status = text.match(/<status>([^<]+)</)?.[1] ?? null;
    // One notice may name several tasks: the commands a previous session left unfinished.
    const tasks = [...text.matchAll(/<task-id>([^<]+)</g)].map((match) => match[1]);
    return tasks.length > 1 ? tasks.map((task) => ({ id: null, task, output: null, status })) : [{ id, task: tasks[0] ?? null, output, status }];
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
        // A record of a subagent is no part of the session's own turn.
        if (entry?.isSidechain) continue;
        if (entry?.type === 'system' && entry.subtype === 'stop_hook_summary') {
            if ((entry.hookErrors ?? []).some((error) => STOP_BLOCK.test(String(error)))) closing = false;
            else {
                closing = true;
                ended();
            }
            continue;
        }
        // A meta entry is written by a hook, another hook of the stop among them: it ends no turn.
        if (entry?.type === 'user' && !entry.isMeta && feedbackText(entry) === null) ended();
        const over = taskOver(entry);
        if (over) {
            const at = Date.parse(entry.timestamp ?? '');
            for (const task of over) events.push({ kind: 'backgroundEnd', ...task, ...(Number.isFinite(at) ? { at } : {}) });
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
                const call = { kind: 'call', id: part.id, name: part.name, input: part.input ?? {}, blocked: false, at: Date.parse(entry.timestamp ?? ''), branch: entry.gitBranch ?? null };
                calls.set(part.id, call);
                events.push(call);
                if (STOP_TOOLS.has(part.name)) {
                    const task = call.input.task_id ?? call.input.shell_id ?? call.input.bash_id;
                    events.push({ kind: 'backgroundEnd', id: null, task: task ? String(task) : null, output: null, stopped: true });
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
            // A monitor is no background task: a persistent one never ends.
            const started = part.is_error || calls.get(part.tool_use_id)?.name === 'Monitor' ? null : taskStarted(entry);
            if (started !== null) {
                const output = outputOf(resultText(part));
                const agent = !entry.toolUseResult.backgroundTaskId;
                const command = calls.get(part.tool_use_id)?.input?.command ?? null;
                events.push({ kind: 'background', id: part.tool_use_id, task: started || null, at: Date.parse(entry.timestamp ?? ''), output, agent, command });
            }
            const call = calls.get(part.tool_use_id);
            if (call) {
                // The result of a call: when it came, and whether the call failed.
                call.doneAt = Date.parse(entry.timestamp ?? '');
                call.failed = Boolean(part.is_error);
            }
            const refused = part.is_error ? resultText(part).match(CALL_REFUSAL) : null;
            if (!refused) continue;
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
        ownerAt: () => {
            const all = entries();
            for (let index = all.length - 1; index >= 0; index -= 1) {
                if (wordOf(all[index]) !== null) return Date.parse(all[index].timestamp ?? '');
            }
            return null;
        },
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
