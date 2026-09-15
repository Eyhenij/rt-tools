#!/usr/bin/env node
/**
 * The showing of the second kit: does every family of it reach the showcase.
 *
 * Why it exists. The coverage contract says an axis that cannot be shown is declared with a
 * reason, not skipped: a silent gap looks exactly like coverage. Declared in prose, though, the
 * gap and the declaration about it look the same to a count — and nobody counts families by hand
 * twice.
 *
 * What it judges. A family without an overview page or without a stories folder stands in the
 * list with a reason. A family that already reaches the showcase does not stand there at all: a
 * leftover line tells the reader that the showing is missing where it is not.
 *
 * What it does NOT judge. Whether every axis of an input is shown at every value — that is the
 * coverage contract itself. The axis lives in the type of the input, the story in a set of
 * arguments, and there is nothing to tie one to the other by a machine.
 *
 *   node tools/check-kit-coverage.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { declarationsOf, storySubjectsOf } from './kit-coverage-components.mjs';

const ROOT = process.cwd();

/** Where the families of the second kit lie. */
const FAMILIES = 'projects/ui-kit-v2/src/lib/components';

/** The list of what does not reach the showcase, with a reason for each. */
const ALLOWLIST = 'tools/kit-coverage-allowlist.json';

/** What counts as reaching the showcase: a page a person reads and stories they look at. */
const OVERVIEW = 'Overview.mdx';
const STORIES = 'stories';

const list = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));

/** Families with nothing to show at all, with the reason for each. */
const accepted = list.notShown;

/**
 * Families shown by a story of the foundation level rather than from their own folder.
 *
 * The rule of the showcase sends such a story next to the showing harness: it shows a technique
 * shared by the whole kit, it has neither input axes nor states, and the coverage contract does
 * not apply to it. From the folder of the family that looks exactly like a gap.
 */
const atFoundation = list.shownAtFoundation ?? {};

/**
 * Components with no story of their own, with the reason for each. A separate list from the
 * families one: all of these lie inside families that reach the showcase, and the family count
 * sees none of them.
 */
const acceptedComponents = list.notShownComponents ?? {};

/**
 * Components shown inside a neighbour's story on purpose, with the story file that shows them.
 * A pair is best read together — a projected hint next to a string one — and pulled apart it
 * shows neither side against the other.
 */
const shownWithin = list.shownWithin ?? {};

/**
 * Families whose stories folder carries no inputs page, with the reason for each.
 *
 * The coverage contract asks every family for one arg-driven page, and the showcase calls it by
 * one name. A family that cannot have one — its content arrives as projected templates, and the
 * showcase substitutes values rather than markup — is told from a family that simply lacks the
 * page only by reading: both look identical to a count.
 */
const noPlayground = list.noPlayground ?? {};

/** The name of the inputs page. One for the whole kit: a second name is looked for by guessing. */
const PLAYGROUND = 'export const Playground:';


