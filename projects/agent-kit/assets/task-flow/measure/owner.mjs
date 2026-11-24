/**
 * The measurer «measure.owner» — what the owner's last word says about the turn: a stop, an
 * interrupt, or a push to go on.
 */

/** The owner's last word begins with a stop word of `words.stop`, and nothing after it holds the turn. */
export function saidStop({ owner }) {
    return ({ words, rules }) => {
        const last = owner.last();
        return last !== null && rules.saysStop(last, words);
    };
}

/** The mark the host writes into the record when the owner presses Esc. */
const INTERRUPT = /^\[Request interrupted by user/;

/**
 * The owner's last word is the interrupt mark of Esc: a turn a background notice wakes after it is
 * released until the owner writes again.
 */
export function interrupted({ owner }) {
    return () => {
        const last = owner.last();
        return last !== null && INTERRUPT.test(last.trim());
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
