// The record of a conversation built from a recorded turn of `fixtures/turn-replay/`.
//
// A fixture keeps only what the hooks read: the role of an entry, its time, the name of a call, its
// answer code, and the owner's word as a class label or a short phrase typed to stop. The labels
// become synthetic texts here, so the public fixture carries no text the owner typed. The record is
// written in the shape Claude Code writes it: a user entry with text parts, an assistant entry with a
// tool use, a tool result with `is_error`, a menu answer with `toolUseResult.answers`, a refusal at the
// end of a turn as `Stop hook feedback:`, a compaction summary, a command sent to the background, a
// `Monitor`, a task notification, and a word the owner only queued and took back.
//
// A chain of one day is judged point by point: `<upto>` keeps the turns up to that index and moves every
// time so that the point stands at the minute of the run — the engine judges a background task by the
// clock, and a task of three days ago is hung to it.
//
// Usage: node turn-replay-lib.mjs <fixture.json> <record.jsonl> [<upto>]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The synthetic text of each class label. Nothing here is a nudge of the description. */
const LABEL_TEXT = {
    '<nudge>': 'ну что там?',
    '<question>': 'что лежит в ветке сейчас?',
    '<abuse>': 'позорище',
};

/** The text of a menu option, of an order, of a label, or the phrase itself. */
export function ownerText(word, options = []) {
    const answer = word.match(/^<menu-answer:(\d+)>$/);
    if (answer) return options[Number(answer[1]) - 1] ?? '';
    const order = word.match(/^<order:(RT-\d+)>$/);
    if (order) return `делай ${order[1]}`;
    return LABEL_TEXT[word] ?? word;
}

/** The text of a refusal at the end of a turn: one move, or the menu of the owner. */
export function stopFeedback(kind, task) {
    const head = 'Stop hook feedback:\n[turn-exit-guard.sh]: BLOCKED by turn-exit-guard: The scenario is not over.';
    if (kind === 'menu')
        return `${head} The step is refused by another check. Ask the owner one menu: «отложить RT-${task}», «подскажу путь».`;
    return `${head} The next move is the current step of the progress.`;
}

const user = (at, content, extra = {}) => ({ type: 'user', timestamp: at, message: { role: 'user', content }, ...extra });
const assistant = (at, content) => ({ type: 'assistant', timestamp: at, message: { role: 'assistant', content } });
const result = (at, id, text, isError) =>
    user(at, [{ type: 'tool_result', tool_use_id: id, content: text, ...(isError ? { is_error: true } : {}) }]);

const REJECTED = "The user doesn't want to proceed with this tool use. The tool use was rejected.";

/** The answer of a call: the owner's choice in a menu, a rejection, a hook that held it, or the code. */
function answerOf(turn, id, at, options) {
    if (turn.answer?.owner === '<refusal>') return result(at, id, REJECTED, true);
    if (turn.answer?.owner) {
        const text = ownerText(turn.answer.owner, options);
        return {
            ...result(at, id, `The user answered: "${turn.menu?.[0] ?? 'question'}"="${text}"`, false),
            toolUseResult: { answers: { question: text } },
        };
    }
    if (turn.answer?.held)
        return result(
            at,
            id,
            `PreToolUse:AskUserQuestion hook error: [${turn.answer.held}]: BLOCKED by ${turn.answer.held}: the question is held.`,
            true
        );
    if (turn.code === 'refused')
        return result(
            at,
            id,
            `PreToolUse:${turn.call} hook error: [${turn.guard}.sh]: BLOCKED by ${turn.guard}: ${turn.says ?? 'the call is refused.'}`,
            true
        );
    if (turn.code === 0) return result(at, id, turn.out ?? 'done', false);
    return result(at, id, `exit ${turn.code}`, true);
}

/** The notice of a task as the host writes it: an event of a `Monitor`, or the end of a background command. */
export function noticeText(turn) {
    const body = turn.event ? `<event>${turn.event}</event>` : `<status>${turn.status ?? 'completed'}</status>`;
    return `<task-notification>\n<task-id>${turn.task}</task-id>\n<tool-use-id>toolu_${turn.task}</tool-use-id>\n<output-file>/tmp/session/tasks/${turn.task}.output</output-file>\n${body}\n</task-notification>`;
}

/** The result of a call that started a task: a command in the background or a `Monitor`. */
function startOf(turn, id, at) {
    if (turn.call === 'Monitor')
        return {
            ...result(at, id, `Monitor started (task ${turn.task}, expires in 20m unless the source ends first).`, false),
            toolUseResult: { taskId: turn.task },
        };
    const text = `Command running in background with ID: ${turn.task}. Output is being written to: /tmp/session/tasks/${turn.task}.output. You will be notified when it completes.`;
    return { ...result(at, id, text, false), toolUseResult: { backgroundTaskId: turn.task } };
}

/**
 * The entries of the record, oldest first; with `upto`, the turns up to that index, moved to the minute
 * of `now`; with `before`, the turn `upto` itself is left out — the record a hook reads before a call.
 */
