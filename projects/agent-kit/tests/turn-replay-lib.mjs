// The record of a conversation built from a recorded turn of `fixtures/turn-replay/`.
//
// A fixture keeps only what the hooks read: the role of an entry, its time, the name of a call, its
// answer code, and the owner's word as a class label or a short phrase with a stop word. The labels
// become synthetic texts here, so the public fixture carries no text the owner typed. The record is
// written in the shape Claude Code writes it: a user entry with text parts, an assistant entry with a
// tool use, a tool result with `is_error`, a menu answer with `toolUseResult.answers`, a refusal at the
// end of a turn as `Stop hook feedback:`, a compaction summary.
//
// Usage: node turn-replay-lib.mjs <fixture.json> <record.jsonl>
import { readFileSync, writeFileSync } from 'node:fs';

/** The synthetic text of each class label. Nothing here matches the stop words of the description. */
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
        return `${head} The step is refused by another check. Ask the owner one menu: «отложить RT-${task}», «сделаю сам», «стоп».`;
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
            `PreToolUse:${turn.call} hook error: [${turn.guard}.sh]: BLOCKED by ${turn.guard}: the call is refused.`,
            true
        );
    return result(at, id, turn.code === 0 ? 'done' : `exit ${turn.code}`, turn.code !== 0);
}

/** The entries of the record, oldest first. */
export function recordOf(fixture) {
    const entries = [];
    fixture.turns.forEach((turn, index) => {
        const at = turn.at;
        const id = `toolu_${index}`;
        if (turn.role === 'owner') entries.push(user(at, [{ type: 'text', text: ownerText(turn.owner) }]));
        else if (turn.role === 'hook') entries.push(user(at, stopFeedback(turn.stop, fixture.task)));
        else if (turn.role === 'harness')
            entries.push(user(at, 'This session is being continued from a previous conversation.', { isCompactSummary: true }));
        else if (turn.say) entries.push(assistant(at, [{ type: 'text', text: turn.say }]));
        else if (turn.menu) {
            const questions = [{ question: turn.menu[0], options: turn.menu.slice(1).map((label) => ({ label })) }];
            entries.push(assistant(at, [{ type: 'tool_use', id, name: 'AskUserQuestion', input: { questions } }]));
            entries.push(answerOf(turn, id, at, turn.menu.slice(1)));
        } else if (turn.call) {
            const input = turn.call === 'Bash' ? { command: turn.command ?? '' } : { file_path: turn.file ?? 'notes.md' };
            entries.push(assistant(at, [{ type: 'tool_use', id, name: turn.call, input }]));
            entries.push(answerOf(turn, id, at, []));
        }
    });
    return entries;
}

if (process.argv[2] && process.argv[3]) {
    const fixture = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    writeFileSync(
        process.argv[3],
        `${recordOf(fixture)
            .map((entry) => JSON.stringify(entry))
            .join('\n')}\n`
    );
}
