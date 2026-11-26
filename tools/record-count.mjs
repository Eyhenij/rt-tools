// rt-kit v0.41.0 · checks/record-count.mjs · 0018eaa5373b · правится надстройкой, не здесь
/**
 * The counter of a session record: what the owner said and what the agent was refused, read from the
 * conversation record Claude Code keeps per session.
 *
 *   ownerWords(entries)    the owner's words, oldest first: { text, at, session, kind }
 *   calls(entries)         the calls of the agent in the main thread: { id, at, session, branch, tool }
 *   refusals(entries)      the refusals, oldest first: { at, session, branch, kind, check }
 *   checkOf(text)          the check a refusal text names, by the table below
 *   pairs(entries)         ordered pairs of different checks refusing one after another: { first, second, at, session }
 *   interrupts(entries)    the entries where the owner interrupted a turn: { at, session }
 *   corrections(entries, patterns)  the owner's words the set of correction patterns matches
 *   aboutOf(text, patterns) the kind of a typed message: correction, status, order or other
 *
 * A pair is two refusals of different checks with no successful call between them in one session;
 * a repeat of the same check is not a pair. The set of correction patterns is passed in by the caller
 * from the hook that declares it, so the two never hold copies of their own.
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
    // A model check speaks in the frame of the harness, and each event holds one model check: the
    // frame names it, its failure to find or read its own file included. A verdict that quotes the
    // refusal of another guard or a shell error is still its own.
    [/^\s*Stop hook feedback:\s*Agent hook condition was not met: /, () => 'turn-judge'],
    [/^\s*PreToolUse:AskUserQuestion hook error: Agent hook condition was not met: /, () => 'ask-judge'],
    // A neighbouring guard that names the load of a rule is the same round as the gate refusal,
    // only under another hook name, so it is counted as the gate before its own name is read.
    [/The named move is held by the rules gate/, () => 'skill-gate'],
    [/BLOCKED by ([a-z0-9][a-z0-9-]*):/, (m) => m[1]],
    // The dispatcher of the command hooks failed as a shell script — a conflict marker or a syntax
    // error in it: no guard ran, and the text is the error of the shell. A guard that named itself
    // above keeps its name even when a line of the dispatcher stands in its text.
    [/\/hooks\/dispatch\.sh: line \d+: /, () => 'dispatch-broken'],
    [/Refused by the rules gate/, () => 'skill-gate'],
    [/Refused: the epic is over/, () => 'epic-over'],
    // The guards below name no check in their texts; each is told by the opening of its own text.
    [
        /BLOCKED: the work is not ready for delivery|while a conflicting request of your own stands|is merged, and the branch has no open PR|Rewrite the signature before the push|BLOCKED: a request from the branch «|BLOCKED: the task folder /,
        () => 'git-guard-delivery',
    ],
    [
        /BLOCKED: (?:the heavy steps of this tree run ahead|a push without a green local run|several pushes by one command|the command names a push, and the guard cannot read|switching the branch and pushing by one command|the call goes from a second working copy)/,
        () => 'git-guard-push-tests',
    ],
    [/Refused: a commit straight into «/, () => 'git-guard-main'],
    [/Refused: this call takes work, and /, () => 'tree-assignment-guard'],
    [/BLOCKED: the commit edits code but not the document that describes it/, () => 'docs-guard'],
    [/BLOCKED: this is already written\. File: /, () => 'reuse-first-guard'],
    [/No browser is selected in this session\.|The last browser selection was \d+ s ago/, () => 'browser-guard-require-select'],
    [/The profile «[^»]*» is not the one pinned to the project/, () => 'browser-guard-device-id'],
    [/Do not list and do not switch browsers/, () => 'browser-guard-no-listing'],
    [/Do not ask which browser to use/, () => 'browser-guard-no-asking'],
    [/Drive the browser by the pinned extension/, () => 'browser-guard-no-other-drivers'],
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

/** How far apart the record writes one queued message again: the harness repeats it within seconds. */
export const QUEUED_ECHO_MS = 5000;

/**
 * The owner's words of the entries, oldest first; an entry copied into a resumed session counts once.
 * A queued message the record writes again — the same text in the same session within
 * `QUEUED_ECHO_MS` — counts once, so two real messages with the same text minutes apart count twice.
 * A typed word that repeats a message queued since the previous typed word of the session is the same
 * message delivered again and counts once; the same text typed in a later turn counts again.
 */
