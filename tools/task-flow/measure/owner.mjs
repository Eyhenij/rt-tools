// rt-kit v0.40.0 · task-flow/measure/owner.mjs · bbe91ce8c95b · правится надстройкой, не здесь
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
 * and its one word where it closes its part of the message.
 * A word of `words.resume` is a working order. A word with «не» before it is no signal. A part of the
 * message — split by «.», «,», «;» and by «и», «затем», «потом» — that holds a word of `words.stay`
 * carries no order, while a stop word in it still stops.
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
    // A complaint about the stop orders work anywhere in the message, a question too: «почему ты бросил эпик?».
    for (const index of at(listRe(words.stopComplaint, true), text)) signals.push({ at: index, kind: 'resume' });
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
 * The stop of the owner after their words: { stands, by } — `by` is 'esc' or 'word' while the stop
 * stands, null otherwise.
 */
export function stopStands({ owner }, words) {
    const list = wordsOf(owner);
    let state = { stands: false, by: null };
    list.forEach((word, index) => {
        if (word.kind === 'interrupt') {
            const next = list[index + 1];
            const gap = next && next.kind !== 'interrupt' && word.at !== null && next.at !== null ? next.at - word.at : null;
            if (!(gap !== null && gap >= 0 && gap < ESC_WINDOW)) state = { stands: true, by: 'esc' };
            return;
        }
        const signal = signalOf(word.text, words);
        if (signal === 'stop') state = { stands: true, by: 'word' };
        else if (signal === 'resume') state = { stands: false, by: null };
        else if (word.kind === 'menu' && state.stands && choosesWork(word.text, words)) state = { stands: false, by: null };
    });
    return state;
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
