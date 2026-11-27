#!/usr/bin/env node
// rt-kit v0.42.0 · checks/flow-data.mjs · a37ccc70b9e3 · правится надстройкой, не здесь
/**
 * The data of the task flow description: the literals of `words`, the forms of `expect` and the
 * order of the release cases. A new stop word, a new write command, a new menu option or a new form
 * of the expected result is a line of the description, not an edit of a guard.
 *
 * `words` holds only the keys of `WORD_KEYS`: lists of non-empty strings, and `nudge` — the pattern
 * of a nudge, read with the flags `iu`. `expect` holds forms: a `pattern` whose groups carry the
 * expected value, and a `compare` of `COMPARE`. A release case has an integer `order` from 1, and
 * two cases never share one: the order is the order the engine asks them in.
 *
 * The module has no command line of its own: the model calls its checks, and the guards and the
 * engine call its readers with the model.
 */
import { Call, Ref } from './flow-syntax.mjs';

/** The keys of `words`; `nudge` is a pattern, the rest are lists of strings. */
export const WORD_KEYS = ['stop', 'stopExcept', 'holdAfter', 'resume', 'stopComplaint', 'stopInside', 'stay', 'nudge', 'write', 'menu', 'legacyBranches'];

/** The ways a form of the expected result is compared with a run. */
export const COMPARE = ['exit', 'line', 'regex', 'number'];

const plain = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Ref) && !(value instanceof Call);

const pattern = (text, flags, where, fail) => {
    try {
        return new RegExp(text, flags);
    } catch (error) {
        return fail(`${where}: the pattern does not compile — ${error.message}`);
    }
};

/** Checks the section `words`. */
export function checkWords(words, fail) {
    for (const [key, value] of Object.entries(words)) {
        if (!WORD_KEYS.includes(key)) fail(`words.${key}: not a word list of the description — ${WORD_KEYS.join(', ')}`);
        if (key === 'nudge') {
            if (typeof value !== 'string' || value === '') fail('words.nudge: the pattern is a non-empty string');
            pattern(value, 'iu', 'words.nudge', fail);
            continue;
        }
        if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item === '')) {
            fail(`words.${key}: a list of non-empty strings`);
        }
    }
}

/** Checks the section `expect`. */
export function checkExpect(expect, fail) {
    for (const [key, form] of Object.entries(expect)) {
        if (!plain(form)) fail(`expect.${key}: a form is an object of pattern and compare`);
        if (typeof form.pattern !== 'string' || form.pattern === '') fail(`expect.${key}: the pattern is a non-empty string`);
        pattern(form.pattern, '', `expect.${key}`, fail);
        if (!COMPARE.includes(form.compare)) fail(`expect.${key}: the compare «${form.compare}» is not one of ${COMPARE.join(', ')}`);
    }
}

/** Checks the order of the release cases and returns them in it: `[{ key, when, order, … }]`. */
export function releaseOrder(release, fail) {
    const taken = new Map();
    for (const [key, r] of Object.entries(release)) {
        if (!Number.isInteger(r.order) || r.order < 1) fail(`release.${key}: the order is an integer from 1`);
        if (taken.has(r.order)) fail(`release.${key}: the order ${r.order} repeats — release.${taken.get(r.order)} has it`);
        taken.set(r.order, key);
    }
    return Object.entries(release)
        .map(([key, r]) => ({ key, ...r }))
        .sort((a, b) => a.order - b.order);
}

const alternatives = (list) => list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

/**
 * A message of the owner says stop: it begins with a word of `words.stop`, and the rest of it does
 * not hold the turn — no word of `words.stopExcept` without «не» before it, and no word beginning
 * with an entry of `words.holdAfter` («хватит останавливаться» asks to go on).
 */
export function saysStop(message, words) {
    const stop = words.stop ?? [];
    if (stop.length === 0) return false;
    const text = message.trim().replace(/^[\s\p{P}]+/u, '');
    const head = text.match(new RegExp(`^(?:${alternatives(stop)})(?![\\p{L}])`, 'iu'));
    if (!head) return false;
    const rest = text.slice(head[0].length);
    const hold = words.holdAfter ?? [];
    if (hold.length > 0 && new RegExp(`(?<![\\p{L}])(?:${alternatives(hold)})`, 'iu').test(rest)) return false;
    const except = words.stopExcept ?? [];
    return except.length === 0 || !new RegExp(`(?<![\\p{L}])(?<!не )(?:${alternatives(except)})(?![\\p{L}])`, 'iu').test(rest);
}

/**
 * A part of a shell command as it is judged: the leading assignments of variables (`NAME=value`) and
 * the options of git placed before its subcommand (`-c key=value`, `-C <dir>`) are dropped.
 */
export function commandHead(part) {
    return part
        .trim()
        .replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S*)\s+)+/, '')
        .replace(/^git(?:\s+(?:-c|-C)\s+(?:"[^"]*"|'[^']*'|\S+))+/, 'git');
}

/** A shell command is a write command: one of its parts begins with an entry of `words.write`. */
export function isWriteCommand(command, words) {
    const write = words.write ?? [];
    return command
        .split(/&&|\|\||;|\|/)
        .map(commandHead)
        .some((part) => write.some((entry) => part === entry || part.startsWith(`${entry} `)));
}

/**
 * Compares a run with the expected text of a plan step by the forms of `expect`. Returns
 * `{ form, matched }`, or `null` when no form recognises the text.
 */
export function compareExpected(expect, expected, code, output) {
    const last =
        output
            .split('\n')
            .map((line) => line.trimEnd())
            .filter((line) => line !== '')
            .pop() ?? '';
    for (const [form, { pattern: text, compare }] of Object.entries(expect)) {
        const m = new RegExp(text).exec(expected.trim());
        if (!m) continue;
        if (compare === 'exit') return { form, matched: code === Number(m[1]) };
        if (code !== 0) return { form, matched: false };
        if (compare === 'line') return { form, matched: last === m[1] };
        if (compare === 'regex') return { form, matched: new RegExp(m[1]).test(last) };
        // A number is read with the blanks before it: `wc -l` of macOS pads its count on the left.
        const number = last.trim();
        if (!/^-?\d+$/.test(number)) return { form, matched: false };
        const got = Number(number);
        const want = Number(m[2]);
        return { form, matched: m[1] === '=' ? got === want : m[1] === '>=' ? got >= want : got <= want };
    }
    return null;
}
