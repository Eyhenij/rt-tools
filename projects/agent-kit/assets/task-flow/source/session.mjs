/**
 * The source «source.session» of the task flow description: what this session did, read from the
 * record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`, and the role it runs as, named
 * by the hook in `RT_FLOW_AGENT`.
 *
 *   toolUses()       the calls of the agent, oldest first: { name, input }
 *   events()         what happened in the record, oldest first: a refusal at the end of a turn
 *                    { kind: 'refusal', text }, a menu { kind: 'menu', answered }, a call of a tool
 *                    { kind: 'call', name, input, blocked } and a refusal of a call by a hook
 *                    { kind: 'blocked', by, reason }
 *   agent()          the role the session runs as, or null
 *   roleTools(role)  the `tools:` line of the role's header, or null
 *
 * Without a record the session did nothing: no write, no refusal, no menu.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The text a refusal at the end of a turn arrives with. */
const STOP_FEEDBACK = /^Stop hook feedback:/;
/** A hook refused a call: the result of the call names the guard that refused it. */
const CALL_REFUSAL = /hook error:[\s\S]*?BLOCKED by ([\w-]+):\s*([^\n]*)/;

const parse = (file) => {
    if (!file || !existsSync(file)) return [];
    const entries = [];
    for (const line of readFileSync(file, 'utf8').split('\n')) {
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

/** The refusals, the menus and the calls of a record, in their order. */
export function eventsOf(entries) {
    const menus = new Map();
    const calls = new Map();
    const events = [];
    for (const entry of entries) {
        if (entry?.type === 'assistant') {
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
            }
            continue;
        }
        if (entry?.type !== 'user') continue;
        const refusal = feedbackText(entry);
        if (refusal) {
            events.push({ kind: 'refusal', text: refusal });
            continue;
        }
        for (const part of parts(entry)) {
            if (part?.type !== 'tool_result') continue;
            const menu = menus.get(part.tool_use_id);
            if (menu) menu.answered = !part.is_error && Boolean(entry.toolUseResult?.answers);
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
