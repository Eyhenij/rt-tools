// rt-kit v0.42.0 · checks/coupling-plan.mjs · 9b32b5a9841c · правится надстройкой, не здесь
/**
 * The outgoing links a text names: a path in backticks and, before the next backtick or the line end, the
 * word «исходящие» or «outgoing» with two numbers and an arrow between — now and after.
 *
 * The path may carry a symbol or a line after a colon and may be short: the tail of one module of the tree
 * only. A path with a slash at the end is a folder. Named twice, the largest wins. A line torn by the width
 * of the text is one line.
 */
const SEGMENT = /`([^`\s]+)`([^`\n]*)/g;
const NUMBERS = /(?:исходящ|outgoing)(?:(?!входящ|incoming)[^\d,;])*(\d+)[*\s]*(?:→|->|⇒|=>)[*\s]*(\d+)/iu;
const MODULE = /^(?:\.\/)?(.+?\.(?:[mc]?[jt]sx?|sh))(?:[:#].*)?$/;
const TORN = /\n(?!\s*(?:[-*+]\s|[|#>]|\d+\.\s)|\n)[^\S\n]*/g;
/** A line pasted from the output of the command is neither a mark nor a reason. */
const PASTED =
    /nobody named a number for it|the branch named \d+|the number after the plan has no word of an overrun or no reason beside it|overrun, named after the plan:/gu;
const MARK = /\p{L}*превышен\p{L}*|\boverrun\w*/giu;
const OTHER_NUMBERS = /[^,;.|:]*\d[*\s]*(?:→|->|⇒|=>)[*\s]*\d+/gu;

function whole(written, paths) {
    const path = MODULE.exec(written)?.[1] ?? written;
    if (path.endsWith('/') || paths.has(path)) {
        return path;
    }
    const tails = [...paths.keys()].filter((known) => known.endsWith(`/${path}`));
    return tails.length === 1 ? tails[0] : path;
}

/** The section of the decisions of a progress: numbers of other sections are the story, not the decision. */
export const decisionsOf = (text) =>
    text
        .split(/^(?=## )/m)
        .filter((part) => /^## .*(?:decision|решени)/iu.test(part))
        .join('\n');

/** An overrun: the line calls itself one, and two words of a reason stand after the numbers. */
function isOverrun(bare, start, next) {
    const line = bare.slice(bare.lastIndexOf('\n', start) + 1).split('\n', 1)[0];
    const reason = bare.slice(start, next).split('\n', 1)[0].replace(OTHER_NUMBERS, '').replace(MARK, '');
    return line.search(MARK) >= 0 && (reason.match(/\p{L}{2,}/gu) ?? []).length >= 2;
}

/**
 * The numbers of a text by path; `overrun` — only those of the lines that are an overrun with its reason,
 * `pairs` — `{ was, now }` instead of the number after the arrow.
 */
export function namedOf(text, paths = new Map(), { overrun = false, pairs = false } = {}) {
    const bare = text.replace(TORN, ' ').replace(PASTED, '');
    const found = [...bare.matchAll(SEGMENT)]
        .map(({ index, 0: segment, 1: written, 2: rest }) => ({ index, written, numbers: NUMBERS.exec(rest), start: index + segment.length - rest.length }))
        .filter(({ numbers }) => numbers);
    const named = new Map();
    found.forEach(({ written, numbers, start }, at) => {
        if (!overrun || isOverrun(bare, start + numbers.index + numbers[0].length, found[at + 1]?.index)) {
            const path = whole(written, paths);
            const [was, now] = [Number(numbers[1]), Number(numbers[2])];
            if (!(named.get(path)?.now > now)) named.set(path, { was, now });
        }
    });
    return pairs ? named : new Map([...named].map(([path, { now }]) => [path, now]));
}