export function ownerWords(entries) {
    const seen = new Set();
    const words = [];
    const queuedSinceTyped = new Map();
    for (const entry of entries) {
        const id = entry?.uuid ?? entry?.attachment?.delivery_id;
        if (id && seen.has(id)) continue;
        if (id) seen.add(id);
        const word = typedOf(entry);
        if (!word) continue;
        const session = entry.sessionId ?? null;
        const at = entry.timestamp ?? entry.attachment?.timestamp ?? null;
        if (word.kind === 'queued') {
            const echo = (w) =>
                w.kind === 'queued' && w.session === session && same(w.text, word.text) && Math.abs(Date.parse(at) - Date.parse(w.at)) <= QUEUED_ECHO_MS;
            if (words.some(echo)) continue;
            queuedSinceTyped.set(session, [...(queuedSinceTyped.get(session) ?? []), word.text]);
        } else {
            const pending = queuedSinceTyped.get(session) ?? [];
            queuedSinceTyped.set(session, []);
            if (pending.some((text) => same(text, word.text))) continue;
        }
        words.push({ ...word, at, session });
    }
    return words;
}

/** The tools whose successful call changes a file of the tree. */
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const COMMIT_COMMAND = /\bgit\b(?:\s+-c\s+\S+)*\s+commit\b/;
const INTERRUPT = /^\[Request interrupted/;
const ANSWERED = /^(?:The user answered|Your questions have been answered)/;

/** The task of a branch: its key, or the branch itself when it names no task. */
export const taskOf = (branch) => (branch ? (branch.match(/^([A-Z]+-\d+)(?:-|$)/)?.[1] ?? branch) : null);

/**
 * The events of the entries, oldest first — what every count below is made of, and what the hook at
 * the end of a turn writes as observations:
 *
 *   call       a call of the agent (`tool`)
 *   ok         a call whose result came back without an error
 *   refusal    a refusal (`kind`, `check`)
 *   change     a change of the tree: a successful edit or write of a file, or a successful commit;
 *              `analysis` when the file is an incident analysis
 *   word       a word of the owner (`kind`: typed or queued)
 *   menu       an answer of the owner chosen in a menu
 *   interrupt  an entry where the owner interrupted a turn or a call
 *   ask        a menu question (`reask`: it names the owner's earlier answer)
 *
 * Each event carries `at`, `session` and `branch`; `answered` on a menu answer is the task of the
 * question it answers.
 */
/** The path of an incident analysis: a file under a directory named so, or the word the cut keeps for it. */
const ANALYSIS_PATH = /(^|\/)postmortems(\/|$)/;

export function eventsOf(entries) {
    const list = unique(entries).filter(mainThread);
    const results = new Map();
    for (const entry of list) {
        if (!Array.isArray(entry?.message?.content)) continue;
        for (const part of entry.message.content) if (part?.type === 'tool_result') results.set(part.tool_use_id, part.is_error === true);
    }
    const out = [];
    const askTask = new Map();
    const words = ownerWords(list);
    const wordAt = new Set(words.map((w) => `${w.session}|${w.at}|${w.kind}`));
    for (const entry of list) {
        const where = { at: entry.timestamp ?? entry.attachment?.timestamp ?? null, session: entry.sessionId ?? null, branch: entry.gitBranch ?? null };
        const content = Array.isArray(entry.message?.content) ? entry.message.content : [];
        if (entry.type === 'assistant') {
            for (const part of content) {
                if (part?.type !== 'tool_use') continue;
                out.push({ ...where, ev: 'call', tool: part.name ?? null });
                const failed = results.get(part.id) === true;
                const edit = EDIT_TOOLS.has(part.name);
                const commit = part.name === 'Bash' && COMMIT_COMMAND.test(String(part.input?.command ?? ''));
                if (!failed && (edit || commit)) {
                    const analysis = edit && ANALYSIS_PATH.test(String(part.input?.file_path ?? ''));
                    out.push({ ...where, ev: 'change', ...(analysis ? { analysis: true } : {}) });
                }
                if (part.name === 'AskUserQuestion') {
                    askTask.set(part.id, taskOf(where.branch));
                    const questions = Array.isArray(part.input?.questions) ? part.input.questions : [];
                    out.push({ ...where, ev: 'ask', reask: questions.some((q) => q?.reask === true || isReask(q?.question)) });
                }
            }
            continue;
        }
        const word = typedOf(entry);
        // A copy written in the same millisecond shares the key: the word goes out once, by its first copy.
        if (word && wordAt.delete(`${where.session}|${where.at}|${word.kind}`)) out.push({ ...where, ev: 'word', kind: word.kind });
        if (entry.type !== 'user') continue;
        for (const refusal of refusals([entry])) out.push({ ...where, ev: 'refusal', kind: refusal.kind, check: refusal.check });
        for (const part of content) {
            if (part?.type !== 'tool_result') continue;
            if (part.is_error !== true) out.push({ ...where, ev: 'ok' });
            if (part.is_error !== true && ANSWERED.test(resultText(part.content).trimStart()))
                out.push({ ...where, ev: 'menu', answered: askTask.get(part.tool_use_id) ?? taskOf(where.branch) });
        }
        if (entry.toolUseResult?.answers && !content.some((p) => p?.type === 'tool_result' && ANSWERED.test(resultText(p.content).trimStart()))) {
            const id = content.find((p) => p?.type === 'tool_result')?.tool_use_id;
            out.push({ ...where, ev: 'menu', answered: askTask.get(id) ?? taskOf(where.branch) });
        }
        const texts = typeof entry.message?.content === 'string' ? [entry.message.content] : content.map((p) => (p?.type === 'tool_result' ? resultText(p.content) : (p?.text ?? '')));
        if (texts.some((text) => INTERRUPT.test(text.trimStart()))) out.push({ ...where, ev: 'interrupt' });
    }
    return out.filter((e) => e.at).sort((a, b) => a.at.localeCompare(b.at));
}

/** Ordered pairs of different checks refusing one after another in a session, with no successful call between. */
export function pairsOf(events) {
    const out = [];
    const last = new Map();
    for (const e of events) {
        if (e.ev === 'ok') last.delete(e.session);
        if (e.ev !== 'refusal') continue;
        const before = last.get(e.session);
        if (before && before !== e.check) out.push({ first: before, second: e.check, at: e.at, session: e.session });
        last.set(e.session, e.check);
    }
    return out;
}

const minutesBetween = (from, to) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 60000));

