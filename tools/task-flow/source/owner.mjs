// rt-kit v0.40.0 · task-flow/source/owner.mjs · 0e7529a53789 · правится надстройкой, не здесь
/**
 * The source «source.owner» of the task flow description: the words of the owner in this session,
 * read from the record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`.
 *
 *   messages()    the texts the owner typed, oldest first, during a turn too; a tool result is
 *                 not a message
 *   said(quote)   a typed message holds the quote
 *   last()        the owner's last word: the last message typed or the options chosen in a menu,
 *                 or null
 *   turnOpener()  what opened the current turn — a word of the owner or a notice — see `turnOpener`
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

/** The text the owner typed into a refused call: «… To tell you how to proceed, the user said:\n<text>». */
const REFUSED_WITH_TEXT = /^The user doesn't want to proceed with this tool use\.[\s\S]*?the user said:\s*\n([\s\S]+)$/;

const refusalOf = (entry) =>
    ownerEntry(entry) && Array.isArray(entry.message?.content)
        ? (entry.message.content.map((part) => (part?.type === 'tool_result' ? REFUSED_WITH_TEXT.exec(resultText(part.content).trim())?.[1]?.trim() : null)).find(Boolean) ?? null)
        : null;

const timeOf = (entry) => ((stamp) => (Number.isFinite(stamp) ? stamp : null))(Date.parse(entry?.timestamp ?? entry?.attachment?.timestamp ?? ''));
/** A text a person queued counts when it is queued: `/stop` stays in the queue only, a word waits behind notices. */
const enqueued = (entry) => (entry?.type === 'queue-operation' && entry.operation === 'enqueue' ? String(entry.content ?? '').trim() : null);
const queuedWord = (text) => Boolean(text) && !text.startsWith('<') && !WAKE.test(text) && !NO_PROMPT.test(text);
/** The owner's words, oldest first: { text, at, kind, index } — typed, queued, interrupt, menu or refusal; `at` in ms or null, `index` the place of the entry. */
export function wordsOf(entries) {
    return entries.flatMap((entry, index) => {
        const at = timeOf(entry);
        const typed = typedOf(entry) ?? (queuedWord(enqueued(entry)) ? { text: enqueued(entry), kind: 'queued' } : null);
        if (typed) return [{ text: typed.text, at, kind: typed.kind, index }];
        const refused = refusalOf(entry);
        if (refused) return [{ text: refused, at, kind: 'refusal', index }];
        const word = wordOf(entry);
        return word === null ? [] : [{ text: word, at, kind: INTERRUPT_MARK.test(word.trim()) ? 'interrupt' : 'menu', index }];
    });
}
const WAKE = /^(?:<task-notification>|Another Claude session sent a message|Background \(from the session)/;
const NO_PROMPT = /^(?:\[Request interrupted by user|Stop hook feedback:|Caveat:|This session is being continued)/;

/**
 * What opened the current turn: { by, text, at, index } — `by` 'owner' for a prompt a person typed, a
 * command included, 'wake' for a notice, a line of `Monitor` or a message of another session; `at` the
 * time of the nearest queueing of its text no earlier delivery took. A tool result, the Esc mark and a
 * hook's feedback open no turn.
 */
export function turnOpener(entries) {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const entry = entries[index];
        const content = entry?.message?.content;
        if (entry?.type !== 'user' || entry.isMeta || entry.isCompactSummary || (Array.isArray(content) && content.some((part) => part?.type === 'tool_result'))) continue;
        const text = resultText(content).trim();
        if (!text || NO_PROMPT.test(text)) continue;
        let back = index - 1, taken = 0;
        for (; back >= Math.max(0, index - 400); back -= 1) {
            if (entries[back]?.type === 'user' && resultText(entries[back].message?.content).trim() === text) taken += 1;
            else if (enqueued(entries[back]) === text && taken-- === 0) break;
        }
        const at = (back >= Math.max(0, index - 400) ? timeOf(entries[back]) : null) ?? timeOf(entry);
        return { by: (entry.origin?.kind ?? 'human') === 'human' && !WAKE.test(text) ? 'owner' : 'wake', text, at, index };
    }
    return null;
}

/** The approving word, in any case; «не одобряю», «не очень одобряю» and «нет одобряю» approve nothing. */
const APPROVING = /(?<![\p{L}])(?<!(?:не|нет)(?:\s+\p{L}+)?\s+)одобряю(?![\p{L}])/iu;

/**
 * Words that make a line no plain approval: a condition, a change asked for, a time after the
 * answer, a dictated or quoted phrase. One of them anywhere in the line refuses the whole line.
 */
const LINE_HOLDS =
    /(?<![\p{L}])(?:если|когда|после|потом|позже|кроме|исключением|условии|частично|однако|хотя|переделай|переделать|перепиши|убери|исправь|сначала|напиши|написал|вариант)(?![\p{L}])/iu;

/** Words that make their own clause no approval: «но» and «только» narrow what is approved. */
const CLAUSE_HOLDS = /(?<![\p{L}])(?:но|только)(?![\p{L}])/iu;

/** The words that name the plan itself, in their cases; «планшет» and «plan-red» are not it. */
const PLAN_WORD = /(?<![\p{L}])(?:план(?:а|у|ом|е|ы|ов)?|plan_md|plan|замысел|замысла|замыслу|замыслом|замысле)(?![\p{L}-])/giu;

/** Words that name another thing approved, not the plan. */
const OTHER_THING = /(?<![\p{L}])(?:макет|витрин|дизайн|mockup|showcase|разбор|мерж|merge|спек|договорённост|выпуск|релиз|release|pr(?![\p{L}]))/iu;

/** The same plan words for a plain test: the global form above keeps a position between calls. */
const NAMES_PLAN = new RegExp(PLAN_WORD.source, 'iu');

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The pasted blocks of a typed message: a paste is no word of the owner about the plan. */
const PASTED = /<pasted_content[^>]*>[\s\S]*?<\/pasted_content>/g;

/** A quoted part of a line, in any quotes the owner types: a quote is no word of theirs. */
const QUOTED = /«[^»]*»|„[^“”]*[“”]|"[^"]*"|“[^”]*”|`[^`]*`/g;