export function recordOf(fixture, { upto = null, now = Date.now(), before = false } = {}) {
    const entries = [];
    const all = upto === null ? fixture.turns : fixture.turns.slice(0, upto + 1);
    const shift = upto === null ? 0 : now - Date.parse(all.at(-1).at);
    const turns = before ? all.slice(0, -1) : all;
    turns.forEach((turn, index) => {
        const at = shift ? new Date(Date.parse(turn.at) + shift).toISOString() : turn.at;
        const id = turn.task && turn.call ? `toolu_${turn.task}` : `toolu_${index}`;
        // A typed word lands as the host writes it: the queue record, then the user record. A word
        // the owner took back from the queue leaves the queue record and its removal only.
        if (turn.role === 'owner') {
            const text = ownerText(turn.owner);
            entries.push({ type: 'queue-operation', operation: 'enqueue', timestamp: at, content: text });
            if (turn.queued === 'only') entries.push({ type: 'queue-operation', operation: 'remove', timestamp: at, content: text });
            else entries.push(user(at, text));
        } else if (turn.role === 'notice') {
            // A notice the host took back from the queue reaches no turn: its queue record alone ends the task.
            const text = noticeText(turn);
            entries.push({ type: 'queue-operation', operation: 'enqueue', timestamp: at, content: text });
            if (turn.queued !== 'only') entries.push(user(at, text, { origin: { kind: 'task-notification' } }));
        } else if (turn.role === 'hook') entries.push(user(at, stopFeedback(turn.stop, fixture.task)));
        else if (turn.role === 'harness')
            entries.push(user(at, 'This session is being continued from a previous conversation.', { isCompactSummary: true }));
        else if (turn.say) {
            const entry = assistant(at, [{ type: 'text', text: turn.say }]);
            if (turn.end) entry.message.stop_reason = 'end_turn';
            entries.push(entry);
        } else if (turn.menu) {
            const questions = [{ question: turn.menu[0], options: turn.menu.slice(1).map((label) => ({ label })) }];
            entries.push(assistant(at, [{ type: 'tool_use', id, name: 'AskUserQuestion', input: { questions } }]));
            entries.push(answerOf(turn, id, at, turn.menu.slice(1)));
        } else if (turn.call) {
            const inputs = {
                Bash: () => ({ command: turn.command ?? '', ...(turn.task ? { run_in_background: true } : {}) }),
                Monitor: () => ({ command: turn.command ?? '', description: 'watch' }),
                Agent: () => ({ subagent_type: turn.agent ?? '', prompt: 'the facts of the record' }),
                TaskStop: () => ({ task_id: turn.stops ?? '' }),
            };
            const input = inputs[turn.call]?.() ?? { file_path: turn.file ?? 'notes.md' };
            entries.push(assistant(at, [{ type: 'tool_use', id, name: turn.call, input }]));
            entries.push(turn.task && turn.code !== 'refused' ? startOf(turn, id, at) : answerOf(turn, id, at, []));
        }
    });
    // The host gives every entry its id: the approval mark names the entry of the answer by it.
    entries.forEach((entry, index) => {
        entry.uuid ??= `e${index}`;
    });
    return entries;
}

/**
 * The turns of a chain of one day: its points, or the points up to `after` of a branch and the branch's
 * own — a synthetic point is judged on a copy of the record and never enters the chain.
 */
export function chainTurns(chain, branch = null) {
    const own = branch ? chain.branches[branch] : null;
    const points = own ? [...chain.points.slice(0, own.after + 1), ...own.points] : chain.points;
    return { task: chain.task, turns: points.map((point) => ({ ...point, role: point.kind })) };
}

/** The input of a hook before a call: the call of the point `upto` of a chain, the record before it. */
export function callInput(fixture, upto, record) {
    const turn = fixture.turns[upto];
    const tool_input =
        turn.call === 'Monitor'
            ? { command: turn.command ?? '', description: 'watch' }
            : turn.call === 'Bash'
              ? { command: turn.command ?? '' }
              : { file_path: turn.file ?? 'notes.md' };
    return { session_id: 'replay', transcript_path: record, hook_event_name: 'PreToolUse', tool_name: turn.call, tool_input };
}

// Run only when called itself: an importer's own arguments are no fixture and record.
// A chain takes `<upto> [call] [<branch>]`: `call` writes the record before the point and prints the
// input of the hooks of its call.
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] && process.argv[3]) {
    const read = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const [, , , , at, mode, branch] = process.argv;
    const fixture = read.points ? chainTurns(read, branch || null) : read;
    const upto = at === undefined ? null : at === 'last' ? fixture.turns.length - 1 : Number(at);
    if (mode === 'call') console.log(JSON.stringify(callInput(fixture, upto, process.argv[3])));
    writeFileSync(
        process.argv[3],
        `${recordOf(fixture, { upto, before: mode === 'call' })
            .map((entry) => JSON.stringify(entry))
            .join('\n')}\n`
    );
}
