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

import { utimesSync } from 'node:fs';
import { resolve } from 'node:path';

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

/**
 * How long the index is waited for after the poke, before the showcase counts as beyond healing.
 *
 * The indexer rereads a poked file at the next request, and on this tree's 168 story files that
 * takes single seconds. Half a minute is the ceiling of the wait, not its price.
 */
const INDEX_HEAL_TIMEOUT_MS = 30_000;

/** How often the index is asked while it is being waited for. */
const INDEX_POLL_MS = 1_000;

/**
 * The story files the indexer choked on, taken from its own refusal.
 *
 * It names every one of them and in the same shape — a path from the working directory with a
 * colon after it, `./projects/…/thing.stories.ts:` — so there is nothing to guess here.
 */
function brokenFilesIn(text) {
    return [...text.matchAll(/Unable to index (\.[^\s:]+):/g)].map(([, path]) => path);
}

/** The refusal text of a showcase whose index the poke did not bring back. */
function complaintAboutIndex(address, files) {
    return [
        `  The showcase at «${address}» serves no story index: /index.json answers with a refusal.`,
        `  The files its indexer choked on: ${files.join(', ') || 'it named none'}.`,
        '',
        '  This says nothing about the snapshot harness and nothing about the stories: the index is',
        '  built anew at every start, and a fresh showcase over the same files serves it whole. The',
        '  files were poked and the index did not come back — raise the showcase anew and repeat.',
    ].join('\n');
}

/** Reads the index of a showcase: whether it is served, and what its refusal says if it is not. */
async function readIndex(address) {
    try {
        const answer = await fetch(`${address}/index.json`);
        return { ok: answer.ok, body: answer.ok ? '' : await answer.text() };
    } catch (failure) {
        return { ok: false, body: String(failure) };
    }
}

/** Pokes a file so that the showcase's watcher fires over it: the mtime is all the watcher reads. */
function pokeFile(path) {
    const stamp = new Date();
    utimesSync(resolve(process.cwd(), path), stamp, stamp);
}

/**
 * It makes sure the showcase serves its story index, and brings the index back where it can.
 *
 * Why this is not left to whoever raised the showcase. A parse of one story file can fail on a
 * file that is being written under the watcher — a branch switch writes 168 of them — and the
 * indexer keeps that failure as the file's entry. From that second `/index.json` answers with a
 * refusal whole: not the seven stories of the file are gone but every one of the 625, the pages
 * hang at preparing, and a snapshot run over such a showcase goes red with what reads as a
 * divergence of the work. The entry is dropped by one thing only — a watcher event over that same
 * file — so the poke here is the cure and not a workaround: it is the event the file never got.
 */
export async function ensureIndex(address, options = {}) {
    const {
        read = readIndex,
        poke = pokeFile,
        wait = (ms) => new Promise((done) => setTimeout(done, ms)),
        timeoutMs = INDEX_HEAL_TIMEOUT_MS,
        report = (message) => console.error(message),
    } = options;

    const first = await read(address);

    if (first.ok) {
        return { healed: false };
    }

    const files = brokenFilesIn(first.body);

    for (const file of files) {
        try {
            poke(file);
        } catch {
            // A file the refusal names but the tree does not hold is poked by nobody: the index
            // will come back without it, and the wait below answers whether it did.
        }
    }

    for (let waited = 0; files.length > 0 && waited < timeoutMs; waited += INDEX_POLL_MS) {
        await wait(INDEX_POLL_MS);

        if ((await read(address)).ok) {
            report(`\n  The showcase at «${address}» served no index; its ${files.length} story file(s) were poked and it came back.\n`);
            return { healed: true, files };
        }
    }

    console.error(`\n${complaintAboutIndex(address, files)}\n`);
    process.exit(1);
}
