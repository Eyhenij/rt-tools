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
 *
 * The time of a call holds the hooks that ran before it, and the categories repeat the first measurement
 * of 24.11, so that «before» and «after» are compared by one rule. Two lines are read with that in mind:
 * the board holds the checks of `plan-red` and the hooks before `gh pr create` — about 101 of its 172
 * minutes on that journal; edits and commands hold the loops with `sleep`, about 77 minutes of it.
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

/** A run of the push set. A command that only names the file — a search, a print of it — is no run. */
const RUNS_SET = /(?:^|[\s;&|(/])(?:bash|sh|zsh)\s+(?:-o\s+\w+\s+|-(?!n\b)\w+\s+)*["']?[^\s"']*git-guard-push-ahead\.sh(?=["'\s;&|)]|$)/;

/** A command that waits in the foreground until the running set ends. */
const WAITS_SET = /\bpgrep\b[^\n;|&]*push-ahead/;

/** The options of git stand before the verb, so `git -c key=value push` is a push too. */
const PUSH = /\bgit(?:\s+-[cC]\s+(?:'[^']*'|"[^"]*"|[^\s'"]+(?:'[^']*'|"[^"]*")?)|\s+--?[\w-]+(?:=\S+)?)*\s+push\b/;

const OPENS_PR = /(?:^|[\s;&|(/])(?:gh|"?\$\{?GH\}?"?)(?:\s+-R\s+\S+)?\s+pr\s+(?:create|new)\b(?!\s+--help)/;

/** What a command carries as text — a message of a commit, a here-document, an echoed line, a comment — runs nothing. */
const withoutText = (command) =>
    command
        .replace(/<<-?\s*(['"]?)\\?([\w-]+)\1([^\n]*)\n[\s\S]*?\n\s*\2(?=\n|$)/g, '$3')
        .replace(/(?:\s-[a-z]*m|\s--(?:message|body|title)|\becho|\bprintf)[ =]+\$?("(?:[^"\\]|\\.)*"|'[^']*')/g, '')
        .replace(/\becho\s[^;&|\n]*/g, '')
        .replace(/(^|\s)#[^\n]*/g, '$1');

export const runsSet = (command) => RUNS_SET.test(withoutText(command));
export const opensPr = (command) => OPENS_PR.test(withoutText(command));
const isPush = (command) => runsSet(command) || [WAITS_SET, PUSH].some((pattern) => pattern.test(withoutText(command)));

/** The kind of a shell command: the first match wins, the order is from the specific to the general. */
const COMMANDS = [
    ['pushset', isPush],
    ['ci', /\bgh run watch\b|\bgh pr checks\b.*--watch/],
    ['checks', /visual-gate|:e2e\b|serve:stand|storybook|playwright/],
    ['checks', /ngdoctor.*check|check.*ngdoctor/],
    ['checks', /test-hooks|tests\/run\.sh|check-hooks|\.test\.sh/],
    ['checks', /nx (?:affected|run|test|build|lint)|run build|jest|check:all/],
    ['checks', /\bpnpm (?:run )?(?:-s )?(?:test|lint)\b|\bvitest\b/],
    ['board', /task-flow-script|task:new|task:move|epic-table|check:board/],
    ['checks', /tools\/check|agent-kit|pnpm run check|check:/],
    ['board', /\bgh\b|\bbot api/],
];

const commandKind = (command) => {
    const text = command.replace(/cd \S+ *(?:&&|;)/g, '');
    const match = ([, pattern]) => (typeof pattern === 'function' ? pattern(text) : pattern.test(text));
    return COMMANDS.find(match)?.[0] ?? 'tools';
};

/** Calls that hand the work to agents; a foreground one is waited for by its result. */
const AGENTS = new Set(['Agent', 'Task', 'Workflow']);

const toolKind = ({ name, command }) => {
    if (name === 'AskUserQuestion' || name === 'ExitPlanMode') return OWNER;
    if (AGENTS.has(name)) return 'agents';
    return name === 'Bash' ? commandKind(command) : 'tools';
};

/** What a command of the background is waited for by: the pipeline is asked through the host client. */
const waitKind = ({ name, command }) => {
    if (AGENTS.has(name)) return 'agents';
    if (isPush(command)) return 'pushset';
    return /\bgh\b|\bbot api/.test(command) ? 'ci' : 'checks';
};

const textOf = (content) => (typeof content === 'string' ? content : JSON.stringify(content ?? ''));

/** A tool call as the measure needs it: of the input only the command and the role are kept; `done` is the moment of its result. */
const callOf = ({ name, input }, at, branch) => ({
    name,
    command: String(input?.command ?? ''),
    role: input?.subagent_type ?? null,
    at,
    done: at,
    branch,
});

/** One record of a journal as an event of the main thread, or null. Tool calls are kept for the results that answer them. */
export function eventOf(record, calls) {
    if (record.isSidechain || !record.timestamp) return null;
    const at = Date.parse(record.timestamp);
    const base = { at, branch: record.gitBranch ?? null };
    if (Number.isNaN(at)) return null;
    if (record.type === 'assistant') {
        for (const block of record.message?.content ?? []) {
            if (block.type === 'tool_use') calls.set(block.id, callOf(block, at, base.branch));
        }
        return { ...base, kind: 'answer' };
    }
    if (record.type === 'system') {
        return { ...base, kind: record.subtype === 'stop_hook_summary' ? 'stop' : 'other' };
    }
    if (record.type !== 'user') return null;
    const event = { ...base, ...userEvent(record) };
    if (event.kind === 'result' && calls.has(event.call)) calls.get(event.call).done = at;
    return event;
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

/** The gaps of one journal, in order: the branch, the category, the end and the hours of each. */
export function gapsOf(events, calls) {
    const done = new Map();
    const sorted = [...events].sort((a, b) => a.at - b.at);
    for (const event of sorted) {
        if (event.kind === 'notice' && event.call && !done.has(event.call)) done.set(event.call, event.at);
    }
    const gaps = [];
    let branch = sorted[0]?.branch ?? null;
    for (let i = 1; i < sorted.length; i += 1) {
        const event = sorted[i];
        branch = event.branch ?? branch;
        gaps.push({
            branch: branch ?? '—',
            kind: categoryOf(event, sorted[i - 1], calls, done),
            to: event.at,
            hours: (event.at - sorted[i - 1].at) / 3_600_000,
        });
    }
    return gaps;
}

/** The hours of the gaps by category, and the same of every branch. */
export function measure(gaps) {
    const total = {};
    const branches = Object.create(null);
    for (const { branch, kind, hours } of gaps) {
        total[kind] = (total[kind] ?? 0) + hours;
        branches[branch] ??= {};
        branches[branch][kind] = (branches[branch][kind] ?? 0) + hours;
    }
    return { total, branches };
}

const round = (value) => Math.round(value * 100) / 100;

export const activeOf = (hours) => CATEGORIES.reduce((sum, [key]) => sum + (hours[key] ?? 0), 0);

/** The report of one set of hours: active, owner, and a share for each category. */
export function reportOf(hours) {
    const active = activeOf(hours);
    const categories = Object.fromEntries(
        CATEGORIES.map(([key]) => [key, { hours: round(hours[key] ?? 0), share: active ? round((hours[key] ?? 0) / active) : 0 }])
    );
    return { activeHours: round(active), ownerHours: round(hours[OWNER] ?? 0), categories };
}
