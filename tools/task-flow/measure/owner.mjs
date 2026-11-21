// rt-kit v0.38.0 · task-flow/measure/owner.mjs · 4d945c99a7e5 · правится надстройкой, не здесь
/**
 * The measurer «measure.owner» — what the owner's last word says about the turn: a stop, or a push
 * to go on.
 */
/** The owner's last word begins with a stop word of `words.stop`, and nothing after it holds the turn. */
export function saidStop({ owner }) {
    return ({ words, rules }) => {
        const last = owner.last();
        return last !== null && rules.saysStop(last, words);
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
