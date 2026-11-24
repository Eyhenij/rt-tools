// rt-kit v0.39.1 · checks/coupling-plan.mjs · a49163427387 · правится надстройкой, не здесь
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
/** The words of the refusal itself and of the other numbers give no reason. */
const NO_REASON = /nobody named a number for it|the branch named \d+|(?:входящ|incoming|обход|past an? entry|цикл|cycles)[^,;.|]*/giu;

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

/** `reasoned` — a line counts only when words of a reason stand after its numbers: an overrun explains itself. */
export function namedOf(text, paths = new Map(), { reasoned = false } = {}) {
    const bare = text.replace(TORN, ' ');
    const found = [...bare.matchAll(SEGMENT)]
        .map(({ index, 0: segment, 1: written, 2: rest }) => ({ index, written, numbers: NUMBERS.exec(rest), start: index + segment.length - rest.length }))
        .filter(({ numbers }) => numbers);
    const named = new Map();
    found.forEach(({ written, numbers, start }, at) => {
        const [line] = bare.slice(start + numbers.index + numbers[0].length, found[at + 1]?.index).split('\n', 1);
        const reason = line.replace(NO_REASON, '').match(/\p{L}{2,}/gu) ?? [];
        if (!reasoned || reason.length >= 2) {
            const path = whole(written, paths);
            named.set(path, Math.max(named.get(path) ?? 0, Number(numbers[2])));
        }
    });
    return named;
}
