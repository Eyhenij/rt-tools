// rt-kit v0.42.0 · task-flow/measure/owner.mjs · 02cac9414fb2 · правится надстройкой, не здесь
/**
 * The measurer «measure.owner» — what the owner's words say about the turn: a stop that stands, an
 * interrupt, or a push to go on.
 *
 * The stop is a state walked over the owner's words of the record, oldest first, not the last word:
 *
 *   work    + the Esc mark, a stop signal                          → stopped
 *   work    + the Esc mark and a message after it within 2 s       → the message alone is judged
 *   stopped + a question, swearing, «пиши инцидент»                → stopped, the order is carried out
 *   stopped + a working order, a complaint about the stop,
 *             a menu answer naming a task                           → work
 *   any     + «без предпочтения», a notice, a neighbour's message  → unchanged
 *
 * Inside one message the last signal decides. A word of `words.stop` signals a stop at the opening of
 * the message, unless a word of `words.holdAfter` follows it; a phrase of `words.stopInside` anywhere,
 * and its one word where it closes its part of the message. A word of `words.resume` is a working
 * order. A word with «не» before it is no signal. A part of the message — split by «.», «,», «;» and
 * by «и», «затем», «потом» — that holds a word of `words.stay` carries no order, while a stop word in
 * it still stops. While the stop stands, `stopCall` refuses the calls of a turn no word of the owner
 * opened, and `backgroundBeforeStop` holds the end of a turn until own background before the stop is down.
 */
