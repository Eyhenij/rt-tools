/**
 * The counter of a session record: what the owner said and what the agent was refused, read from the
 * conversation record Claude Code keeps per session.
 *
 *   ownerWords(entries)    the owner's words, oldest first: { text, at, session, kind }
 *   calls(entries)         the calls of the agent in the main thread: { id, at, session, branch, tool }
 *   refusals(entries)      the refusals, oldest first: { at, session, branch, kind, check }
 *   checkOf(text)          the check a refusal text names, by the table below
 *
 * A refusal is one of three classes, told by the first line of the result. A hook refused a call
 * before it ran (`hook`), the permission mode turned it down (`permission`), or a hook at the end of a
 * turn refused to let it end (`stop`). Every other error result — a non-zero exit of a command, a
 * call the owner turned down, an interrupt, an error of the tool itself — is not a refusal. A stop
 * refusal is counted from the entry `Stop hook feedback:` only; the summary entry of the stop hooks
 * names the same refusal and is not counted again.
 *
 * The owner's words are what a person typed. A wrapper of the harness is no word of the owner: an
 * interrupt mark, a command wrapper or its output, a notification of a task, the feedback of a hook,
 * a meta entry or the summary of a squeeze. A message a person typed while a turn was going on is a
 * word of the owner too: the record keeps it as an entry `attachment` of type `queued_command` whose
 * origin kind is `human`, not as an entry `user`. A queued message the same session later repeats by
 * a typed one counts once.
 *
 * The decisions take the entries as they are and never read the clock or the disk.
 */

/** The opening of a typed entry that the harness writes, not a person. */
const WRAPPER =
    /^(?:\[Request interrupted|Stop hook feedback:|PreToolUse:|PostToolUse:|Caveat:|This session is being continued|Background \(from the session|The app was quit|Another Claude session sent a message)/;

/** An opening tag of the harness; the text a person pasted opens with a tag too and stays a word. */
const HARNESS_TAG = /^<(?!pasted_content\b)[a-z][\w-]*[\s>/]/;

const isWrapper = (text) => WRAPPER.test(text) || HARNESS_TAG.test(text);

const textOf = (content) => {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return null;
    if (content.some((part) => part?.type === 'tool_result')) return null;
    const text = content
        .filter((part) => part?.type === 'text')
        .map((part) => part.text)
        .join('\n');
    return text || null;
};

/** The text a person typed in this entry, before a turn or during one; null for anything else. */
export function typedOf(entry) {
    if (!entry || entry.isMeta || entry.isCompactSummary) return null;
    if (entry.type === 'user') {
        if ((entry.origin?.kind ?? 'human') !== 'human') return null;
        const text = textOf(entry.message?.content);
        return text && !isWrapper(text.trimStart()) ? { text, kind: 'typed' } : null;
    }
    const queued = entry.type === 'attachment' ? entry.attachment : null;
    if (queued?.type !== 'queued_command' || queued.origin?.kind !== 'human') return null;
    const text = textOf(queued.prompt);
    return text && !isWrapper(text.trimStart()) ? { text, kind: 'queued' } : null;
}

const same = (a, b) => a.trim() === b.trim();

/**
 * The beginning of a menu question that names the owner's earlier answer: such a question asks again
 * what the owner already decided. The set is fixed and visible; a question in other words is not
 * counted.
 */
export const REASK = /ваш прошлый ответ|вы уже ответили|не зачла ваш ответ/iu;

/** How much of the beginning of a question the re-ask sign reads. */
export const REASK_SPAN = 120;

/** Whether a menu question asks again what the owner already answered. */
export const isReask = (question) => REASK.test(String(question ?? '').slice(0, REASK_SPAN));

/** The text of a hook the harness hands back to a call it refused. */
const HOOK_ERROR = /^\S+ hook error: |^Agent hook condition was not met: /;

/** The text the permission mode hands back to a call it turned down. */
const PERMISSION = /^Permission for this action was denied/;

/** The entry the harness writes when a hook at the end of a turn refused. */
const STOP_FEEDBACK = /^Stop hook feedback:/;

/**
 * The table from a refusal text to the check it names; the first matching line wins. A check that
 * names itself is taken by its name; the rest are named here.
 */
const CHECK_TABLE = [
    [/BLOCKED by ([a-z0-9][a-z0-9-]*):/, (m) => m[1]],
    [/Refused by the rules gate/, () => 'skill-gate'],
    [/Refused: the epic is over/, () => 'epic-over'],
];

/** The check a refusal text names, or `unnamed`. */
export function checkOf(text) {
    for (const [pattern, name] of CHECK_TABLE) {
        const match = pattern.exec(text ?? '');
        if (match) return name(match);
    }
    return 'unnamed';
}

const resultText = (content) =>
    typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content.map((part) => (typeof part === 'string' ? part : (part?.text ?? ''))).join('\n')
          : '';

const mainThread = (entry) => !entry?.isSidechain;

const unique = (entries) => {
    const seen = new Set();
    return entries.filter((entry) => {
        const id = entry?.uuid;
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

/** The calls of the agent in the main thread of each session; a call of a role is not one. */
export function calls(entries) {
    const out = [];
    for (const entry of unique(entries)) {
        if (entry?.type !== 'assistant' || !mainThread(entry) || !Array.isArray(entry.message?.content)) continue;
        entry.message.content.forEach((part, index) => {
            if (part?.type !== 'tool_use') return;
            out.push({
                id: part.id ?? `${entry.uuid}:${index}`,
                at: entry.timestamp ?? null,
                session: entry.sessionId ?? null,
                branch: entry.gitBranch ?? null,
                tool: part.name ?? null,
            });
        });
    }
    return out;
}

/** The class of an error result by its first line, or null when it is not a refusal. */
export function refusalClass(text) {
    const opening = (text ?? '').trimStart();
    if (HOOK_ERROR.test(opening)) return 'hook';
    if (PERMISSION.test(opening)) return 'permission';
    return null;
}

/** The refusals of the entries, oldest first. */
export function refusals(entries) {
    const out = [];
    for (const entry of unique(entries)) {
        if (entry?.type !== 'user' || !mainThread(entry)) continue;
        const where = { at: entry.timestamp ?? null, session: entry.sessionId ?? null, branch: entry.gitBranch ?? null };
        const content = entry.message?.content;
        const typed = typeof content === 'string' ? content : Array.isArray(content) && !content.some((p) => p?.type === 'tool_result') ? resultText(content) : null;
        if (typed !== null) {
            if (STOP_FEEDBACK.test(typed.trimStart())) out.push({ ...where, kind: 'stop', check: checkOf(typed) });
            continue;
        }
        if (!Array.isArray(content)) continue;
        for (const part of content) {
            if (part?.type !== 'tool_result' || part.is_error !== true) continue;
            const text = resultText(part.content);
            const kind = refusalClass(text);
            if (kind) out.push({ ...where, kind, check: kind === 'permission' ? 'permission' : checkOf(text) });
        }
    }
    return out;
}

/** The owner's words of the entries, oldest first; an entry copied into a resumed session counts once. */
export function ownerWords(entries) {
    const seen = new Set();
    const words = [];
    for (const entry of entries) {
        const id = entry?.uuid ?? entry?.attachment?.delivery_id;
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);
        const word = typedOf(entry);
        if (!word) continue;
        const session = entry.sessionId ?? null;
        const repeat =
            word.kind === 'typed' && words.some((w) => w.kind === 'queued' && w.session === session && same(w.text, word.text));
        if (repeat) continue;
        words.push({ ...word, at: entry.timestamp ?? entry.attachment?.timestamp ?? null, session });
    }
    return words;
}
