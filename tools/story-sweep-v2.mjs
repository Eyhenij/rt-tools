#!/usr/bin/env node
/**
 * A sweep over all the second kit's showcase stories: is there anything at all in the frame.
 *
 * Green specs, a green taking of references and a green audit of the input tables together do not
 * answer that question. A comparison with a reference does not tell an empty showing at all: a new
 * story has no reference yet, and the first taken reference pins down what got drawn — emptiness
 * included. So the sweep goes BEFORE the references are taken, not after.
 *
 * A showing is empty for two reasons, and from outside they are indistinguishable:
 *
 * 1. **A drawing error.** `NG0201` — a provider is not in the showcase's injector, `NG0950` — the
 *    component's owner did not set a mandatory input. The markup is then either empty or cut off.
 * 2. **There is nothing to show.** The matrix is assembled, and no data is put into it: an empty
 *    list, an empty set of columns, a zero set of axis values.
 *
 * An error in the console matters more than the area: a wreck's area happens to be non-zero too.
 *
 * The sweep does not replace the eyes. It says where there is nothing to look at; that what is shown
 * is shown rightly is answered only by looking at the frames.
 *
 *   pnpm run test:stories:v2                 # a sweep over the raised showcase
 *   STORYBOOK_URL=… pnpm run test:stories:v2 # the showcase at another address
 */
import { join } from 'node:path';

/** The address of an already raised showcase: the sweep raises none of its own — like the snapshot run next to it. */
const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** By this path in the showcase's stories it is recognised that the address holds the second kit. */
const OWN_IMPORT_MARKER = 'projects/ui-kit-v2/';

/**
 * The showing root's area below which a frame counts as empty.
 *
 * Not zero: the showing harness draws a frame and the cell's label even where the cell itself has
 * nothing to show, and such a root takes dozens of pixels. A hundred square pixels is a strip of
 * 100×1, below which not one kit component draws.
 */
const MIN_AREA = 100;

/**
 * The showcase's own errors, having nothing to do with the showing.
 *
 * `NG04002` arrives in every story without exception: the showcase gives the stories at the address
 * `/iframe.html`, and its router is declared with an empty set of routes — there is nothing to match
 * that address against. The showcase needs the router: without it not one kit component with a link
 * comes up. Without sifting this out, the sweep reports about all the stories at once and says nothing.
 */
const KNOWN_SHOWCASE_NOISE = [/NG04002: Cannot match any routes\. URL Segment: 'iframe\.html'/];

function fail(message) {
    console.error(`\n  ${message}\n`);
    process.exit(1);
}

/**
 * The browser driver arrives as a dependency of the snapshot runner rather than by the tree's manifest.
 *
 * pnpm's strict layout does not put it into the root `node_modules`, so an import by name finds
 * nothing here. The second road is pnpm's shared links directory, where the transitive is put.
 */
async function loadChromium() {
    const candidates = ['playwright', join(process.cwd(), 'node_modules/.pnpm/node_modules/playwright/index.mjs')];

    for (const candidate of candidates) {
        try {
            return (await import(candidate)).chromium;
        } catch {
            // The next path.
        }
    }

    return fail('The browser driver is found neither by name nor in the pnpm links directory. Install the dependencies: pnpm install');
}

/**
 * It recognises the showcase by its story index.
 *
 * The sign is the source path: at the second kit every story lies under `projects/ui-kit-v2/`.
 * Titles are no good for this — `Components/Button` exists at both kits, and a sweep pointed at a
 * foreign showcase would report about foreign stories as about its own.
 */
async function ownStories() {
    let index;

    try {
        const response = await fetch(`${URL}/index.json`);
        if (!response.ok) {
            fail(`At the address ${URL} the showcase gave no story index (${response.status}). Raise it: pnpm run storybook:ui-kit-v2`);
        }
        index = await response.json();
    } catch (error) {
        fail(`At the address ${URL} nobody answers (${error.message}). Raise the showcase: pnpm run storybook:ui-kit-v2`);
    }

    const entries = Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');
    if (entries.length === 0) {
        fail(`At the address ${URL} the showcase has not one story — there is nothing to sweep.`);
    }

    const own = entries.filter((entry) => (entry.importPath ?? '').includes(OWN_IMPORT_MARKER));
    if (own.length === 0) {
        const sample = entries[0]?.importPath ?? '—';
        fail(
            `At the address ${URL} it is not the second kit's showcase that answers: the stories come from «${sample}», and were expected from «${OWN_IMPORT_MARKER}».`
        );
    }

    return own;
}

/**
 * The area of what the story drew.
 *
 * The showing root is the harness's host, and it is also the snapshot's frame area. For a story
 * drawing itself past the harness, the showcase's own root is measured: such a story is shot whole too.
 *
 * A zero root height does not yet mean an empty showing. A toast, a bottom sheet and everything a
 * component nails to the window itself stand outside the flow — the root above such content
 * collapses into a strip of zero height. A CDK Overlay panel is drawn in a container on `body`
 * altogether. So at an empty root the largest drawn node inside the showing and inside the overlay
 * container is measured: an empty showing has nothing to measure at all — there is not one node with an area.
 */
const measureShownArea = () => {
    const area = (node) => {
        const box = node.getBoundingClientRect();

        return Math.round(box.width * box.height);
    };

    const root = document.querySelector('[data-story-root]') ?? document.querySelector('#storybook-root');

    if (root === null) {
        return 0;
    }

    const shown = area(root);

    if (shown > 0) {
        return shown;
    }

    const drawn = [...root.querySelectorAll('*'), ...document.querySelectorAll('.cdk-overlay-container *')];

    return drawn.reduce((largest, node) => Math.max(largest, area(node)), 0);
};

const chromium = await loadChromium();
const stories = await ownStories();

console.log(`The second kit's showcase on ${URL}: stories ${stories.length}. The sweep is begun.`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
// The listeners are hung on the page once, and the box is cleared before every story: a subscription
// per story piles up listeners, and by the end of the sweep one error arrives as a hundred lines.
const remember = (text) => {
    if (!KNOWN_SHOWCASE_NOISE.some((pattern) => pattern.test(text))) {
        errors.push(text);
    }
};

page.on('console', (message) => (message.type() === 'error' ? remember(message.text()) : undefined));
page.on('pageerror', (error) => remember(error.message));

const broken = [];

for (const story of stories) {
    errors.length = 0;

    await page.goto(`${URL}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'networkidle' });
    // The error arrives in the console later than the page's readiness: without this pause `NG0950`
    // goes not to the story it happened on but to the next one.
    await page.waitForTimeout(150);

    const area = await page.evaluate(measureShownArea);

    if (area < MIN_AREA || errors.length > 0) {
        broken.push({ id: story.id, area, error: errors[0] });
    }
}

await browser.close();

if (broken.length === 0) {
    console.log(`There are no empty showings and no drawing errors: ${stories.length} stories.`);
    process.exit(0);
}

const lines = broken.map(({ id, area, error }) => `${id} — area ${area}${error === undefined ? '' : `, ${error.split('\n')[0]}`}`);

fail(
    `Stories with an empty showing or a drawing error: ${broken.length} of ${stories.length}.\n    ${lines.join('\n    ')}\n\n` +
        `  While this is not sorted out, the references must not be taken: the shot pins the emptiness down, and the run becomes eternally green.`
);
