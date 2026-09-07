#!/usr/bin/env node
/**
 * A probe of the first showcase's snapshot harness: does it wait for a drawn frame before the shot.
 *
 * Why it exists. A frame taken before the first drawing after the motion is muted steadily differs
 * from the reference — the labels are rasterised differently at the same geometry. That divergence
 * fell out about once in fifty runs, and it is not caught by the snapshots: fifty-eight runs in a
 * row gave one red, and twenty green ones in a row fall out on an unfixed harness too. So the
 * snapshot run will not notice a rollback of the edit, and it has to be guarded directly.
 *
 * How it judges. One and the same story is shot twice with one and the same preparation: once
 * without the wait for the drawing, once with it. The frames must diverge — that is what it means
 * that the wait works. They matched — either the wait is taken out or there is nothing left to
 * shoot, and both cases are equally bad.
 *
 * Every frame is taken in a fresh page of its own rather than two in a row in one: the shot itself
 * causes a drawing, and the second frame in the same page would always match the first — the probe
 * would be judging itself rather than the harness.
 *
 * It judges by more than one pair. A frame without the wait sometimes manages to draw itself — by
 * that same chance the probe catches, only from the other side: once in fifty pairs it matched on a
 * whole tree and refused a push that had nothing to answer for. So the pairs are taken one after
 * another until they diverge, and the refusal comes only when they all matched.
 *
 * The probe raises no showcase: it goes over an already raised one, the address comes from
 * STORYBOOK_URL.
 *
 *   STORYBOOK_URL=http://localhost:6006 node tools/snapshot-paint-probe.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The story the divergence was caught on: the button matrix — the densest in labels. */
const STORY = 'components-button--matrix';

/** The same frame size as the harness's: the page height is counted from it. */
const VIEWPORT = { width: 1280, height: 720 };

/** The same icon families the harness waits for. */
const ICON_FONTS = ['Material Icons', 'Material Icons Outlined'];

/** The same pause after the motion is muted as the harness's. */
const SETTLE_MS = 150;

/**
 * How many pairs to take before calling a match a refusal.
 *
 * One pair matches about once in fifty: fifty-eight runs in a row gave one match. The matches are
 * independent — every pair is taken in fresh pages of its own — so three pairs give one false
 * refusal per hundred-odd thousand runs, and they cost three seconds a pair and only when the
 * previous one matched.
 */
const MAX_PAIRS = 3;

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

/** The harness the probe judges: the wait must stand in it, not only work in the browser. */
const RUNNER = 'projects/ui-kit/.storybook/test-runner.ts';

const digest = (buffer) => createHash('sha1').update(buffer).digest('hex').slice(0, 12);

/**
 * The browser driver arrives as a dependency of the snapshot runner rather than by the tree's manifest.
 *
 * pnpm's strict layout does not put it into the root `node_modules`, so an import by name finds
 * nothing here. The second road is pnpm's shared links directory, where the transitive is put. The
 * technique is repeated from the story sweep: the tree's checks have no shared module.
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

/** The page is prepared exactly as the harness does before the shot. */
async function prepare(page) {
    await page.goto(`${URL}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.evaluate(async (families) => {
        for (const family of families) {
            await document.fonts.load(`1rem "${family}"`);
        }
    }, ICON_FONTS);
    await page.waitForFunction(() => document.querySelector('.rtui-icon--loading') === null, undefined, { timeout: 10_000 });
    await page.addStyleTag({
        content:
            '*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important;caret-color:transparent !important;}',
    });
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SETTLE_MS);
}

/** The wait for a drawn frame — the same as in the harness: the second call stands already past the frame. */
async function painted(page) {
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
            })
    );
}

/**
 * It removes the explanations from the source, leaving the code alone.
 *
 * Otherwise a call commented out by one slash reads as live: the line `// await painted(page, …)`
 * holds the sought words whole, and a search by text finds it. That is what happened — a wait taken
 * out of the harness by a comment did not turn the probe red at all, and that is exactly the
 * rollback it stands for.
 */
function codeOnly(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n');
}

/**
 * It judges the harness itself: does it call the wait for the drawing before the shot.
 *
 * A measurement in the browser says the technique cures the divergence but stays silent about
 * whether it is applied: taken out of the harness, it would leave the probe green. The order of the
 * calls is read as text — there is no way to ask the harness from inside, it is run by the showcase runner.
 */
function runnerWaitsForPaint() {
    const source = codeOnly(readFileSync(join(process.cwd(), RUNNER), 'utf8'));
    const wait = source.indexOf('await painted(page');
    const shot = source.indexOf('await stableShot(page)');

    if (wait < 0) {
        return `the harness «${RUNNER}» has no call of the wait for the drawing`;
    }

    if (shot < 0) {
        return `the harness «${RUNNER}» has no frame shot in it — the probe no longer knows what to judge`;
    }

    if (wait > shot) {
        return `in the harness «${RUNNER}» the wait for the drawing stands after the shot, that is, does nothing`;
    }

    return null;
}

const misplaced = runnerWaitsForPaint();

if (misplaced !== null) {
    console.error(
        `\n  The drawing probe: ${misplaced}.\n` +
            `  A frame taken before the first drawing steadily diverges from the reference — 1141 pixels by the labels — \n` +
            `  and it falls out once in fifty runs: the rollback is not caught by the snapshots.\n`
    );
    process.exit(1);
}

const chromium = await loadChromium();
const browser = await chromium.launch();

try {
    const shoot = async (wait) => {
        const context = await browser.newContext({ viewport: { ...VIEWPORT } });
        const page = await context.newPage();
        await prepare(page);

        if (wait) {
            await painted(page);
        }

        const image = await page.screenshot({ fullPage: true });
        await context.close();

        return digest(image);
    };

    let diverged = null;
    let taken = 0;
    let sample = null;

    while (taken < MAX_PAIRS && diverged === null) {
        const early = await shoot(false);
        const late = await shoot(true);

        taken += 1;
        sample = early;

        if (early !== late) {
            diverged = { pair: taken, early, late };
        }
    }

    if (diverged === null) {
        console.error(
            `\n  The drawing probe: pairs taken ${taken}, and in each the frame before the wait matched the frame after — all ${sample}.\n` +
                `  That means the wait for a drawn frame no longer changes anything: either it is taken out of\n` +
                `  the harness «projects/ui-kit/.storybook/test-runner.ts», or the story «${STORY}» has stopped\n` +
                `  showing labels. A single match does not count as a refusal — it falls out once in fifty\n` +
                `  pairs; ${taken} matched in a row speak of the harness itself.\n`
        );
        process.exit(1);
    }

    console.log(
        `The drawing probe: pairs taken ${taken}, the ${diverged.pair}-th diverged — the frame before the wait ${diverged.early}, after ${diverged.late}. The wait works.`
    );
} finally {
    await browser.close();
}
