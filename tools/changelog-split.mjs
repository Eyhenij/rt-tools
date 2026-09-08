#!/usr/bin/env node
/**
 * The splitting of the release journal when it has outgrown the length limit.
 *
 * The journal grows by a known motion — a release — while its length was measured at the push: the
 * journal arrived by a merge of the main branch with 530 lines at a limit of 500, and no branch could
 * be pushed from the tree any more. The cause lay in somebody else's work, and whoever turned up
 * fixed it.
 *
 * The command is called by the release right after the journal is appended to and before the
 * edition's commit: it splits by the same motion that grows it. It is run on the spot too — on any
 * journal, without a release.
 *
 * The old releases leave for a separate file named by the range of versions. The fresh ones stay:
 * they are read, and the generator appends a new release at the beginning and does not reach the old
 * lines.
 *
 * Without an edit it exits with zero and says there is nothing to split. A non-zero code is only a
 * refusal of the command itself.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const FILE = process.argv[2] ?? 'projects/agent-kit/CHANGELOG.md';
const LIMIT = CONFIG.fileSizeLimit;
/**
 * How many lines to leave in the fresh part. Half the limit rather than «the limit minus a little»:
 * split right up to the edge, the journal runs into the limit in two releases, and has to be split again.
 */
const KEEP = Math.floor(LIMIT / 2);
/** A release's heading: the generator writes a large one for minors and a small one for patches. */
const RELEASE = /^#{1,2} \[([0-9]+\.[0-9]+\.[0-9]+)\]/;

/** The journal's sections: the header before the first release and a section per release, the fresh on top. */
function split(lines) {
    const head = [];
    const sections = [];
    for (const line of lines) {
        const match = RELEASE.exec(line);
        if (match) {
            sections.push({ version: match[1], lines: [line] });
            continue;
        }
        if (sections.length === 0) {
            head.push(line);
            continue;
        }
        sections.at(-1).lines.push(line);
    }

    return { head, sections };
}

function main() {
    const path = join(ROOT, FILE);
    const lines = readFileSync(path, 'utf8').split('\n');
    if (lines.length <= LIMIT) {
        console.log(`changelog-split: ${FILE} — ${lines.length} lines at the limit ${LIMIT}, there is nothing to split`);

        return 0;
    }

    const { head, sections } = split(lines);
    if (sections.length < 2) {
        console.error(
            `changelog-split: ${FILE} has fewer than two releases — there is nothing to split, and the length came from elsewhere`
        );

        return 1;
    }

    // The fresh are gathered from the top while they fit into half the limit; the first release stays
    // always, even if it alone is longer than that: a journal without the last release is meaningless.
    const keep = [];
    let count = head.length;
    for (const section of sections) {
        if (keep.length > 0 && count + section.lines.length > KEEP) {
            break;
        }
        keep.push(section);
        count += section.lines.length;
    }

    const moved = sections.slice(keep.length);
    if (moved.length === 0) {
        console.error(
            `changelog-split: ${FILE} is longer than the limit, but its whole volume is in the fresh releases — there is nothing to split`
        );

        return 1;
    }

    const oldest = moved.at(-1).version;
    const newest = moved[0].version;
    const name = `${basename(FILE, '.md')}-${oldest}-${newest}.md`;
    const target = join(dirname(path), name);
    const title = `# The changelog — releases ${oldest} … ${newest}\n
The old part of the journal, carried out of \`${FILE}\`: that one outgrew the document length limit,
while the generator appends a new release only at the beginning and does not reach these lines. The
fresh releases are there, here only a description of the past; it is not edited.\n`;

    writeFileSync(target, `${title}\n${moved.flatMap((section) => section.lines).join('\n')}`.replace(/\n+$/, '\n'));
    writeFileSync(path, `${[...head, ...keep.flatMap((section) => section.lines)].join('\n')}`.replace(/\n+$/, '\n'));

    console.log(
        `changelog-split: ${FILE} was ${lines.length} lines at the limit ${LIMIT}\n` +
            `  releases left: ${keep.length} (${keep[0].version} … ${keep.at(-1).version})\n` +
            `  releases carried out: ${moved.length} → ${join(dirname(FILE), name)}`
    );

    return 0;
}

process.exit(main());