/**
 * The idle stretches: from a refusal to the next change of the tree in any session the events hold.
 * A refusal inside an open stretch adds nothing; a stretch no change closes ends at the last event of
 * its day. A stretch belongs to the day it started, in UTC.
 */
export function idleOf(events) {
    const lastOfDay = new Map();
    for (const e of events) lastOfDay.set(e.at.slice(0, 10), e.at);
    const out = [];
    let open = null;
    for (const e of events) {
        if (e.ev === 'refusal' && !open) open = e.at;
        else if (e.ev === 'change' && open) {
            out.push({ from: open, to: e.at, minutes: minutesBetween(open, e.at), day: open.slice(0, 10) });
            open = null;
        }
    }
    if (open) {
        const to = lastOfDay.get(open.slice(0, 10)) ?? open;
        out.push({ from: open, to, minutes: minutesBetween(open, to), day: open.slice(0, 10), open: true });
    }
    return out;
}

/**
 * The re-asks: a menu question whose beginning names the owner's earlier answer, asked in a task
 * where a menu question was already answered. A question a check refused counts: it was asked.
 */
export function reasksOf(events) {
    const answered = new Set();
    const out = [];
    for (const e of events) {
        if (e.ev === 'menu') answered.add(e.answered);
        if (e.ev === 'ask' && e.reask && answered.has(taskOf(e.branch))) out.push({ at: e.at, session: e.session, task: taskOf(e.branch) });
    }
    return out;
}

/** The length from which a series of refusals of one check is a dead end. */
export const DEAD_END_SERIES = 3;

/** The longest pause between two refusals of one series; a longer one starts a new series. */
export const DEAD_END_GAP_MS = 15 * 60 * 1000;

/**
 * The dead ends: DEAD_END_SERIES or more refusals of one check in one session and one task, each
 * within DEAD_END_GAP_MS of the one before, that the executor did not leave by itself — a word of the
 * owner, typed or chosen in a menu, fell between the first and the last of them, or no change of the
 * tree came after the last one in that session.
 */
