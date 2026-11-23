// rt-kit v0.39.0 · task-flow/measure/owner.mjs · b969f88621ec · правится надстройкой, не здесь
/**
 * The measurer «measure.owner» — what the owner's last word says about the turn: an interrupt, or a
 * push to go on. No typed word stops the work: the owner stops it by Esc.
 */

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
