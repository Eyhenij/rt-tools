// rt-kit v0.38.0 · task-flow/source/owner.mjs · 4c779cb7f9fd · правится надстройкой, не здесь
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
 * A message of a hook, a summary of a compaction and a meta entry are no word of the owner. Without a
 * record the owner said nothing: an interrupt not found keeps the turn held — the stricter reading.
 */
import { existsSync, readFileSync } from 'node:fs';

/** The menu answer as the text of a tool result carries it. */
const ANSWERED = /^(?:The user answered|Your questions have been answered):/;

/** The mark the host writes when the owner presses Esc. */
const INTERRUPT_MARK = /^\[Request interrupted by user/;

/**
 * How long after a typed message a mark of Esc only delivers it, in milliseconds: over 14–22.11, 10
 * of 154 marks stood within five seconds of a typed message, sent mid-turn.
 */
const DELIVERY_MS = 5_000;

/** A message of a hook arrives as a user entry with this beginning. */
const HOOK_MESSAGE = /^(?:Stop hook feedback|PreToolUse:|PostToolUse:)/;

const ownerEntry = (entry) =>
    entry?.type === 'user' && !entry.isMeta && !entry.isCompactSummary && (entry.origin?.kind ?? 'human') === 'human';

const resultText = (content) =>
    typeof content === 'string' ? content : Array.isArray(content) ? content.map((part) => (typeof part === 'object' ? (part.text ?? '') : '')).join(' ') : '';

const typedText = (content) => {
    if (typeof content === 'string') return HOOK_MESSAGE.test(content) ? null : content;
    if (!Array.isArray(content) || content.some((part) => part?.type === 'tool_result')) return null;
    return content.filter((part) => part?.type === 'text').map((part) => part.text).join('\n') || null;
};

/**
 * A message the owner typed while a turn ran: the host writes it as an `attachment` entry of the kind
 * `queued_command` from a person, with no `user` entry. A wrapper that begins with `<` is no word.
 */
const queuedText = (entry) => {
    const queued = entry?.type === 'attachment' && !entry.isMeta ? entry.attachment : null;
    if (queued?.type !== 'queued_command' || queued.origin?.kind !== 'human') return null;
    const text = typedText(queued.prompt);
    return text && !text.trimStart().startsWith('<') ? text : null;
};

/** The word of one entry of the record: typed text or chosen options; null when it carries neither. */
export function wordOf(entry) {
    const queued = queuedText(entry);
    if (queued) return queued;
    if (!ownerEntry(entry)) return null;
    if (entry.toolUseResult?.answers) return Object.values(entry.toolUseResult.answers).join('\n');
    const typed = typedText(entry.message?.content);
    if (typed) return typed;
    const content = entry.message?.content;
    if (!Array.isArray(content)) return null;
    const answers = content
        .filter((part) => part?.type === 'tool_result' && ANSWERED.test(resultText(part.content)))
        .map((part) => [...resultText(part.content).matchAll(/"=\s*"([^"]*)"/g)].map((match) => match[1]).join('\n'));
    return answers.length > 0 ? answers.join('\n') : null;
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
            .map((entry) => queuedText(entry) ?? (ownerEntry(entry) ? typedText(entry.message?.content) : null))
            .filter(Boolean);
    const last = () => {
        const all = entries();
        let mark = null;
        for (let index = all.length - 1; index >= 0; index -= 1) {
            const word = wordOf(all[index]);
            if (word === null) continue;
            if (mark === null && INTERRUPT_MARK.test(word.trim())) {
                mark = { word, at: Date.parse(all[index].timestamp ?? '') };
                continue;
            }
            // The host writes the mark of Esc right after a message the owner sent mid-turn: within
            // a few seconds of it the mark delivers the message, and the message is the last word.
            if (mark !== null) {
                const at = Date.parse(all[index].timestamp ?? '');
                return Number.isFinite(at) && Number.isFinite(mark.at) && mark.at - at >= 0 && mark.at - at <= DELIVERY_MS ? word : mark.word;
            }
            return word;
        }
        return mark?.word ?? null;
    };
    return { messages, said: (quote) => messages().some((text) => text.includes(quote)), last };
}
