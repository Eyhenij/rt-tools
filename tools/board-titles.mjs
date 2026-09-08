// rt-kit v0.26.0 · checks/board-titles.github.mjs · d4bbb610db83 · правится надстройкой, не здесь
/**
 * Open tasks whose titles overlap heavily.
 *
 * In a file of its own, not inside the queue audit: the queue has its own subject — tasks, columns
 * and PRs — while here the words of the titles are compared with each other. Together they outgrew
 * the file length limit, and splitting them by subject is cheaper than by line count.
 */

function titleWords(title) {
    return [
        ...new Set(
            String(title)
                .replace(/^\s*\[[^\]]+\]\s*/, '')
                .toLowerCase()
                .split(/[^\p{L}\p{N}]+/u)
                .filter((word) => word.length > 3)
        ),
    ];
}

/** The share of common words from which two tasks are worth looking at by eye. */
const TITLE_OVERLAP = 0.6;
/** Fewer than three common words is not an overlap: two long words match in any pair. */
const TITLE_COMMON_MIN = 3;
/** Above how many tasks in a group it is a series of an epic, not a duplicate. */
const TITLE_GROUP_MAX = 4;

/**
 * Open tasks whose titles overlap heavily.
 *
 * Printed as a summary line, not as a refusal: a series of same-shaped tasks of an epic is a lawful
 * state of the queue, and a refusal would refuse the work on every such series. A duplicate, taken
 * on its own, is sound — both tasks have a number, an executor and a column — and nothing finds it:
 * they drifted apart by the words of the title, and they match by the defect and the sign of
 * closing.
 */
export function similarTitles(open) {
    const words = new Map(open.map((issue) => [issue.number, titleWords(issue.title)]));
    // Tasks are gathered into groups, not into pairs: a series of same-shaped tasks of an epic is
    // a lawful state of the queue, and in pairs it gives a line per combination, that is, it drowns
    // itself out.
    const groups = [];

    for (const issue of open) {
        const mine = words.get(issue.number);
        const near = groups.find((group) =>
            group.some((other) => {
                const theirs = words.get(other.number);
                const common = mine.filter((word) => theirs.includes(word)).length;
                const smaller = Math.min(mine.length, theirs.length);

                return smaller > 0 && common >= TITLE_COMMON_MIN && common / smaller >= TITLE_OVERLAP;
            })
        );
        if (near) {
            near.push(issue);
            continue;
        }
        groups.push([issue]);
    }

    // A group larger than the limit is a series of same-shaped tasks, not a duplicate: an epic can
    // have a dozen and a half of them, and a line about them says only that the epic exists.
    for (const group of groups.filter((one) => one.length > 1 && one.length <= TITLE_GROUP_MAX)) {
        const numbers = group.map((issue) => `#${issue.number}`).join(', ');
        console.log(`check-board: ${numbers} — the titles overlap heavily, look whether this is one work: ` + `«${group[0].title}»`);
    }
}