const families = readdirSync(join(ROOT, FAMILIES), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const problems = [];
let shown = 0;
let withPlayground = 0;

/** Does any story file of the folder carry the inputs page. Read as text: the page is an export. */
function hasPlayground(dir) {
    return readdirSync(dir, { withFileTypes: true }).some(
        (entry) => entry.isFile() && entry.name.endsWith('.stories.ts') && readFileSync(join(dir, entry.name), 'utf8').includes(PLAYGROUND)
    );
}

for (const family of families) {
    const dir = join(ROOT, FAMILIES, family);
    const hasOverview = existsSync(join(dir, OVERVIEW));
    const hasStories = existsSync(join(dir, STORIES));
    const reason = accepted[family];

    const foundation = atFoundation[family];

    if (foundation) {
        if (!existsSync(join(ROOT, foundation))) {
            problems.push(`«${family}»: the story of the foundation level «${foundation}» is named in the list and is not in the tree`);
        }
        if (hasOverview && hasStories) {
            problems.push(`«${family}»: shown from its own folder, and the list still sends the reader to the foundation level — remove the line`);
        }
        shown += 1;
        continue;
    }

    if (hasOverview && hasStories) {
        shown += 1;
        if (reason) {
            problems.push(`«${family}»: reaches the showcase, and the reason for its absence is still in the list — remove it`);
        }
        if (hasPlayground(join(dir, STORIES))) {
            withPlayground += 1;
            if (noPlayground[family]) {
                problems.push(`«${family}»: has an inputs page, and the reason for its absence is still in the list — remove it`);
            }
        } else if (!noPlayground[family]) {
            problems.push(`«${family}»: no inputs page «Playground» and no reason in the list — a silent gap looks exactly like coverage`);
        }
        continue;
    }

    if (!reason) {
        const missing = [hasOverview ? null : OVERVIEW, hasStories ? null : STORIES].filter(Boolean).join(' and ');
        problems.push(`«${family}»: no ${missing} and no reason in the list — a silent gap looks exactly like coverage`);
    }
}

for (const family of Object.keys(atFoundation)) {
    if (!families.includes(family)) {
        problems.push(`«${family}»: named in the list of the foundation level, and there is no such family`);
    }
}

for (const family of Object.keys(noPlayground)) {
    if (!families.includes(family)) {
        problems.push(`«${family}»: named in the inputs-page list, and there is no such family — the line outlived what it explained`);
    }
    if (!noPlayground[family]) {
        problems.push(`«${family}»: the reason is empty; an empty reason is not accepted`);
    }
}

for (const family of Object.keys(accepted)) {
    if (!families.includes(family)) {
        problems.push(`«${family}»: named in the list, and there is no such family — the line outlived what it explained`);
    }
    if (!accepted[family]) {
        problems.push(`«${family}»: the reason is empty; an empty reason is not accepted`);
    }
}

/**
 * The second question, asked of components rather than families: is this component the subject of
 * a story. Asked apart because the family answer said yes about thirty components that had no
 * story at all — every one of them lay inside a family that reaches the showcase.
 */
const declared = declarationsOf(ROOT, FAMILIES);
const subjects = storySubjectsOf(ROOT, [FAMILIES, 'projects/ui-kit-v2/src/showcase']);
const storyless = declared.filter((item) => !subjects.has(item.name));
const storylessSelectors = new Set(storyless.map((item) => item.selector));

for (const item of storyless) {
    const within = shownWithin[item.selector];

    if (within !== undefined) {
        if (!existsSync(join(ROOT, within))) {
            problems.push(`«${item.selector}»: the story «${within}» that shows it is named in the list and is not in the tree`);
        }
        continue;
    }

    if (!acceptedComponents[item.selector]) {
        problems.push(`«${item.selector}» (${item.path}): the subject of no story and no reason in the list — a silent gap looks exactly like coverage`);
    }
}

for (const selector of Object.keys(acceptedComponents)) {
    if (!storylessSelectors.has(selector)) {
        problems.push(`«${selector}»: named in the component list, and it either is the subject of a story now or is gone from the kit — remove the line`);
    }
    if (!acceptedComponents[selector]) {
        problems.push(`«${selector}»: the reason is empty; an empty reason is not accepted`);
    }
}

for (const selector of Object.keys(shownWithin)) {
    if (!storylessSelectors.has(selector)) {
        problems.push(`«${selector}»: named as shown inside a neighbour's story, and it has a story of its own now — remove the line`);
    }
}

if (problems.length > 0) {
    console.error(`\ncheck-kit-coverage: divergences ${problems.length}\n`);
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    console.error(`\nThe list is \`${ALLOWLIST}\`. A family without a showing stands there with a reason, not silently.\n`);
    process.exit(1);
}

console.log(
    `check-kit-coverage: families of the second kit ${families.length}, reaching the showcase ${shown}; ` +
        `shown at the foundation level ${Object.keys(atFoundation).length}, ` +
        `not reaching and named with a reason ${Object.keys(accepted).length}`
);
console.log(
    `check-kit-coverage: the inputs page «Playground» — families that have one ${withPlayground}, ` +
        `named with a reason ${Object.keys(noPlayground).length}`
);
console.log(
    `check-kit-coverage: components and directives ${declared.length}, the subject of a story ${declared.length - storyless.length}; ` +
        `shown inside a neighbour's story ${Object.keys(shownWithin).length}, ` +
        `named with a reason ${Object.keys(acceptedComponents).length}`
);
