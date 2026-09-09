#!/usr/bin/env node
/**
 * A probe of the second showcase's snapshot harness: does it widen the window before an element frame.
 *
 * Why it exists. The frame is taken by the root of the showing, and the base window is 1280×720 —
 * almost every matrix of the kit is higher. A node higher than the window the browser shoots by
 * substituting the window for the duration of the frame: the page gets a `resize`, and it loses two
 * pixels of height and sixteen of scroll right under the shutter. The neighbouring story is then
 * shot by an already shifted page, so the divergence lands not on the tall showing but on the story
 * after it.
 *
 * Why the snapshot run does not guard this. Remove the widening from the harness and both the frame
 * and the reference move the same way: a re-take makes the run green on the miss for ever. Seventy
 * references of the catalogue lay short exactly like that, and it was found by a measurement of the
 * node around the shot rather than by the run.
 *
 * How it judges. Two sides, and neither alone is enough. As text — the widening call stands in the
 * harness and stands before the shot. In substance — one and the same story is shot twice on pages
 * of its own: once at the base window, once at a window grown to the node. Without the widening the
 * node's height must change across the shot; with it, it must hold. The first half catches a
 * rollback by an edit, the second a rollback in substance: the call is in place and widens to the
 * wrong thing.
 *
 * The probe raises no showcase: it goes over an already raised one, the address comes from
 * STORYBOOK_URL.
 *
 *   STORYBOOK_URL=http://localhost:6007 node tools/snapshot-window-probe.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A story whose root is higher than the base window: the set of the social signs, 1072 px tall. */
const STORY = 'atoms-icon--social';

/** The same frame size as the harness's — it is declared by `src/showcase/story-snapshot.ts`. */
const VIEWPORT = { width: 1280, height: 720 };

/** The same pause after the motion is muted as the harness's. */
const SETTLE_MS = 150;

/** How many measurements to take before calling a match a refusal. */
const MAX_TRIES = 3;

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** The shot harness: the widening must stand in it, and before the frame. */
const RUNNER = 'projects/ui-kit-v2/.storybook/test-runner.ts';

/** The sign of the showing root — the same one the harness shoots by. */
const ROOT_SELECTOR = '[data-story-root]';

/**
 * The browser driver arrives as a dependency of the snapshot runner rather than by the tree's manifest.
 *
 * pnpm's strict layout does not put it into the root `node_modules`, so an import by name finds
 * nothing here. The second road is pnpm's shared links directory. The technique is repeated from the
 * icon probe next to it: the tree's checks have no shared module.
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

    console.error('\n  The browser driver is found neither by name nor in the pnpm links directory. Install the dependencies: pnpm install\n');
    process.exit(1);
}

/**
 * It removes the explanations from the source, leaving the code alone.
 *
 * Otherwise a call commented out by one slash reads as live: the line `// await fitViewportToNode(…)`
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
 * It judges the harness itself: does it widen the window and does it do so before the frame.
 *
 * A measurement in the browser says the technique cures the miss but stays silent about whether it
 * is applied: taken out of the harness, it would leave that half of the probe green.
 */
function harnessWidensTheWindow() {
    const runner = codeOnly(readFileSync(join(process.cwd(), RUNNER), 'utf8'));

    const widened = runner.indexOf('await fitViewportToNode(page');
    if (widened < 0) {
        return `the harness «${RUNNER}» has no call of the widening to the node being shot`;
    }

    const shot = runner.indexOf('.screenshot()', widened);
    if (shot < 0) {
        return `the harness «${RUNNER}» has no element frame after the widening: the probe no longer knows what to judge`;
    }

    // The widening to the whole page cures another frame and is no substitute here: the page happens
    // to be higher than the node, and everything counted from the window would move at stories that
    // did not ask for it.
    if (!runner.includes('fitViewportToNode(page, identifier, ROOT_SELECTOR)')) {
        return `the widening in «${RUNNER}» goes not by the root of the showing — a node higher than the window will go past the shutter again`;
    }

    return null;
}

/** The height of the root of the showing, taken twice: before the frame and after it. */
async function heightAroundTheShot(browser, grow) {
    const context = await browser.newContext({ viewport: { ...VIEWPORT } });
    const page = await context.newPage();

    await page.goto(`${URL}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: 'load' });
    const node = page.locator(ROOT_SELECTOR).first();
    await node.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}' });
    await page.waitForTimeout(SETTLE_MS);

    const before = await node.boundingBox();

    if (grow) {
        await page.setViewportSize({
            width: Math.max(VIEWPORT.width, Math.ceil(before.width)),
            height: Math.max(VIEWPORT.height, Math.ceil(before.height)),
        });
        await page.waitForTimeout(SETTLE_MS);
    }

    const measured = await node.boundingBox();
    await node.screenshot();
    const after = await node.boundingBox();

    await context.close();

    return { before: measured.height, after: after.height, tall: before.height > VIEWPORT.height };
}

const complaint = harnessWidensTheWindow();
if (complaint) {
    console.error(`\n  snapshot-window-probe: ${complaint}\n`);
    process.exit(1);
}

const chromium = await loadChromium();
const browser = await chromium.launch();

let bare = null;
let tries = 0;

// A single measurement inherits the rarity it guards against: the frame sometimes manages to draw
// itself. The measurements go one after another until they diverge, and the refusal names how many
// were taken.
while (tries < MAX_TRIES) {
    tries += 1;
    bare = await heightAroundTheShot(browser, false);
    if (bare.before !== bare.after) {
        break;
    }
}

if (!bare.tall) {
    await browser.close();
    console.error(
        `\n  snapshot-window-probe: the root of the story «${STORY}» is no longer higher than the window ` +
            `(${bare.before} against ${VIEWPORT.height}) — the probe judges nothing. Choose a taller story.\n`
    );
    process.exit(1);
}

if (bare.before === bare.after) {
    await browser.close();
    console.error(
        `\n  snapshot-window-probe: the shot past the bounds of the window no longer moves the page ` +
            `(${tries} measurements, the height held at ${bare.before}) — either the browser has changed or the probe judges nothing.\n`
    );
    process.exit(1);
}

const grown = await heightAroundTheShot(browser, true);
await browser.close();

if (grown.before !== grown.after) {
    console.error(
        `\n  snapshot-window-probe: with the window widened the page still moves under the shutter ` +
            `(${grown.before} → ${grown.after}) — the widening does not cure the miss it was written for.\n`
    );
    process.exit(1);
}

console.log(
    `snapshot-window-probe: the story «${STORY}», the root ${grown.before} px against the window ${VIEWPORT.height}; ` +
        `without the widening the height goes away ${bare.before} → ${bare.after} in ${tries} measurements, with it it holds`
);
