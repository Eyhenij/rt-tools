#!/usr/bin/env node
/**
 * The check that a link between the showcase's pages leads to a page that exists.
 *
 * An overview page sends the reader on: "not this component but that one", "next to it — that".
 * The link is written by the page's address in the showcase, and that address is not a path in the
 * tree: it is derived from the page's title. So the path check does not see such a link at all, and
 * a dead one looks exactly like a live one — the page is drawn whole, the text reads, and the miss
 * shows only to whoever pressed it.
 *
 * The addresses went dead all at once, without a single edit to the pages: the showcase's sections
 * were laid out by the levels of atomic design, every title changed, and the links kept naming the
 * former common section. The measurement on the raised showcase: 79 pages of documentation, 346
 * links in the overviews, 102 distinct addresses — not one alive.
 *
 * The address is derived here by the showcase's own helper rather than by a rule written out next to
 * it: a rule of one's own would agree with the showcase on the day it was written and diverge on the
 * first title with a capital letter in the middle of a word.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { storyNameFromExport, toId } from 'storybook/internal/csf';

import { allowlistOf, parseAllowlist, ROOT, skipUnless } from './rt-kit-checks.config.mjs';

const SOURCE = 'projects/ui-kit-v2/src';
const ALLOWLIST = allowlistOf('showcase-links');

/** How a link to a page of the showcase is written: `./?path=/docs/<address>`. */
const LINK = /path=\/docs\/([a-z0-9-]+)/g;
/** The title of a documentation page: `<Meta title="…" />`. */
const META_TITLE = /<Meta\s+title=(?:"([^"]+)"|\{'([^']+)'\})/;
/** The title of a story file: the `title` field of the default export. */
const STORY_TITLE = /^\s*title:\s*['"]([^'"]+)['"]/m;
/** An exported story: `export const <Name>` at the top level of a story file. */
const STORY_EXPORT = /^export const (\w+)\s*[:=]/gm;

skipUnless(existsSync(join(ROOT, SOURCE)), `the directory ${SOURCE}`);

/** Every file of a directory, to any depth. */
function filesOf(dir) {
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            found.push(...filesOf(path));
        } else {
            found.push(path);
        }
    }

    return found;
}

const files = filesOf(join(ROOT, SOURCE));
const pages = new Set();
const links = [];

for (const file of files) {
    if (file.endsWith('.mdx')) {
        const text = readFileSync(file, 'utf8');
        const title = META_TITLE.exec(text);
        if (title) {
            pages.add(toId(title[1] ?? title[2], 'docs'));
        }
        for (const [, address] of text.matchAll(LINK)) {
            links.push({ file, address });
        }
        continue;
    }

    if (file.endsWith('.stories.ts')) {
        const text = readFileSync(file, 'utf8');
        const title = STORY_TITLE.exec(text);
        if (!title) {
            continue;
        }
        // A story file gives the showcase a page of documentation of its own as well: a link is
        // written to it just as it is to an overview.
        pages.add(toId(title[1], 'docs'));
        for (const [, name] of text.matchAll(STORY_EXPORT)) {
            pages.add(toId(title[1], storyNameFromExport(name)));
        }
    }
}

const list = parseAllowlist('showcase-links');
const dead = links.filter(({ address }) => !pages.has(address));

const problems = [
    ...dead
        .filter(({ address }) => !list.accepted.has(address))
        .map(({ file, address }) => `${relative(ROOT, file)}: the link leads to ${address}, and the showcase has no such page`),
    ...[...list.accepted.keys()]
        .filter((address) => pages.has(address))
        .map((address) => `${address}: it stands in «accepted» of ${ALLOWLIST}, and the showcase now has such a page — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-showcase-links: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-showcase-links: pages of the showcase ${pages.size}, links between them ${links.length}; ` +
        `leading nowhere and named with a reason ${dead.length}`
);
