#!/usr/bin/env node
/**
 * The cut of a real conversation record for the suites on saved data.
 *
 *   node cut-record.mjs <record.jsonl> <cut.jsonl> [--from <ISO time>] [--to <ISO time>]
 *   node cut-record.mjs --self-test
 *
 * The readers of the record read its shape, not its prose: the kind of an entry, its time and id,
 * the tool a call names, the role a call asks for, the menu answers, the codes, the refusal lines of
 * the hooks, the exam line and the token count. The cut keeps exactly that and puts a placeholder in
 * place of any other text, so the conversation itself does not land in the tree. The home directory
 * and mail addresses are replaced in what is kept.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { buildModel } from '../../assets/checks/flow-model.mjs';
import { approvingAnswer } from '../../assets/checks/flow-plan.mjs';
import { calls, isReask, ownerWords, refusals } from '../../assets/checks/record-count.mjs';
import { wordOf } from '../../assets/task-flow/source/owner.mjs';
import { scrubber } from './scrub.mjs';

// The placeholder reads as plain words: a reader takes a text that opens like a tag for a wrapper of
// the harness and drops it. The digest after it keeps two equal texts equal — the counter of the
// owner's words counts a queued message and its typed repeat once — and gives nothing of the text.
const TEXT = 'text cut';
const placeholder = (text) => `${TEXT} ${createHash('sha256').update(text.trim()).digest('hex').slice(0, 10)}`;
const KEPT_TYPES = new Set(['user', 'assistant', 'system', 'attachment']);
/**
 * The opening of an error result by which the counter tells a refusal and its check: the hook error
 * prefix with the name of the check, or the denial of the permission mode. Only the opening is kept.
 */
const REFUSAL_OPENING =
    /^(?:(?:\S+ hook error: |Agent hook condition was not met: )(?:BLOCKED by [a-z0-9][a-z0-9-]*:|BLOCKED:|Refused by the rules gate|Refused: the epic is over)?|Permission for this action was denied)/;
/** A commit in a shell command: a change of the tree for the idle time. */
const COMMIT = /\bgit\b(?:\s+-c\s+\S+)*\s+commit\b/;
/** Lines a reader looks for inside text: a hook refusal, the exam result, the handoff marker. */
const KEPT_LINE = /BLOCKED by|Refused by|ЭКЗАМЕН:|EXAM:|СОВЕСТЬ:|CONSCIENCE:|handoff|передач[аи]\s+захода/;
/**
 * The pieces of a shell command the hooks look for in the record: opening and lifting a PR, a run
 * read or rerun with its number, a read of a rule file, an incident analysis. The cut keeps the
 * pieces and drops the rest of the command — its paths and words belong to the conversation.
 */
const COMMAND_PIECE =
    /\b(?:gh|glab)\s+(?:pr\s+(?:create|ready)|mr\s+(?:create|update[^|;&\n]*--ready)|run\s+(?:view|rerun)(?:\s+\d{6,})?(?:\s+--log(?:-failed)?)?|ci\s+(?:retry|trace|view)(?:\s+\d{6,})?)|skills\/[\w-]+|postmortems/g;
/**
 * A typed line of the owner the reminder count reads — the pattern `words.nudge` of the task flow
 * description: «продолжай», «что дальше». Such a line is kept, the rest of the owner's text is not.
 */
const NUDGE = new RegExp(buildModel(new URL('../../assets/task-flow/flow.js', import.meta.url).pathname).words.nudge, 'iu');
/**
 * The beginning by which a reader tells a hook message or a wrapper of the harness from the owner's
 * words; the matched beginning is kept, the rest of its line is not.
 */