/** The mark the host writes into the record when the owner presses Esc. */
const INTERRUPT = /^\[Request interrupted by user/;
/** A message after the Esc mark within this many milliseconds interrupted the turn by itself. */
const ESC_WINDOW = 2000;
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A word of the list as a whole word, with no «не» or «don't» before it; `prefix` lets a case ending
 * follow. The longer entries go first: «прекрати работать» is found before «прекрати».
 */
const listRe = (list, prefix = false) =>
    Array.isArray(list) && list.length > 0
        ? new RegExp(
              `(?<![\\p{L}])(?<!не\\s)(?<!don't\\s)(?<!do not\\s)(?:${[...list].sort((a, b) => b.length - a.length).map(escapeRe).join('|')})${prefix ? '' : '(?![\\p{L}])'}`,
              'giu'
          )
        : null;

/** A quoted word is named, not said: «Ожидание и убрать «стоп»» stops nothing. Positions are kept. */
const unquoted = (text) => text.replace(/«[^«»]*»|"[^"]*"|“[^”]*”/gu, (quote) => ' '.repeat(quote.length));

const PART_SPLIT = /[.,;]+|\s(?:и|затем|потом)\s/iu;

/** The positions of the matches of `re` in `text`. */
const at = (re, text) => (re ? [...text.matchAll(re)].map((match) => match.index) : []);

/** The sentence from `from` is a question: it ends with «?» before «.», «!» or a new line; «0.40» is no end. */
const asked = (text, from) => /^(?:[^.!?\n]|\.(?=\d))*\?/u.test(text.slice(from));

/** A task key, «RT-3673». */
const TASK = /(?<![\p{L}\d])[A-Z]+-\d+(?!\d)/gu;

/** A task key orders work alone or after one word: «давай RT-3673»; «ты сломал RT-3602» is a reproach. */
const keyed = (part) => ((part.replace(TASK, ' ').match(/\p{L}+/gu) ?? []).length <= 1 ? at(TASK, part) : []);

/** A part that puts the order off: «жди, пока я не скажу продолжай», «я не говорил продолжай». */
const PUT_OFF = /(?<![\p{L}])(?:пока\s+(?:я\s+)?|я\s+)?не\s+(?:скаж|говор|сказал|велел|просил|разреш)/iu;
/** A complaint that work was not stopped keeps the stop in its sentence: «почему ты всё бросил и не остановил набор?». */
const notStopped = /(?<![\p{L}])(?:не\s+остановил|не\s+снял|без\s+присмотра|(?<!не\s)продолжаешь\s+работать)/iu;
/** The sentence around `index`: «почему ты встал? набор без присмотра» is two. */
const sentenceOf = (text, index) => ((to) => text.slice(Math.max(...[...'.!?…\n'].map((m) => text.lastIndexOf(m, index - 1))) + 1, to < 0 ? undefined : index + to))(text.slice(index).search(/[.!?…\n]/u));

/** The last signal of a message: 'stop', 'resume' or null. */
function signalOf(message, words) {
    const text = unquoted(message.trim());
    const signals = [];
    const head = text.replace(/^[\s\p{P}]+/u, '');
    const stops = [...(words.stop ?? []), ...(words.stopInside ?? []).filter((w) => !w.includes(' '))].map(escapeRe).join('|') || '(?!)';
    const opening = head.match(new RegExp(`^(?:${(words.stop ?? []).map(escapeRe).join('|') || '(?!)'})(?![\\p{L}])`, 'iu'));
    // «хватит останавливаться», «Стоп, хватит стоять»: the word right after the stop asks to go on.
    const holdAlt = (words.holdAfter ?? []).map(escapeRe).join('|');
    const holdRe = holdAlt ? new RegExp(`^[\\s\\p{P}]*(?:(?:${stops})(?![\\p{L}])[\\s\\p{P}]*)?(?:${holdAlt})`, 'iu') : null;
    const held = (from) => Boolean(holdRe?.test(text.slice(from)));
    if (opening && !held(text.length - head.length + opening[0].length)) signals.push({ at: text.length - head.length, kind: 'stop' });
    const inside = listRe(words.stopInside);
    const resume = listRe(words.resume);
    const stay = listRe(words.stay, true);
    // A complaint about the stop orders work anywhere, a question too; one that work was not stopped does not.
    for (const index of at(listRe(words.stopComplaint, true), text)) if (!notStopped.test(sentenceOf(text, index))) signals.push({ at: index, kind: 'resume' });
    let offset = 0;
    for (const part of text.split(PART_SPLIT)) {
        const start = text.indexOf(part, offset);
        offset = start + part.length;
        // A one-word stop inside a phrase closes its part and asks nothing: «чини стоп-хук», «как работает стоп?».
        for (const match of inside ? part.matchAll(inside) : []) {
            const end = match.index + match[0].length;
            const closes = match[0].includes(' ') || (/^[\s!?…)]*$/u.test(part.slice(end)) && !asked(text, start + match.index));
            if (closes && !held(start + end)) signals.push({ at: start + match.index, kind: 'stop' });
        }
        // A part with a word of `words.stay`, or one that puts the order off, carries no order; nor does a question.
        if ((stay && at(stay, part).length > 0) || PUT_OFF.test(part)) continue;
        for (const index of [...at(resume, part), ...keyed(part)]) if (!asked(text, start + index)) signals.push({ at: start + index, kind: 'resume' });
    }
    // At one place the stop wins: «сделай паузу» is a stop, not the order «сделай».
    signals.sort((a, b) => a.at - b.at || (a.kind === 'stop') - (b.kind === 'stop'));
    return signals.at(-1)?.kind ?? null;
}

/**
 * A menu answer chooses work: it names a task, or it is an option of `words.menu`. Any other answer —
 * «без предпочтения», a colour, a path — leaves the stop standing: in doubt the stop stands.
 */
const choosesWork = (answer, words) =>
    !listRe(words.stay, true)?.test(answer) &&
    (/(?<![\p{L}\d])(?:[A-Z]+-\d+|\d{4,5})(?!\d)/u.test(answer) ||
        (words.menu ?? []).some((option) => new RegExp(`^${escapeRe(option).replace('RT-N', '[A-Z]+-\\d+')}`, 'iu').test(answer.trim())));

/** The owner's words as the source gives them; a double with `last` alone gives its one word. */
const wordsOf = (owner) => {
    if (typeof owner.words === 'function') return owner.words();
    const last = owner.last();
    return last === null ? [] : [{ text: last, at: null, kind: INTERRUPT.test(last.trim()) ? 'interrupt' : 'typed' }];
};

/**
 * The stop of the owner after their words: { stands, by, word } — `by` is 'esc' or 'word' while the
 * stop stands, null otherwise; `word` the word that set it.
 */