export function deadEndsOf(events) {
    const series = new Map();
    const groups = [];
    for (const e of events) {
        if (e.ev !== 'refusal') continue;
        const key = `${e.session}|${taskOf(e.branch)}|${e.check}`;
        const open = series.get(key);
        if (open && Date.parse(e.at) - Date.parse(open[open.length - 1].at) <= DEAD_END_GAP_MS) open.push(e);
        else {
            const group = [e];
            series.set(key, group);
            groups.push(group);
        }
    }
    const out = [];
    for (const group of groups) {
        if (group.length < DEAD_END_SERIES) continue;
        const { session, check, branch } = group[0];
        const from = group[0].at;
        const to = group[group.length - 1].at;
        const answered = events.some((e) => (e.ev === 'word' || e.ev === 'menu') && e.session === session && e.at > from && e.at < to);
        const moved = events.some((e) => e.ev === 'change' && e.session === session && e.at > to);
        if (answered || !moved) out.push({ session, task: taskOf(branch), check, count: group.length, from, to });
    }
    return out;
}

// The same counts read straight from the entries of a record.
export const pairs = (entries) => pairsOf(eventsOf(entries));
export const idle = (entries) => idleOf(eventsOf(entries));
export const reasks = (entries) => reasksOf(eventsOf(entries));
export const deadEnds = (entries) => deadEndsOf(eventsOf(entries));
export const treeChanges = (entries) => eventsOf(entries).filter((e) => e.ev === 'change');
export const interrupts = (entries) => eventsOf(entries).filter((e) => e.ev === 'interrupt');

/** The reasons the rules gate writes into its refusal note, in the order the report names them. */
export const GATE_REASONS = ['too-long', 'together', 'not-read', 'before'];

/**
 * The rules gate on a day, from its own notes in the observations: a refusal `gate-deny` counted by
 * the reason it carries in `why` (a note with no reason, or a reason the list does not know, counts as
 * `none`), and a delivery `gate-deliver` — one rule put into the session with no refusal. A note of
 * the hook scenarios carries the version `dev` and is not counted: it judged no session of the tree.
 */
export function gateOf(observations, day) {
    const refused = Object.fromEntries([...GATE_REASONS, 'none'].map((why) => [why, 0]));
    let delivered = 0;
    for (const o of observations) {
        if (o.v === 'dev' || !String(o.t ?? '').startsWith(day)) continue;
        if (o.ev === 'gate-deny') refused[GATE_REASONS.includes(o.why) ? o.why : 'none'] += 1;
        if (o.ev === 'gate-deliver') delivered += 1;
    }
    return { refused, delivered };
}

/** A question about where the work stands, in the owner's words. */
const STATUS = /где стоим|статус|что сейчас|что делаешь|на каком этапе|сколько осталось|ну что там|where are we|\bstatus\b/iu;

/** An order at the opening of a message: a verb of the imperative that starts or resumes work. */
const ORDER =
    /^(?:\S+,\s*)?(?:заведи|сделай|делай|возьми|бери|начни|начинай|продолжай|продолжи|дальше|давай|го|запусти|почисти|веди|ставь|поставь|добавь|убери|удали|влей|слей|сливай|выпусти|напиши|проверь|посмотри|изучи|прочитай|перенеси|обнови|подними|go|start|continue|make|add|remove|merge|release|write)(?=[\s,.!:]|$)/iu;

/**
 * The kind of a message the owner typed, by the words of it alone: `correction` when the set of correction
 * patterns matches it, `status` for a question where the work stands, `order` for an order to start or
 * resume work, and `other` for what no pattern knows. The kinds are checked in that order, so a correction
 * worded as an order stays a correction.
 */
export function aboutOf(text, patterns) {
    const said = String(text ?? '').trim();
    if (patterns && new RegExp(patterns, 'iu').test(said)) return 'correction';
    if (STATUS.test(said)) return 'status';
    if (ORDER.test(said)) return 'order';
    return 'other';
}

/** The owner's words the set of correction patterns matches, a message queued during a turn included. */
export function corrections(entries, patterns) {
    const pattern = new RegExp(patterns, 'iu');
    return ownerWords(entries).filter((word) => pattern.test(word.text));
}