const HOOK_START =
    /^(?:Stop hook feedback:|PreToolUse:|PostToolUse:|<[a-z][\w-]*[\s>]|\[Request interrupted|Background \(from the session|The app was quit|This session is being continued|Caveat:|Another Claude session sent a message:)/;
const HOME = homedir();

const scrub = scrubber();

/** Text with only the lines a reader looks for; any other text becomes the placeholder. */
function keptText(text) {
    if (typeof text !== 'string') return TEXT;
    // A reader trims the text before it looks at the beginning, and so does the cut.
    const body = text.trimStart();
    const lines = body.split('\n').filter((line) => KEPT_LINE.test(line) || NUDGE.test(line));
    // The first line kept whole keeps its beginning; otherwise the matched beginning goes first.
    const first = body.split('\n')[0];
    const start = first.match(REFUSAL_OPENING)?.[0] || body.match(HOOK_START)?.[0];
    const kept = start && lines[0] !== first ? [start, ...lines] : lines;
    return kept.length > 0 ? scrub(kept.join('\n')) : placeholder(body);
}

const textOf = (value) =>
    typeof value === 'string'
        ? value
        : Array.isArray(value)
          ? value.map((part) => (typeof part === 'string' ? part : (part?.text ?? ''))).join('\n')
          : '';

function cutPart(part) {
    if (!part || typeof part !== 'object') return { type: 'text', text: TEXT };
    if (part.type === 'tool_use') {
        const input = {};
        for (const key of ['subagent_type', 'skill']) if (typeof part.input?.[key] === 'string') input[key] = part.input[key];
        if (typeof part.input?.command === 'string') {
            const pieces = part.input.command.match(COMMAND_PIECE) ?? [];
            if (COMMIT.test(part.input.command)) pieces.push('git commit');
            input.command = pieces.length > 0 ? pieces.join('\n') : 'command cut';
        }
        // A write into the analyses directory closes an epic window; only that mark of the path is kept.
        if (typeof part.input?.file_path === 'string' && /\/postmortems\//.test(part.input.file_path)) input.file_path = 'postmortems';
        // A menu question keeps only the sign that it asks again what the owner already answered.
        if (Array.isArray(part.input?.questions)) {
            input.questions = part.input.questions.map((q) => (isReask(q?.question) ? { reask: true } : {}));
        }
        // The report a role hands back: the hook of the role metrics reads its verdict from the first
        // line, and only that line is kept.
        if (part.name === 'SubagentHandback' && typeof part.input?.message === 'string') {
            input.message = scrub(part.input.message.split('\n').find((line) => line.trim() !== '') ?? '');
        }
        return { type: 'tool_use', id: part.id, name: part.name, input };
    }
    if (part.type === 'tool_result') {
        const out = { type: 'tool_result', tool_use_id: part.tool_use_id, content: keptText(textOf(part.content)) };
        if (part.is_error) out.is_error = true;
        return out;
    }
    return { type: part.type ?? 'text', text: keptText(part.text) };
}

function cutMessage(message) {
    if (!message || typeof message !== 'object') return undefined;
    const out = { role: message.role };
    if (typeof message.content === 'string') out.content = keptText(message.content);
    else if (Array.isArray(message.content)) out.content = message.content.map(cutPart);
    if (message.usage) {
        out.usage = {};
        for (const key of ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens']) {
            if (typeof message.usage[key] === 'number') out.usage[key] = message.usage[key];
        }
    }
    return out;
}

function cutResult(result) {
    if (result && typeof result === 'object' && result.answers && typeof result.answers === 'object') {
        // A menu answer is read word for word: the approval and the consent are in it. The question
        // is the session's own text and is replaced by its number.
        const answers = {};
        Object.values(result.answers).forEach((answer, index) => (answers[`q${index + 1}`] = scrub(String(answer))));
        return { answers };
    }
    return keptText(textOf(result) || (result && typeof result === 'object' ? JSON.stringify(result) : String(result)));
}

/** One entry of the record as the cut keeps it. */
export function cutEntry(entry) {
    const out = {};
    // The marks by which a reader tells the owner's words from a meta entry, a summary and a message
    // that did not come from a person.
    for (const key of [
        'type',
        'subtype',
        'timestamp',
        'uuid',
        'parentUuid',
        'isSidechain',
        'isMeta',
        'isCompactSummary',
        'sessionId',
        'gitBranch',
    ]) {
        if (entry[key] !== undefined) out[key] = entry[key];
    }
    // Of the origin only its kind is read; the rest carries the text of another session.
    if (entry.origin && typeof entry.origin === 'object') out.origin = { kind: entry.origin.kind };
    // A message queued during a turn: its type, its mode and the kind of its origin; the text becomes
    // the placeholder with its digest.
    if (entry.attachment && typeof entry.attachment === 'object') {
        const a = entry.attachment;
        out.attachment = { type: a.type };
        if (a.commandMode !== undefined) out.attachment.commandMode = a.commandMode;
        if (a.origin && typeof a.origin === 'object') out.attachment.origin = { kind: a.origin.kind };
        if (a.delivery_id !== undefined) out.attachment.delivery_id = a.delivery_id;
        if (a.timestamp !== undefined) out.attachment.timestamp = a.timestamp;
        if (a.prompt !== undefined) out.attachment.prompt = keptText(textOf(a.prompt));
    }
    const message = cutMessage(entry.message);
    if (message) out.message = message;
    if (entry.toolUseResult !== undefined) out.toolUseResult = cutResult(entry.toolUseResult);
    if (Array.isArray(entry.hookErrors)) out.hookErrors = entry.hookErrors.map((error) => keptText(String(error)));
    return out;
}

/** The entries of a record between two moments, cut; a line that does not parse is skipped. */
export function cutRecord(text, { from = '', to = '' } = {}) {
    const lines = [];
    for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        let entry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }
        // The readers look at the turns and the hook summaries; the service entries of the host are
        // the bulk of a record and carry nothing a reader asks.
        if (!KEPT_TYPES.has(entry.type)) continue;
        // Of the attachments only a message queued during a turn is read.
        if (entry.type === 'attachment' && entry.attachment?.type !== 'queued_command') continue;
        const at = entry.timestamp ?? '';
        if ((from && at && at < from) || (to && at && at > to)) continue;
        lines.push(JSON.stringify(cutEntry(entry)));
    }
    return lines.join('\n') + '\n';
}

const entriesOf = (text) =>
    text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));

