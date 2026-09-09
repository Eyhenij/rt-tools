#!/usr/bin/env node
/**
 * A probe of the second showcase's snapshot harness: does it wait for drawn icons before the shot.
 *
 * Why it exists. The icons travel over the network one at a time — a file per name the markup asked
 * for — and until the symbol arrives `<use href="#…">` draws nothing. The frame comes out without
 * icons and with the row's layout drifted, and the run is green at that: a reference pinned by such
 * a frame then matches itself. A wave re-take pinned four frames that way, and a repeated matching
 * found it rather than the run.
 *
 * How it judges. The icon files are held back on their approach, and one and the same story is shot
 * twice: once without the icon wait, once with it. The frames must diverge — that is what it means
 * that the wait works. They matched — either the wait is taken out or the chosen story has no icons
 * left, and both cases are equally bad.
 *
 * The story chosen is the one the former wait did not see at all: the split button draws the chevron
 * by the button's directive, as a bare `<svg>` without an `rt-icon` host — while the wait went over
 * the hosts and came out successful on the first line. That is why the probe checks apart that there
 * are zero hosts on it: a story that has got a host would be judging a different miss.
 *
 * Every frame is taken in a fresh page of its own rather than two in a row in one: the files are
 * held back on their approach, and the second frame in the same page would come by symbols that had
 * already arrived.
 *
 * The probe raises no showcase: it goes over an already raised one, the address comes from
 * STORYBOOK_URL.
 *
 *   STORYBOOK_URL=http://localhost:6007 node tools/snapshot-icon-probe.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { openStory } from './showcase-probe.mjs';

/** The story the former wait did not see: zero icon hosts and seven drawn icons. */
const STORY = 'molecules-forms-splitbutton--states';

/** The same frame size as the harness's — it is declared by `src/showcase/story-snapshot.ts`. */
const VIEWPORT = { width: 1280, height: 720 };

/** The same pause after the motion is muted as the harness's. */
const SETTLE_MS = 150;

/**
 * For how long the icon files are held back.
 *
 * The probe judges not the network's speed but the order: a frame without the wait must leave
 * before the symbols. So the delay is taken knowingly larger than the frame's preparation and does
 * not depend on the machine's load — on a busy one the preparation is only longer, the order the same.
 */
const SPRITE_HOLD_MS = 2_000;

/** How many pairs to take before calling a match a refusal. */
const MAX_PAIRS = 3;

/** The late boundary of the icon wait in the probe itself — a limit, not a measure. */
const ICONS_TIMEOUT_MS = 30_000;

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** The wait module the probe judges: the call must stand in it, not only work. */
const WAIT_MODULE = 'projects/ui-kit-v2/.storybook/snapshot-wait.ts';

/** The shot harness: it must call the wait before the frame. */
const RUNNER = 'projects/ui-kit-v2/.storybook/test-runner.ts';

/** The sign of the showing root — the same one the harness judges a settled showing by. */
const ROOT_SELECTOR = '[data-story-root]';

const digest = (buffer) => createHash('sha1').update(buffer).digest('hex').slice(0, 12);

/**
 * The browser driver arrives as a dependency of the snapshot runner rather than by the tree's manifest.
 *
 * pnpm's strict layout does not put it into the root `node_modules`, so an import by name finds
 * nothing here. The second road is pnpm's shared links directory, where the transitive is put. The
 * technique is repeated from the first showcase's drawing probe: the tree's checks have no shared module.
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

    console.error(
        '\n  The browser driver is found neither by name nor in the pnpm links directory. Install the dependencies: pnpm install\n'
    );
    process.exit(1);
}

/**
 * It removes the explanations from the source, leaving the code alone.
 *
 * Otherwise a call commented out by one slash reads as live: the line `// await drawnIcons(page, …)`
 * holds the sought words whole, and a search by text finds it.
 */
function codeOnly(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n');
}

/**
 * It judges the harness itself: does it wait for the icons and does it look for them by the right sign.
 *
 * A measurement in the browser says the technique cures the miss but stays silent about whether it
 * is applied: taken out of the harness, it would leave the probe green. The order of the calls is
 * read as text — there is no way to ask the harness from inside, it is run by the showcase runner.
 */
