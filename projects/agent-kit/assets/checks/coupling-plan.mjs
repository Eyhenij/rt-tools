/**
 * The outgoing links a text names: a path in backticks and, before the next backtick or the line end, the
 * word «исходящие» or «outgoing» with two numbers and an arrow between — now and after.
 *
 * The path may carry a symbol after a colon and may be short: the tail of one module of the tree only. A
 * path with a slash at the end is a folder. Named twice, the largest wins.
 */
const SEGMENT = /`([^`\s]+)`([^`\n]*)/g;
const NUMBERS = /(?:исходящ|outgoing)[^\d]*(\d+)\s*(?:→|->|⇒)\s*(\d+)/iu;

function whole(path, paths) {
    if (path.endsWith('/') || paths.has(path)) {
        return path;
    }
    const tails = [...paths.keys()].filter((known) => known.endsWith(`/${path}`));
    return tails.length === 1 ? tails[0] : path;
}

/** `reasoned` — a line counts only when words of a reason stand after its numbers: an overrun explains itself. */
export function namedOf(text, paths = new Map(), { reasoned = false } = {}) {
    const named = new Map();
    for (const { index, 0: segment, 1: written, 2: rest } of text.matchAll(SEGMENT)) {
        const numbers = NUMBERS.exec(rest);
        if (!numbers) {
            continue;
        }
        const after = index + segment.length - rest.length + numbers.index + numbers[0].length;
        const [reason] = text.slice(after).split('\n', 1);
        if (!reasoned || (reason.match(/\p{L}{2,}/gu) ?? []).length >= 2) {
            const path = whole(written.replace(/:[\w$]+$/, ''), paths);
            named.set(path, Math.max(named.get(path) ?? 0, Number(numbers[2])));
        }
    }
    return named;
}
