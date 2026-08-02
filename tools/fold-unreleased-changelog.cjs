/**
 * Folds a hand-written `## [Unreleased]` block into the release section generated above it.
 *
 * `conventional-changelog -i <file> -s` prepends the new release section to the top of the file. It
 * does not know about the `Unreleased` block a PR wrote there, so that block is pushed *below* the
 * heading it was written for and its notes keep reading as pending after they shipped.
 *
 * Run this straight after the generator. It moves the block's bullets into the release directly
 * above it — appending to a `### …` subsection that already exists, adding one that does not — and
 * removes the empty heading. A block with no release above it is still genuinely pending and is left
 * alone, so running this on a working tree between releases changes nothing.
 *
 * The generated section may already carry a commit-derived bullet for the same change; both are
 * kept, since the hand-written one is usually the better prose and the generated one carries the
 * commit link. Trimming the pair is a judgement call left to whoever cuts the release.
 *
 * Usage: node tools/fold-unreleased-changelog.cjs <changelog-path>
 */
const fs = require('fs');
const path = require('path');

const UNRELEASED_HEADING = /^## \[Unreleased\]\s*$/;
/** `# [0.1.0](link) (date)`, `## [0.0.29](link) (date)` and the link-less `## 0.0.5 (date)`. */
const RELEASE_HEADING = /^#{1,2} \[?\d+\.\d+\.\d+/;
const ANY_TOP_HEADING = /^#{1,2} /;
const SUBSECTION_HEADING = /^### /;

/**
 * Splits a file into blocks, each starting at a level 1-2 heading and running up to the next one.
 * Anything before the first heading becomes a preamble block with a null heading.
 */
function toBlocks(lines) {
    const blocks = [];
    let current = { heading: null, body: [] };

    for (const line of lines) {
        if (ANY_TOP_HEADING.test(line)) {
            blocks.push(current);
            current = { heading: line, body: [] };
        } else {
            current.body.push(line);
        }
    }

    blocks.push(current);

    return blocks.filter((block, index) => index > 0 || block.heading !== null || block.body.some((line) => line.trim() !== ''));
}

/** Splits a block body into `{ heading, body }` subsections, keeping any lead-in under a null heading. */
function toSubsections(body) {
    const sections = [];
    let current = { heading: null, body: [] };

    for (const line of body) {
        if (SUBSECTION_HEADING.test(line)) {
            sections.push(current);
            current = { heading: line, body: [] };
        } else {
            current.body.push(line);
        }
    }

    sections.push(current);

    return sections;
}

function trimBlank(lines) {
    const copy = [...lines];

    while (copy.length > 0 && copy[0].trim() === '') {
        copy.shift();
    }

    while (copy.length > 0 && copy[copy.length - 1].trim() === '') {
        copy.pop();
    }

    return copy;
}

/** Merges the pending subsections into the released ones, matching on the `### …` heading text. */
function mergeBodies(releasedBody, pendingBody) {
    const released = toSubsections(releasedBody);
    const pending = toSubsections(pendingBody).filter((section) => trimBlank(section.body).length > 0 || section.heading !== null);

    for (const section of pending) {
        if (section.heading === null) {
            continue;
        }

        const target = released.find((candidate) => candidate.heading === section.heading);

        if (target) {
            target.body = [...trimBlank(target.body), ...trimBlank(section.body)];
        } else {
            released.push({ heading: section.heading, body: trimBlank(section.body) });
        }
    }

    return released
        .filter((section) => section.heading !== null || trimBlank(section.body).length > 0)
        .flatMap((section) =>
            section.heading === null ? [...trimBlank(section.body), ''] : [section.heading, '', ...trimBlank(section.body), '']
        );
}

function fold(lines) {
    const blocks = toBlocks(lines);
    const moved = [];

    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];

        if (block.heading === null || !UNRELEASED_HEADING.test(block.heading)) {
            continue;
        }

        const previous = blocks[i - 1];

        // No release above it — the notes really are still pending.
        if (!previous || previous.heading === null || !RELEASE_HEADING.test(previous.heading)) {
            continue;
        }

        previous.body = ['', ...mergeBodies(previous.body, block.body)];
        moved.push(previous.heading.replace(/\(https?:[^)]*\)/g, '').trim());
        blocks.splice(i, 1);
    }

    const output = blocks.flatMap((block) => (block.heading === null ? block.body : [block.heading, ...block.body]));

    return { lines: output, moved };
}

const target = process.argv[2];

if (!target) {
    // eslint-disable-next-line no-console
    console.error('usage: node tools/fold-unreleased-changelog.cjs <changelog-path>');
    process.exit(1);
}

const file = path.resolve(process.cwd(), target);

if (!fs.existsSync(file)) {
    // eslint-disable-next-line no-console
    console.error(`${target} does not exist.`);
    process.exit(1);
}

const original = fs.readFileSync(file, 'utf8');
const { lines, moved } = fold(original.split('\n'));

if (moved.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`${target}: nothing to fold.`);
    process.exit(0);
}

fs.writeFileSync(file, `${trimBlank(lines).join('\n')}\n`, 'utf8');

// eslint-disable-next-line no-console
console.log(`${target}: folded pending notes into ${moved.join(', ')}. Review the section for bullets that now say the same thing twice.`);
