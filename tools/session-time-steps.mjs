/**
 * The steps of the task flow inside the hours of a session: minutes of one branch from its start to
 * its last PR call, without the waiting for the owner. The events and the calls come from
 * `session-time-model.mjs`.
 *
 * A step is told by what the journal holds, not by what the executor writes about it:
 * - a group of reviewers is the review roles launched within three minutes of one another;
 * - a group without `qa-engineer` is the reading of the plan, the first group with it is round one,
 *   the second is round two; later groups belong to the closing;
 * - a group ends with the last report of its members;
 * - the push set is its first run ahead, the delivery ends with the last call that opens a PR.
 *
 * A branch without both rounds, the set and a PR call has no full course and gets no row: its gaps
 * would be read as steps nobody made.
 */
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
        const group = last && launch.at - last.end0 <= APART ? last : { start: launch.at, end: 0, qa: false };
        if (group !== last) groups.push(group);
        group.end0 = launch.at;
        group.qa ||= launch.role === 'qa-engineer';
        group.end = Math.max(group.end, ends.get(launch.id) ?? launch.at);
    }
    return groups;
}

/** What one branch did, from the events of the main thread: the first and the last moment, the calls that mark the steps. */
function marksOf(events, calls) {
    const marks = new Map();
    const of = (branch) => {
        if (!marks.has(branch)) marks.set(branch, { first: Infinity, last: 0, launches: [], set: null, pr: null });
        return marks.get(branch);
    };
    for (const event of events) {
        if (!event.branch) continue;
        const mark = of(event.branch);
        mark.first = Math.min(mark.first, event.at);
        mark.last = Math.max(mark.last, event.at);
    }
    for (const [id, call] of calls) {
        if (!call.branch) continue;
        const command = String(call.input?.command ?? '');
        const mark = of(call.branch);
        if (call.name === 'Agent' && REVIEW.has(call.input?.subagent_type))
            mark.launches.push({ id, at: call.at, role: call.input.subagent_type });
        if (/push-ahead\.sh/.test(command)) mark.set = Math.min(mark.set ?? Infinity, call.at);
        if (/gh pr create/.test(command)) mark.pr = Math.max(mark.pr ?? 0, call.at);
    }
    return marks;
}

/** Minutes of one stretch without the owner's waits, given as pairs of moments. */
const activeMinutes = (from, to, owner) =>
    to <= from ? 0 : (to - from - owner.reduce((sum, [a, b]) => sum + Math.max(0, Math.min(to, b) - Math.max(from, a)), 0)) / 60_000;

/** The minutes of the steps of every branch that went the whole course. */
export function stepsOf({ events, calls, ends, owner }) {
    const marks = marksOf(events, calls);
    const rows = [];
    for (const [branch, mark] of marks) {
        const groups = reviewGroups(mark.launches, ends);
        const rounds = groups.filter((group) => group.qa);
        if (rounds.length < 2 || mark.set === null || mark.pr === null) continue;
        const reading = groups.find((group) => !group.qa && group.start < rounds[0].start);
        const bounds = [
            mark.first,
            reading?.start ?? rounds[0].start,
            reading?.end ?? rounds[0].start,
            rounds[0].start,
            rounds[0].end,
            rounds[1].start,
            rounds[1].end,
            mark.set,
            mark.pr,
            mark.last,
        ];
        rows.push({ branch, minutes: STEPS.map(([,], i) => activeMinutes(bounds[i], bounds[i + 1], owner)) });
    }
    return rows;
}

const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length / 2)];
};

/** The median of every step over the branches, in whole minutes, and how many branches they rest on. */
export function stepsReport(rows) {
    return {
        branches: rows.length,
        medians: Object.fromEntries(STEPS.map(([key], i) => [key, Math.round(median(rows.map((row) => row.minutes[i])))])),
        perBranch: Object.fromEntries(rows.map((row) => [row.branch, Math.round(row.minutes.reduce((a, b) => a + b, 0))])),
    };
}
