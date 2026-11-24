/**
 * The model of where the time of an agent session goes: records of a session in, hours by category
 * out. It reads no files, so the scenarios of `tools/tests/session-time.test.sh` drive it on short
 * journals; the reading of a journal is `session-time.mjs`.
 *
 * The gap between two neighbouring events of the main thread goes whole to one category, by what
 * ended it: an answer of the model, the result of a tool, the summary of the Stop hooks, a message
 * of the owner, a notice about background work. A notice names what ran in the background during the
 * gap, so waiting for reviewers, for the push set and for the pipeline are told apart.
 *
 * The share of a category is taken of the active time — the whole time without the waiting for the
 * owner: a night at an open menu says nothing about the process.
 */

/** Categories in the order of the report; `owner` stands apart and is not active. */
export const CATEGORIES = [
    ['model', 'Модель думает и пишет'],
    ['pushset', 'Набор перед отправкой'],
    ['agents', 'Ожидание субагентов'],
    ['tools', 'Правки и команды'],
    ['checks', 'Проверки по ходу'],
    ['board', 'Доска, отметки шагов, gh'],
    ['stop', 'Крючки Stop'],
    ['ci', 'Ожидание CI'],
];
export const OWNER = 'owner';

/** The kind of a shell command: the first match wins, the order is from the specific to the general. */
const COMMANDS = [
    ['pushset', /git-guard-push-ahead\.sh|\bgit push\b/],
    ['checks', /visual-gate|:e2e\b|serve:stand|storybook|playwright/],
    ['checks', /ngdoctor.*check|check.*ngdoctor/],
    ['checks', /test-hooks|tests\/run\.sh|check-hooks|\.test\.sh/],
    ['checks', /nx (?:affected|run|test|build|lint)|run build|jest|check:all/],
    ['board', /task-flow-script|task:new|task:move|epic-table|check:board/],
    ['checks', /tools\/check|agent-kit|pnpm run check|check:/],
    ['board', /\bgh\b|\bbot api/],
];

const commandKind = (command) => {
    const text = command.replace(/cd \S+ *(?:&&|;)/g, '');
    return COMMANDS.find(([, pattern]) => pattern.test(text))?.[0] ?? 'tools';
};

const toolKind = ({ name, input }) => {
    if (name === 'AskUserQuestion') return OWNER;
    return name === 'Bash' ? commandKind(String(input?.command ?? '')) : 'tools';
};

/** What a command of the background is waited for by: the pipeline is asked through the host client. */
const waitKind = ({ name, input }) => {
    if (name === 'Agent') return 'agents';
    const command = String(input?.command ?? '');
    if (/push-ahead/.test(command)) return 'pushset';
    return /\bgh\b|\bbot api/.test(command) ? 'ci' : 'checks';
};

const textOf = (content) => (typeof content === 'string' ? content : JSON.stringify(content ?? ''));

/** One record of a journal as an event of the main thread, or null. Tool calls are kept for the results that answer them. */
export function eventOf(record, calls) {
    if (record.isSidechain || !record.timestamp) return null;
    const at = Date.parse(record.timestamp);
    const base = { at, branch: record.gitBranch ?? null };
    if (Number.isNaN(at)) return null;
    if (record.type === 'assistant') {
        for (const block of record.message?.content ?? []) {
            if (block.type === 'tool_use') calls.set(block.id, { name: block.name, input: block.input, at, branch: base.branch });
        }
        return { ...base, kind: 'answer' };
    }
    if (record.type === 'system') {
        return { ...base, kind: record.subtype === 'stop_hook_summary' ? 'stop' : 'other' };
    }
    return record.type === 'user' ? { ...base, ...userEvent(record) } : null;
}

function userEvent(record) {
    const content = record.message?.content;
    const origin = record.origin?.kind;
    if (Array.isArray(content) && content[0]?.type === 'tool_result') {
        return { kind: 'result', call: content[0].tool_use_id };
    }
    if (origin === 'task-notification' || origin === 'peer') {
        const text = textOf(content);
        return {
            kind: 'notice',
            handback: text.includes('Subagent hand-back'),
            call: /<tool-use-id>(\S+?)<\/tool-use-id>/.exec(text)?.[1] ?? null,
        };
    }
    return { kind: origin === 'human' ? 'owner' : 'other' };
}

/** The category of the gap that ended by the event; `done` holds when each background call ended. */
function categoryOf(event, previous, calls, done) {
    if (event.kind === 'answer') return 'model';
    if (event.kind === 'stop') return 'stop';
    if (event.kind === 'owner') return OWNER;
    if (event.kind === 'result') return toolKind(calls.get(event.call) ?? { name: '' });
    if (event.kind !== 'notice') return 'tools';
    if (event.handback) return 'agents';
    const running = [...done].filter(([id, end]) => calls.has(id) && calls.get(id).at <= previous.at && end > previous.at);
    const kinds = running.map(([id]) => waitKind(calls.get(id)));
    return ['agents', 'pushset'].find((kind) => kinds.includes(kind)) ?? kinds[0] ?? 'agents';
}

/** Adds the hours of the gaps to the totals and to the totals of their branches. */
export function measure(events, calls) {
    const done = new Map();
    const sorted = [...events].sort((a, b) => a.at - b.at);
    for (const event of sorted) {
        if (event.kind === 'notice' && event.call && !done.has(event.call)) done.set(event.call, event.at);
    }
    const total = {};
    const branches = {};
    const owner = [];
    let branch = null;
    for (let i = 1; i < sorted.length; i += 1) {
        const event = sorted[i];
        branch = event.branch ?? branch;
        const hours = (event.at - sorted[i - 1].at) / 3_600_000;
        const kind = categoryOf(event, sorted[i - 1], calls, done);
        if (kind === OWNER) owner.push([sorted[i - 1].at, event.at]);
        total[kind] = (total[kind] ?? 0) + hours;
        branches[branch ?? '—'] ??= {};
        branches[branch ?? '—'][kind] = (branches[branch ?? '—'][kind] ?? 0) + hours;
    }
    return { total, branches, owner };
}

const round = (value) => Math.round(value * 100) / 100;

/** The report of one set of hours: active, owner, and a share for each category. */
export function reportOf(hours) {
    const active = CATEGORIES.reduce((sum, [key]) => sum + (hours[key] ?? 0), 0);
    const categories = Object.fromEntries(
        CATEGORIES.map(([key]) => [key, { hours: round(hours[key] ?? 0), share: active ? round((hours[key] ?? 0) / active) : 0 }])
    );
    return { activeHours: round(active), ownerHours: round(hours[OWNER] ?? 0), categories };
}