function harnessWaitsForIcons() {
    const wait = codeOnly(readFileSync(join(process.cwd(), WAIT_MODULE), 'utf8'));
    const runner = codeOnly(readFileSync(join(process.cwd(), RUNNER), 'utf8'));

    if (!wait.includes('await drawnIcons(page')) {
        return `the wait module «${WAIT_MODULE}» has no call of the icon wait`;
    }

    // Going over the `rt-icon` hosts is that very miss: a page where the button's directive draws
    // the icons it does not see at all and lets the shot out on the first line.
    if (!wait.includes('RT_ICON_SYMBOL_ID_PREFIX')) {
        return `the wait in «${WAIT_MODULE}» looks for an icon not by its reference into the set — a page without «rt-icon» hosts will pass it by again`;
    }

    const called = runner.indexOf('await quiet(page');
    const shot = runner.indexOf('await shoot(page');

    if (called < 0 || shot < 0) {
        return `the harness «${RUNNER}» has no pair «wait — shot» in it: the probe no longer knows what to judge`;
    }

    if (called > shot) {
        return `in the harness «${RUNNER}» the wait stands after the shot, that is, does nothing`;
    }

    return null;
}

const misplaced = harnessWaitsForIcons();

if (misplaced !== null) {
    console.error(
        `\n  The icon probe: ${misplaced}.\n` +
            `  A frame taken before the set arrives comes out without icons and with the row's layout drifted, while the run\n` +
            `  is green at that: a reference pinned by such a frame then matches itself.\n`
    );
    process.exit(1);
}

const chromium = await loadChromium();
const browser = await chromium.launch();

try {
    /** The page is prepared as the harness does, but without the icon wait. */
    const prepare = async (page) => {
        await openStory(page, { url: URL, story: STORY, selector: ROOT_SELECTOR, timeoutMs: ICONS_TIMEOUT_MS });
        await page.addStyleTag({
            content:
                '*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important;caret-color:transparent !important;}',
        });
        await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
        await page.mouse.move(0, 0);
        await page.waitForTimeout(SETTLE_MS);
    };

    /** The wait for drawn icons — the same as in the harness. */
    const drawn = async (page) => {
        await page.waitForFunction(
            () =>
                Array.from(document.querySelectorAll('use[href^="#rt-icon-"]')).some((use) => {
                    const box = use.getBoundingClientRect();
                    return box.width > 0 && box.height > 0;
                }),
            undefined,
            { timeout: ICONS_TIMEOUT_MS }
        );
    };

    const shoot = async (wait) => {
        const context = await browser.newContext({ viewport: { ...VIEWPORT } });
        const page = await context.newPage();

        // The set is held back on its approach: without the delay it arrives before the frame's
        // preparation, and the probe would judge the machine's speed instead of the order of the calls.
        await context.route('**/icons/*.svg', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, SPRITE_HOLD_MS));
            await route.continue();
        });

        await prepare(page);

        if (wait) {
            await drawn(page);
        }

        const seen = await page.evaluate(() => ({
            hosts: document.querySelectorAll('rt-icon').length,
            uses: document.querySelectorAll('use[href^="#rt-icon-"]').length,
        }));
        const image = await page.locator(ROOT_SELECTOR).first().screenshot();
        await context.close();

        return { digest: digest(image), ...seen };
    };

    let diverged = null;
    let taken = 0;
    let sample = null;

    while (taken < MAX_PAIRS && diverged === null) {
        const early = await shoot(false);
        const late = await shoot(true);

        taken += 1;
        sample = late;

        if (late.hosts > 0) {
            console.error(
                `\n  The icon probe: the story «${STORY}» has got ${late.hosts} «rt-icon» hosts.\n` +
                    `  The miss the probe guards was exactly in a page without hosts: choose another story\n` +
                    `  where the button's directive draws the icon — otherwise the probe judges the wrong case.\n`
            );
            process.exit(1);
        }

        if (late.uses === 0) {
            console.error(
                `\n  The icon probe: the story «${STORY}» has no icons left at all — there is nothing to judge.\n` +
                    `  Choose a story that draws an icon by a reference into the set.\n`
            );
            process.exit(1);
        }

        if (early.digest !== late.digest) {
            diverged = { pair: taken, early: early.digest, late: late.digest, uses: late.uses };
        }
    }

    if (diverged === null) {
        console.error(
            `\n  The icon probe: pairs taken ${taken}, and in each the frame before the wait matched the frame after — all ${sample.digest}.\n` +
                `  That means the icon wait no longer changes anything: either it is taken out of the module\n` +
                `  «${WAIT_MODULE}», or the set arrives faster than it can be held back.\n`
        );
        process.exit(1);
    }

    console.log(
        `The icon probe: pairs taken ${taken}, the ${diverged.pair}-th diverged — the frame before the wait ${diverged.early}, after ${diverged.late}. ` +
            `Icons on the page ${diverged.uses}, «rt-icon» hosts zero. The wait works.`
    );
} finally {
    await browser.close();
}