/** The clauses of a line with their ends; `plan.md` keeps its dot, a dash inside a key is a hyphen. */
const clausesOf = (line) =>
    [
        ...line
            .replace(/plan\.md/gi, 'plan_md')
            .replace(/(\p{L})[–—](\d)/gu, '$1-$2')
            .matchAll(/[^,;:.!?]+[,;:.!?]*/g),
    ].map((match) => match[0]);

/** The answers of one owner entry as pairs: the answers of a real menu, or a typed message with no question. */
const answersOf = (entry) => {
    const typed = typedOf(entry);
    if (typed) return [{ question: '', answer: typed.text }];
    if (!ownerEntry(entry) || !entry.toolUseResult?.answers) return [];
    return Object.entries(entry.toolUseResult.answers).map(([question, answer]) => ({ question, answer: String(answer) }));
};

/** The task keys named right after a plan word: «план RT-12», «план эпика RT-3471». */
const plannedKeys = (text, keysOf) =>
    [...text.matchAll(PLAN_WORD)].map((match) => keysOf(text.slice(match.index + match[0].length))[0]).filter(Boolean);

/**
 * The line by which the owner approves the plan of `task`, or null. One rule for the answers of a
 * real menu and a typed message: every answer, every line and every clause — the part between
 * commas, semicolons, colons, full stops and marks — are judged alone; a pasted block, a quoted
 * part and a line opening with «>» are no word. A clause approves when it holds «одобряю» with no
 * negation before it, holds no «?», no «но» or «только», and its line holds no word of
 * `LINE_HOLDS`. A clause naming the plan approves the task named right after the plan word; a
 * clause naming tasks without it approves them all unless it names another thing approved. A
 * clause naming no task approves when the menu question names this task and no other, or names it
 * right after a plan word, and the plan is named; or by `plan.md` when the question names no task.
 */
export function approvalOf(entry, task) {
    const own = task.toUpperCase();
    const key = new RegExp(`(?<![\\p{L}\\d-])${escapeRe(task.split('-')[0])}-\\d+(?!\\d)`, 'giu');
    const keysOf = (text) => [...text.matchAll(key)].map((match) => match[0].toUpperCase());
    for (const { question, answer } of answersOf(entry)) {
        const asked = keysOf(question);
        const askedOwn = (asked.length > 0 && asked.every((name) => name === own)) || plannedKeys(question, keysOf)[0] === own;
        for (const line of answer.replace(PASTED, '').split('\n')) {
            if (/^\s*>/.test(line) || LINE_HOLDS.test(line)) continue;
            for (const clause of clausesOf(line.replace(QUOTED, ' '))) {
                if (!APPROVING.test(clause) || clause.includes('?') || CLAUSE_HOLDS.test(clause)) continue;
                const named = keysOf(clause);
                const plan = NAMES_PLAN.test(clause);
                if (named.length > 0) {
                    if (plan ? plannedKeys(clause, keysOf).includes(own) : named.includes(own) && !OTHER_THING.test(clause)) return line.trim();
                    continue;
                }
                if (OTHER_THING.test(clause) && !plan) continue;
                if (askedOwn && (plan || NAMES_PLAN.test(question))) return line.trim();
                if (asked.length === 0 && /plan_md/i.test(clause)) return line.trim();
            }
        }
    }
    return null;
}

const parse = (file) => {
    const entries = [];
    if (!file || !existsSync(file)) return entries;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        // Only a user entry, the queue and a queued command carry a word; a plain tool result carries none.
        if (!/"type":"(?:user|queue-operation)"|"queued_command"/.test(line) || (line.includes('"tool_result"') && !/"answers"|doesn't want to proceed/.test(line))) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {}
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
    return { messages, said: (quote) => messages().some((text) => text.includes(quote)), last, words: () => wordsOf(entries()), turnOpener: () => turnOpener(entries()) };
}
