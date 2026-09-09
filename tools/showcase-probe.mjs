/**
 * What the two showcase probes share: opening a story and naming a showcase that serves none.
 *
 * Why it exists. Both probes judge the snapshot harness over an already raised showcase, and both
 * used to fail the same way when the showcase they were pointed at served no stories: the wait for
 * the showing root ran out and the probe died with an uncaught stack about a locator. In the push
 * gate that reads as «the harness rolled back», and the push is refused for a reason that is not
 * true. A showcase goes stale on its own — its hot update loses a chunk after a branch switch, the
 * story hangs at preparing for ever, and no edit in the tree caused it.
 *
 * So the wait is not left bare here. Its refusal names the address, what the page actually showed
 * and the requests that did not arrive — enough to tell a stale showcase from a broken harness
 * without opening a browser by hand.
 *
 * The browser driver itself is not loaded here: every probe in the tree carries its own way to it,
 * and a fifth copy of that way is not what this module was started for.
 */

/** The sign Storybook leaves on a page whose story never finished preparing. */
const PREPARING = 'sb-preparing-story';

/** What the page holds after the wait ran out — the material of the refusal, not a verdict. */
async function pageState(page, selector, failed) {
    const state = { roots: 0, preparing: false, failed: [...new Set(failed)].slice(0, 5) };

    try {
        state.roots = await page.locator(selector).count();
        state.preparing = await page.evaluate((mark) => document.body.innerHTML.includes(mark), PREPARING);
    } catch {
        // A page that answers nothing at all is described by the address and the requests alone.
    }

    return state;
}

/** The refusal text: the state of the showcase in words, and what to do about it. */
function complaintAbout(state, address, selector, timeoutMs) {
    const lines = [
        `  The showcase at «${address}» did not show the showing root «${selector}» in ${timeoutMs / 1000} s.`,
        `  Roots on the page: ${state.roots}.` + (state.preparing ? ' The story is still at preparing.' : ''),
    ];

    if (state.failed.length > 0) {
        lines.push(`  Requests the showcase refused: ${state.failed.join(', ')}.`);
    }

    lines.push(
        '',
        '  This says nothing about the snapshot harness. A showcase goes stale by itself — after a branch',
        '  switch its hot update loses a chunk, and every story hangs at preparing. Raise it anew and repeat',
        '  the probe; under `node tools/visual-gate.mjs` a fresh one is raised for every run.'
    );

    return lines.join('\n');
}

/**
 * It opens a story and waits for the showing root, naming the state of the showcase on a refusal.
 *
 * The wait is the very place both probes used to die at, and its bare refusal speaks of a locator
 * — that is, of the probe's own code — while the cause lies in the showcase it was pointed at.
 */
export async function openStory(page, { url, story, selector, timeoutMs }) {
    const failed = [];
    const watch = (response) => {
        if (response.status() >= 400) {
            failed.push(`${response.status()} ${response.url().slice(0, 120)}`);
        }
    };

    // The address is kept as it was asked for, not read off the page: a page that never arrived
    // answers with a blank address, and the refusal would then name nothing at all.
    const address = `${url}/iframe.html?id=${story}&viewMode=story`;

    page.on('response', watch);

    try {
        await page.goto(address, { waitUntil: 'load' });
        await page.waitForSelector(selector, { timeout: timeoutMs });
    } catch (failure) {
        if (failure.name !== 'TimeoutError') {
            throw failure;
        }

        const state = await pageState(page, selector, failed);
        console.error(`\n${complaintAbout(state, address, selector, timeoutMs)}\n`);
        process.exit(1);
    } finally {
        page.off('response', watch);
    }
}
