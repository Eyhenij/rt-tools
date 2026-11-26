// rt-kit v0.41.1 · checks/flow-merge.mjs · 0bfe40c2079b · правится надстройкой, не здесь
/**
 * The resolution of a merge conflict in a guarded file of the description or the engine. While a merge
 * of a reviewed base runs, the guard of the course of work lets two moves through in a file git left
 * unmerged: an edit that replaces one whole conflict block by a side of it, and `git checkout` or
 * `git restore` with `--ours` or `--theirs`. Everything else is judged by the rule of the guarded files.
 * The decisions are pure: the merge — its root and unmerged paths — and the text of the file come from
 * the context of the guard.
 */
import { isAbsolute, relative } from 'node:path';

const [OPEN, BASE, MID, CLOSE] = [/^<{7}(?: .*)?$/, /^\|{7}(?: .*)?$/, /^={7}$/, /^>{7}(?: .*)?$/];
/** A text, where two sides may stand one after the other; in code they declare a name twice and break the engine. */
const TEXT = /\.md$/;

/** The two sides of a text that is exactly one conflict block, the lines around it none; or null. */
export function sidesOfBlock(text) {
    const lines = text.replace(/\n$/, '').split('\n');
    if (lines.length < 3 || !OPEN.test(lines[0]) || !CLOSE.test(lines.at(-1))) return null;
    const inner = lines.slice(1, -1);
    const mids = inner.flatMap((line, k) => (MID.test(line) ? [k] : []));
    if (mids.length !== 1 || inner.some((line) => OPEN.test(line) || CLOSE.test(line))) return null;
    const base = inner.findIndex((line) => BASE.test(line));
    return { ours: inner.slice(0, base >= 0 && base < mids[0] ? base : mids[0]), theirs: inner.slice(mids[0] + 1) };
}

/** The old text stands in the file from the start of a line to the end of one: a cut marker keeps its rest. */
const wholeLines = (text, old) => {
    const at = text.indexOf(old);
    return at >= 0 && (at === 0 || text[at - 1] === '\n') && (old.endsWith('\n') || at + old.length === text.length || text[at + old.length] === '\n');
};

/** The new text of an edit is a side of its block, or outside code both sides one after the other. */
function choiceOf(oldString, newString, code) {
    const sides = sidesOfBlock(oldString);
    if (!sides) return false;
    const tail = oldString.endsWith('\n') ? '\n' : '';
    const choices = [sides.ours, sides.theirs, ...(code ? [] : [[...sides.ours, ...sides.theirs], [...sides.theirs, ...sides.ours]])];
    return choices.some((lines) => newString === (lines.length ? `${lines.join('\n')}${tail}` : ''));
}

/**
 * Every edit of an Edit or MultiEdit of an unmerged path replaces one whole conflict block of the file,
 * read as `text`, by a side of it; the edits apply one after another, as the tool applies them.
 */
export function resolvesBlock(call, merge, text) {
    if (!merge || !['Edit', 'MultiEdit'].includes(call.tool) || !merge.unmerged.has(call.path) || typeof text !== 'string') return false;
    const edits = call.edits ?? [];
    let now = text;
    for (const edit of edits) {
        if (edit.replaceAll || !wholeLines(now, edit.oldString) || !choiceOf(edit.oldString, edit.newString, !TEXT.test(call.path))) return false;
        now = now.replace(edit.oldString, () => edit.newString);
    }
    return edits.length > 0;
}

/** The paths a side is taken for are all unmerged in the merge of a reviewed base; an absolute one counts from the root. */
export function choosesSide(paths, merge) {
    const own = (path) => (path !== null && isAbsolute(path) ? merge.roots.map((root) => relative(root, path)).find((rel) => merge.unmerged.has(rel)) ?? path : path);
    return Boolean(merge) && paths.length > 0 && paths.every((path) => path !== null && merge.unmerged.has(own(path)));
}
