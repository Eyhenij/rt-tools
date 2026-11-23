/**
 * The source «source.owner» of the task flow description: the words of the owner in this session,
 * read from the record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`.
 *
 *   messages()    the texts the owner typed, oldest first, during a turn too; a tool result is
 *                 not a message
 *   said(quote)   a typed message holds the quote
 *   last()        the owner's last word: the last message typed or the options chosen in a menu,
 *                 or null
 *
 * What the owner typed is read by the shared rule of the owner's words, `typedOf` of the laid-out
 * `record-count.mjs`: a message typed before a turn or queued during one, a pasted text included; a
 * wrapper or a notice of the harness, a message of a hook, a summary of a compaction and a meta entry
 * are no word. The mark of Esc is a word of its own here: it is the owner's interrupt. Without a
 * record the owner said nothing: an interrupt not found keeps the turn held — the stricter reading.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Next to the laid-out engine one level up, or among the checks of the package.
const SHARED = [join(HERE, '..', '..', 'record-count.mjs'), join(HERE, '..', '..', 'checks', 'record-count.mjs')].find((p) => existsSync(p));
const { typedOf } = await import(pathToFileURL(SHARED).href);

/** The menu answer as the text of a tool result carries it. */
const ANSWERED = /^(?:The user answered|Your questions have been answered):/;

/** The mark the host writes when the owner presses Esc. */
const INTERRUPT_MARK = /^\[Request interrupted by user/;

const ownerEntry = (entry) =>
    entry?.type === 'user' && !entry.isMeta && !entry.isCompactSummary && (entry.origin?.kind ?? 'human') === 'human';

const resultText = (content) =>
    typeof content === 'string' ? content : Array.isArray(content) ? content.map((part) => (typeof part === 'object' ? (part.text ?? '') : '')).join(' ') : '';

/** The mark of Esc of a user entry, or null. */
const interruptOf = (entry) => {
    if (!ownerEntry(entry)) return null;
    const content = entry.message?.content;
    const text = typeof content === 'string' ? content : Array.isArray(content) ? content.filter((part) => part?.type === 'text').map((part) => part.text).join('\n') : '';
    return INTERRUPT_MARK.test(text.trim()) ? text : null;
};

/** The word of one entry of the record: typed text, the mark of Esc or chosen options; null when it carries none. */
export function wordOf(entry) {
    const typed = typedOf(entry);
    if (typed) return typed.text;
    const mark = interruptOf(entry);
    if (mark) return mark;
    if (!ownerEntry(entry)) return null;
    if (entry.toolUseResult?.answers) return Object.values(entry.toolUseResult.answers).join('\n');
    const content = entry.message?.content;
    if (!Array.isArray(content)) return null;
    const answers = content
        .filter((part) => part?.type === 'tool_result' && ANSWERED.test(resultText(part.content)))
        .map((part) => [...resultText(part.content).matchAll(/"=\s*"([^"]*)"/g)].map((match) => match[1]).join('\n'));
    return answers.length > 0 ? answers.join('\n') : null;
}

/**
 * The word that approves, in any case, opening the line or a clause after a comma, a semicolon, a
 * colon or a full stop: «потом одобряю», «не одобряю» and a quoted «Одобряю» approve nothing.
 */
const APPROVING = /(?:^|[,;:.])\s*одобряю(?![\p{L}])/iu;

/** The key of any task, `<KEY>-<number>`, bounded on both sides. */
const ANY_TASK = /(?<![\p{L}\d-])\p{Lu}+-\d+(?!\d)/u;

/** The words that name the plan itself. */
const PLAN_WORD = /(?<![\p{L}])(?:план|plan|замысел)/iu;

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The answers of one owner entry as pairs; a typed message has no question. */
const answersOf = (entry) => {
    const typed = typedOf(entry);
    if (typed) return [{ question: '', answer: typed.text }];
    if (!ownerEntry(entry)) return [];
    if (entry.toolUseResult?.answers) return Object.entries(entry.toolUseResult.answers).map(([question, answer]) => ({ question, answer: String(answer) }));
    const content = entry.message?.content;
    if (!Array.isArray(content)) return [];
    return content
        .filter((part) => part?.type === 'tool_result' && ANSWERED.test(resultText(part.content)))
        .flatMap((part) => [...resultText(part.content).matchAll(/"([^"]*)"=\s*"([^"]*)"/g)].map((match) => ({ question: match[1], answer: match[2] })));
};

/**
 * The line by which the owner approves the plan of `task`, or null. One rule for a menu option and
 * a typed message: every answer of a menu and every line of an answer are judged alone. A line
 * approves when a clause of it opens with «одобряю» and it names the task, the number bounded on
 * both sides. A line that names no task approves when it names `plan.md`, or when the menu question
 * names the task and the line or the question names the plan. A line that names only another task
 * approves nothing.
 */
export function approvalOf(entry, task) {
    const own = new RegExp(`(?<![\\p{L}\\d-])${escapeRe(task)}(?!\\d)`, 'u');
    for (const { question, answer } of answersOf(entry)) {
        for (const line of answer.split('\n')) {
            if (!APPROVING.test(line)) continue;
            if (own.test(line)) return line.trim();
            if (ANY_TASK.test(line)) continue;
            if (/plan\.md/.test(line)) return line.trim();
            if (own.test(question) && (PLAN_WORD.test(line) || PLAN_WORD.test(question))) return line.trim();
        }
    }
    return null;
}

const parse = (file) => {
    const entries = [];
    if (!file || !existsSync(file)) return entries;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            // A line that does not parse is no entry.
        }
    }
    return entries;
};

export function open() {
    let cached = null;
    const entries = () => (cached ??= parse(process.env.RT_FLOW_TRANSCRIPT));
    const messages = () =>
        entries()
            .map((entry) => typedOf(entry)?.text ?? null)
            .filter(Boolean);
    // Esc stops the order typed just before it too: the host sends no queued message after the mark,
    // and over 14–22.11 none of 17 marks within five seconds of a word was followed by it again.
    const last = () => {
        const all = entries();
        for (let index = all.length - 1; index >= 0; index -= 1) {
            const word = wordOf(all[index]);
            if (word !== null) return word;
        }
        return null;
    };
    return { messages, said: (quote) => messages().some((text) => text.includes(quote)), last };
}
