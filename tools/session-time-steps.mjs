/**
 * The steps of the task flow inside the hours of the sessions: the active minutes of one branch, split
 * by what the journals mark. The gaps and the calls come from `session-time-model.mjs`.
 *
 * Only the gaps of the branch itself are split, each whole by the moment it ended, so the steps of a
 * branch add up to its active minutes: work on another branch and the waiting for the owner are in
 * none of them. The gaps and the calls of all the journals are taken together: a task handed over to
 * another session is one branch. A step is told by what the journals hold:
 * - a group of reviewers is the review roles launched within three minutes of one another;
 * - a group without `qa-engineer` is the reading of the plan, the first group with it is round one,
 *   the second is round two; later groups belong to what follows;
 * - a group ends with the last report of its members; a launch whose report no journal holds is
 *   counted in `open`, because its group then ends too early;
 * - the delivery begins with the first run of the push set after round two, or with the end of the
 *   round where the set ran only earlier, and ends with the last call that opens a PR.
 *
 * A branch without both rounds, the set and a PR call has no full course and gets no row: its gaps
 * would be read as steps nobody made. The branches left out and their active hours are reported.
 */
import { OWNER, opensPr, runsSet } from './session-time-model.mjs';

export const STEPS = [
    ['plan', 'Разбор и план'],
    ['planRead', 'Чтение плана ролями'],
    ['code', 'Код и живая проверка'],
    ['round1', 'Первый круг: ожидание'],
    ['fix1', 'Первый круг: правки'],
    ['round2', 'Второй круг: ожидание'],
    ['fix2', 'Второй круг: правки'],
    ['delivery', 'От набора до последнего вызова PR'],
    ['after', 'После PR'],
];

/**
 * The moments the background calls ended, read of every record of a journal. A report of a subagent
 * comes as a notice with the id of its call, as a message with the id of the agent, or as an
 * attachment delivered in the middle of a turn; the first of them is the end. The agent id stands in
 * the result of the call that launched it.
 */
export function noteEnds(record, store) {
    const content = record.type === 'attachment' ? record.attachment : record.message?.content;
    if (!record.timestamp || !content || record.isSidechain || record.type === 'assistant') return;
    const text = JSON.stringify(content);
    const at = Date.parse(record.timestamp);
    if (Array.isArray(content) && content[0]?.type === 'tool_result') {
        const agent = /agentId: (\w+)/.exec(text)?.[1];
        if (agent && store.calls.get(content[0].tool_use_id)?.name === 'Agent') store.agents.set(agent, content[0].tool_use_id);
        return;
    }
    const ids = [...text.matchAll(/<tool-use-id>([^<\s]+)<\/tool-use-id>/g)].map((match) => match[1]);
    for (const match of text.matchAll(/agent-message from=\\"(\w+)\\"/g)) ids.push(store.agents.get(match[1]));
    for (const id of ids) if (id && !store.ends.has(id)) store.ends.set(id, at);
}

const REVIEW = new Set(['qa-engineer', 'product-strategist', 'goal-critic']);
const APART = 3 * 60_000;

/** Reviewer launches of a branch in groups, each with its start, its end and whether it holds tests. */
function reviewGroups(launches, ends) {
    const groups = [];
    for (const launch of [...launches].sort((a, b) => a.at - b.at)) {
        const last = groups.at(-1);
        const group = last && launch.at - last.launched <= APART ? last : { start: launch.at, end: 0, qa: false };
        if (group !== last) groups.push(group);
        group.launched = launch.at;
        group.qa ||= launch.role === 'qa-engineer';
        group.end = Math.max(group.end, ends.get(launch.id) ?? launch.at);
    }
    return groups;
}

/** The calls of every branch that mark its steps, of the period alone. */
function marksOf(calls, from, to) {
    const marks = new Map();
    const of = (branch) => {
        if (!marks.has(branch)) marks.set(branch, { launches: [], sets: [], pr: null });
        return marks.get(branch);
    };
    for (const [id, { name, command, role, at, branch }] of calls) {
        if (!branch || at < from || at > to) continue;
        if (name === 'Agent' && REVIEW.has(role)) of(branch).launches.push({ id, at, role });
        if (runsSet(command)) of(branch).sets.push(at);
        if (opensPr(command)) of(branch).pr = Math.max(of(branch).pr ?? 0, at);
    }
    return marks;
}

/** The moments that bound the steps of a branch, each not earlier than the previous; null without a full course. */
function boundsOf({ launches, sets, pr }, ends) {
    const groups = reviewGroups(launches, ends);
    const [first, second] = groups.filter((group) => group.qa);
    if (!second || pr === null || sets.length === 0) return null;
    const afterRound = sets.filter((at) => at >= second.end);
    const reading = groups.find((group) => !group.qa && group.start < first.start) ?? { start: first.start, end: first.start };
    const set = afterRound.length > 0 ? Math.min(...afterRound) : second.end;
    let high = 0;
    return [reading.start, reading.end, first.start, first.end, second.start, second.end, set, pr].map((at) => (high = Math.max(high, at)));
}

/** The minutes of one branch by step, and of every step by category. */
function rowOf(branch, gaps, bounds) {
    const row = { branch, minutes: STEPS.map(() => 0), kinds: STEPS.map(() => ({})) };
    for (const { kind, to, hours } of gaps) {
        const index = bounds.findIndex((bound) => to <= bound);
        const step = index === -1 ? STEPS.length - 1 : index;
        row.minutes[step] += hours * 60;
        row.kinds[step][kind] = (row.kinds[step][kind] ?? 0) + hours * 60;
    }
    return row;
}

/** The rows of the branches that went the whole course, and what was left out; `takes` picks branches by name. */
export function stepsOf({ gaps, calls, ends, from, to, takes }) {
    const own = new Map();
    for (const gap of gaps) {
        if (gap.kind === OWNER || !takes(gap.branch)) continue;
        if (!own.has(gap.branch)) own.set(gap.branch, []);
        own.get(gap.branch).push(gap);
    }
    const marks = marksOf(calls, from, to);
    const rows = [];
    const left = [];
    let open = 0;
    for (const [branch, branchGaps] of own) {
        const mark = marks.get(branch);
        const bounds = mark ? boundsOf(mark, ends) : null;
        open += mark ? mark.launches.filter(({ id }) => !ends.has(id)).length : 0;
        if (bounds) rows.push(rowOf(branch, branchGaps, bounds));
        else left.push(branchGaps.reduce((sum, { hours }) => sum + hours, 0));
    }
    return { rows, left, open };
}

const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = sorted.length >> 1;
    if (sorted.length === 0) return 0;
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const sum = (values) => values.reduce((a, b) => a + b, 0);
const tenth = (value) => Math.round(value * 10) / 10;

/** The median of every step, the mean minutes of its categories, and what was left out. */
export function stepsReport({ rows, left, open }) {
    const kindsOf = (i) => {
        const keys = new Set(rows.flatMap((row) => Object.keys(row.kinds[i])));
        return Object.fromEntries([...keys].map((kind) => [kind, tenth(sum(rows.map((row) => row.kinds[i][kind] ?? 0)) / rows.length)]));
    };
    return {
        branches: rows.length,
        medians: Object.fromEntries(STEPS.map(([key], i) => [key, Math.round(median(rows.map((row) => row.minutes[i])))])),
        kinds: Object.fromEntries(STEPS.map(([key], i) => [key, kindsOf(i)])),
        perBranch: Object.fromEntries(rows.map((row) => [row.branch, tenth(sum(row.minutes))])),
        left: { branches: left.length, hours: Math.round(sum(left) * 100) / 100 },
        open,
    };
}