/** The approval read on the cut equals the one read on the sample, and no private text is kept. */
function selfTest() {
    const call = (role, n) => ({
        type: 'assistant',
        timestamp: `2026-11-13T10:0${n}:00Z`,
        message: {
            role: 'assistant',
            content: [{ type: 'tool_use', id: `t${n}`, name: 'Agent', input: { subagent_type: role, prompt: `${HOME}/private text` } }],
        },
    });
    const sample = [
        { type: 'user', timestamp: '2026-11-13T10:00:00Z', message: { role: 'user', content: 'a private request, owner@example.com' } },
        call('product-strategist', 1),
        call('goal-critic', 2),
        {
            type: 'user',
            timestamp: '2026-11-13T10:03:00Z',
            message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't3', content: 'private choice' }] },
            toolUseResult: { questions: [{ question: 'private question' }], answers: { 'private question': 'Одобряю plan.md RT-1' } },
        },
        {
            type: 'user',
            timestamp: '2026-11-13T10:04:00Z',
            message: { role: 'user', content: 'Stop hook feedback:\nBLOCKED by turn-exit-guard: the stage is not over' },
        },
        { type: 'user', isMeta: true, timestamp: '2026-11-13T10:05:00Z', message: { role: 'user', content: 'private meta' } },
        {
            type: 'attachment',
            sessionId: 's1',
            timestamp: '2026-11-13T10:06:00Z',
            attachment: {
                type: 'queued_command',
                commandMode: 'prompt',
                origin: { kind: 'human' },
                prompt: 'private queued word',
                delivery_id: 'd1',
            },
        },
        {
            type: 'user',
            uuid: 'u7',
            sessionId: 's1',
            timestamp: '2026-11-13T10:07:00Z',
            message: { role: 'user', content: 'private queued word' },
        },
        {
            type: 'user',
            uuid: 'u8',
            sessionId: 's1',
            timestamp: '2026-11-13T10:08:00Z',
            message: {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: 't8',
                        is_error: true,
                        content: 'PreToolUse:Bash hook error: Refused: the epic is over — private detail',
                    },
                    {
                        type: 'tool_result',
                        tool_use_id: 't9',
                        is_error: true,
                        content: 'Permission for this action was denied by the classifier. private',
                    },
                    { type: 'tool_result', tool_use_id: 't10', is_error: true, content: 'Exit code 1\nprivate output' },
                ],
            },
        },
        { type: 'attachment', timestamp: '2026-11-13T10:09:00Z', attachment: { type: 'file', content: 'private file' } },
    ];
    const cut = cutRecord(sample.map((entry) => JSON.stringify(entry)).join('\n'));
    const cutEntries = entriesOf(cut);
    const before = approvingAnswer(sample, 'RT-1');
    const after = approvingAnswer(cutEntries, 'RT-1');
    const problems = [];
    if (!before || before !== after) problems.push(`the approval differs: ${before} / ${after}`);
    // Whose word an entry is stays the same: a hook message and a meta entry are no word of the owner
    // on the cut either, and a menu answer is the same word.
    const whose = (entries) =>
        entries.map((entry) => (wordOf(entry) === null ? 'none' : entry.toolUseResult?.answers ? wordOf(entry) : 'typed'));
    // An attachment other than a queued message is not kept, and has no word to compare.
    const keptSample = sample.filter((entry) => entry.type !== 'attachment' || entry.attachment?.type === 'queued_command');
    if (whose(keptSample).join('|') !== whose(cutEntries).join('|'))
        problems.push(`the owner's words differ: ${whose(keptSample)} / ${whose(cutEntries)}`);
    // The counter of the record answers the same on the cut: the owner's words, the calls, the
    // refusals with their class and check.
    const counted = (entries) =>
        JSON.stringify([ownerWords(entries).length, calls(entries).length, refusals(entries).map((r) => `${r.kind}:${r.check}`)]);
    if (counted(sample) !== counted(cutEntries)) problems.push(`the counts differ: ${counted(sample)} / ${counted(cutEntries)}`);
    if (cut.includes(HOME) || /owner@example\.com|private/.test(cut)) problems.push('the cut keeps private text');
    if (problems.length > 0) {
        console.log(problems.map((problem) => `cut-record: ${problem}`).join('\n'));
        return 1;
    }
    console.log('cut-record: self-test ok');
    return 0;
}

function main(argv) {
    if (argv[0] === '--self-test') return selfTest();
    const [input, output, ...rest] = argv;
    if (!input || !output) {
        console.error('usage: node cut-record.mjs <record.jsonl> <cut.jsonl> [--from <ISO>] [--to <ISO>] | --self-test');
        return 2;
    }
    const option = (name) => {
        const at = rest.indexOf(name);
        return at >= 0 ? (rest[at + 1] ?? '') : '';
    };
    const cut = cutRecord(readFileSync(input, 'utf8'), { from: option('--from'), to: option('--to') });
    writeFileSync(output, cut);
    console.log(`cut-record: ${cut.split('\n').filter(Boolean).length} entries`);
    return 0;
}

process.exit(main(process.argv.slice(2)));