export function stopStands({ owner }, words) {
    const list = wordsOf(owner);
    let state = { stands: false, by: null };
    list.forEach((word, index) => {
        if (word.kind === 'interrupt') {
            const next = list[index + 1];
            const gap = next && next.kind !== 'interrupt' && word.at !== null && next.at !== null ? next.at - word.at : null;
            if (!(gap !== null && gap >= 0 && gap < ESC_WINDOW)) state = { stands: true, by: 'esc', word };
            return;
        }
        const signal = signalOf(word.text, words);
        // The delivery of a queued stop repeats it: the stop keeps its place and time.
        if (signal === 'stop') state = state.stands && state.word?.text?.trim() === word.text.trim() ? state : { stands: true, by: 'word', word };
        else if (signal === 'resume') state = { stands: false, by: null };
        else if (word.kind === 'menu' && state.stands && choosesWork(word.text, words)) state = { stands: false, by: null };
    });
    return state;
}

/** The word that set the stop and stays the owner's last: the Esc mark, or a stop with no «?» and no word of `words.stay`. */
const bare = (word, words) => word.kind === 'interrupt' || (signalOf(word.text, words) === 'stop' && !word.text.includes('?') && !listRe(words.stay, true)?.test(word.text));

/** Own background tasks and monitors started before the stop, not ended, queued as ended or stopped: [{ task, command }]. */
function ownBackground(owner, session, words, stop = stopStands({ owner }, words)) {
    const open = new Map();
    for (const event of stop.stands ? session.events() : []) {
        if ((event.kind === 'background' || event.kind === 'monitor') && event.task && event.at < (stop.word.at ?? Infinity)) open.set(event.task, { task: event.task, command: event.command ?? null });
        else if (event.kind === 'backgroundEnd' && event.task) open.delete(event.task);
    }
    return [...open.values()];
}

/** Own background before the stop holds the end of a turn until it is taken down, or two refusals named it. */
export function backgroundBeforeStop({ owner, session }) {
    return ({ words }) => {
        const stop = stopStands({ owner }, words);
        const refused = stop.stands ? session.events().filter((e) => e.kind === 'refusal' && !(e.at < (stop.word.at ?? 0)) && /owner stopped the work[^]*TaskStop /.test(e.text)).length : 0;
        return refused < 2 && ownBackground(owner, session, words, stop).length > 0;
    };
}

/**
 * What the stop refuses in this turn: { refuseCalls, background, since } — `since` the place of the stop. Calls are refused while the stop
 * stands and the last word of the owner in the turn — its opening prompt and a typed command included,
 * by queue time; one queued before the stop skipped — is missing, older than the stop or a bare stop.
 */
export function stopCall({ owner, session }) {
    return ({ words }) => {
        const stop = stopStands({ owner }, words);
        const opener = owner.turnOpener?.() ?? null;
        if (!stop.stands || opener === null) return { refuseCalls: false, background: ownBackground(owner, session, words, stop), since: null, stands: stop.stands };
        const own = [...(opener.by === 'owner' ? [{ text: opener.text, kind: 'typed', index: opener.index }] : []), ...wordsOf(owner).filter((w) => w.index > opener.index)];
        const last = own.filter((w) => w.index === stop.word.index || ((w.index === opener.index ? opener.at : w.at) ?? Infinity) >= (stop.word.at ?? -Infinity)).at(-1);
        return { refuseCalls: !last || last.index < stop.word.index || bare(last, words), background: ownBackground(owner, session, words, stop), since: stop.word.index ?? null, stands: true };
    };
}

/** The stop stands, and a word of the owner set it. */
export function saidStop({ owner }) {
    return ({ words }) => {
        const stop = stopStands({ owner }, words);
        return stop.stands && stop.by === 'word';
    };
}

/** The stop stands, and the Esc mark set it: turns a notice wakes are released until a working order. */
export function interrupted({ owner }) {
    return ({ words } = {}) => {
        const stop = stopStands({ owner }, words ?? {});
        return stop.stands && stop.by === 'esc';
    };
}

/** The owner's last word pushes the work on by `words.nudge`, or names a task or an epic. */
export function nudged({ owner }) {
    return ({ words }) => {
        const last = owner.last();
        if (last === null) return false;
        return new RegExp(words.nudge ?? '(?!)', 'iu').test(last) || /(?<![\p{L}\d])[A-Z]+-\d+(?!\d)/u.test(last);
    };
}
