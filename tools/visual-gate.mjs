#!/usr/bin/env node
/**
 * The kit showcase's snapshots by one command: raise the showcase, match the frames, stop it.
 *
 * The snapshot runners do not raise their showcase on purpose — they match the frames on an
 * **already** raised one, and in the pipeline's task the step raises it itself. The push gate has no
 * step: it calls a command per line and leaves no stand behind it. Here lives what the pipeline's
 * task writes as the step's lines.
 *
 * A free port is taken rather than a constant one: the gate shares the machine with a showcase the
 * developer raised by hand, and one pinned to 6006 would answer the run instead of its own. That is
 * exactly what the pipeline's task has its own ports for; a constant port at the gate would collide
 * the gate with the run.
 *
 * **Both showcases shoot with the browser of an image, and their frames are matched everywhere.**
 * The raster of glyphs is computed by the machine that draws, and two machines at the same code
 * give a different frame: a text-heavy page diverges by 0.01 of its pixels across every letter at
 * once, while a small component matches. The pipeline's runner is not the developer's machine, so a
 * reference taken by either of them cannot match both. The image is one on any machine: it is
 * raised by the shooting run, which is given its address here. The probes of the harness run
 * without the image: they judge the harness, not the raster.
 *
 * The showcase is stopped together with its process tree: the task runner starts it, and killing one
 * parent would leave a working server holding the port until the end of the session.
 *
 *   node tools/visual-gate.mjs ui-kit              # the first showcase's snapshots
 *   node tools/visual-gate.mjs ui-kit --update     # a re-take of them, by the same road
 *   node tools/visual-gate.mjs ui-kit-v2           # the second showcase's snapshots
 *   node tools/visual-gate.mjs ui-kit-v2 --update  # a re-take of them, by the same road
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { networkInterfaces } from 'node:os';

/**
 * The kits are kept apart on purpose: each has its own showcase, its own snapshot runner and its
 * own references directory. Here they stand next to each other only as two lines of the set —
 * they share no shooting code, and an edit for one does not move the other's frames.
 */
const KITS = {
    'ui-kit': {
        target: '@rt-tools/ui-kit:build-storybook',
        built: 'dist/storybook/@rt-tools/ui-kit',
        snapshots: 'test:visual',
        update: 'test:visual:update',
        probes: ['check:paint'],
        image: true,
    },
    'ui-kit-v2': {
        target: '@rt-tools/ui-kit-v2:build-storybook',
        built: 'dist/storybook/@rt-tools/ui-kit-v2',
        snapshots: 'test:visual:v2',
        update: 'test:visual:v2:update-all',
        probes: ['check:icons', 'check:window'],
        image: true,
    },
};

/** The waiting limit for the showcase to come up. Not a measure of readiness but a sign that it did not. */
const READY_TIMEOUT_MS = 240_000;

/** How often to ask the showcase. The poll is cheap: it is one request to the story index. */
const POLL_MS = 2_000;

const kit = process.argv[2];

/**
 * A re-take instead of a matching. It goes the same road as the matching — the built showcase and
 * the browser of an image — because a reference taken by any other road is wrong in silence: it
 * holds the raster of the machine that took it, and no other machine draws that.
 */
const retakes = process.argv.includes('--update');

if (!Object.hasOwn(KITS, kit)) {
    console.error(`\n  The kit is not named or is unknown: «${kit ?? ''}». Expected one of: ${Object.keys(KITS).join(', ')}\n`);
    process.exit(1);
}

/**
 * A free port is asked of the system rather than taken out of the head.
 *
 * Between the answer and the raising of the showcase a gap is left that a foreign listener could
 * squeeze into — but a constant port is worse: it is not a gap but a guaranteed collision of the
 * gate with the pipeline's run on this same machine.
 */
function freePort() {
    return new Promise((resolve, reject) => {
        const probe = createServer();
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => {
            const { port } = probe.address();
            probe.close(() => resolve(port));
        });
    });
}

async function ready(url) {
    const deadline = Date.now() + READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${url}/index.json`);
            if (response.ok) {
                return true;
            }
        } catch {
            // The showcase is still building — nobody at the address yet. That is an expected state, not a refusal.
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }

    return false;
}

/**
 * The name of the machine on its own network, so that both sides reach the showcase by one
 * address: the shooting browser lives in an image, and `localhost` there is its own.
 *
 * The showcase is therefore raised on every interface rather than on the loopback alone — bound
 * to the loopback it answers neither the image nor the machine's own network name.
 */
function machineAddress() {
    for (const cards of Object.values(networkInterfaces())) {
        for (const card of cards ?? []) {
            if (card.family === 'IPv4' && !card.internal) {
                return card.address;
            }
        }
    }

    return '';
}

const port = await freePort();

/*
 * A showcase shot by the machine's own browser stays on the loopback: it is reached from this very
 * machine, and its own name would only widen who can reach it. The one shot in an image is reached
 * by the machine's network name — `localhost` inside the image is the image's own.
 */
const host = KITS[kit].image ? machineAddress() : 'localhost';

if (!host) {
    console.error('\n  The machine has no network name of its own, and the image has no way to reach the showcase by one.\n');
    process.exit(1);
}

const url = `http://${host}:${port}`;

let showcase = null;
let stopped = false;

function stop() {
    if (stopped) {
        return;
    }
    stopped = true;
    try {
        if (showcase) {
            process.kill(-showcase.pid, 'SIGTERM');
        }
    } catch {
        // The process tree has already ended by itself — there is nothing to stop.
    }
}

process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

if (KITS[kit].image) {
    console.log(`visual-gate: building the showcase ${kit}`);

    const build = spawnSync('pnpm', ['exec', 'nx', 'run', `${KITS[kit].target}`, '--configuration', 'ci'], { stdio: 'inherit' });

    if ((build.status ?? 1) !== 0) {
        console.error(`\n  The showcase ${kit} did not build — there is nothing to shoot.\n`);
        process.exit(1);
    }

    console.log(`visual-gate: serving the built showcase ${kit} on ${url}`);

    /*
     * The serving is a process of its own, not a server inside this script: this script waits for
     * the shooting run synchronously, and a server sharing its loop answers nothing for the whole
     * length of that wait — the connection opens and the reply never comes.
     */
    showcase = spawn('node', ['tools/serve-static.mjs', KITS[kit].built, String(port)], {
        stdio: ['ignore', 'ignore', 'inherit'],
        detached: true,
    });
} else {
    console.log(`visual-gate: raising the showcase ${kit} on ${url}`);

    showcase = spawn('pnpm', ['exec', 'nx', 'run', KITS[kit].target, '--port', String(port), '--no-open'], {
        stdio: ['ignore', 'ignore', 'ignore'],
        // A process group of its own: killing one parent would leave the server holding the port.
        detached: true,
    });
}

if (!(await ready(url))) {
    stop();
    console.error(`\n  The showcase ${kit} did not come up in ${READY_TIMEOUT_MS / 1000} s — there is nothing to shoot.\n`);
    process.exit(1);
}

/**
 * Both showcases shoot with the browser of an image, so their frames are matched everywhere.
 *
 * The branch below stays for a showcase that has no image of its own: without one a frame holds
 * the raster of the machine that took it, and matching it here would refuse a push on a tree that
 * changed nothing. Such a showcase is judged in the pipeline alone, and that is said aloud rather
 * than passed over in silence.
 */
const judgesFrames = KITS[kit].image || Boolean(process.env['CI']);

if (!judgesFrames) {
    console.log(`\n  The frames of ${kit} are matched in the pipeline only: its showcase shoots with the machine's browser.\n`);
}

const snapshots = retakes ? KITS[kit].update : KITS[kit].snapshots;

if (!snapshots) {
    console.error(`\n  The showcase ${kit} has no re-take of its own here — it is taken where its own harness says.\n`);
    process.exit(1);
}

const shoot = KITS[kit].image ? ['node', ['tools/shot-browser.mjs', 'pnpm', 'run', snapshots]] : ['pnpm', ['run', snapshots]];

const run = judgesFrames
    ? spawnSync(shoot[0], shoot[1], {
          stdio: 'inherit',
          env: { ...process.env, STORYBOOK_URL: url },
      })
    : { status: 0 };

/**
 * The harness probes go over the same raised showcase rather than by a step of their own.
 *
 * By a step of their own they would raise the showcase a second time — the longest thing in this
 * set — while they cost seconds. They are run after red snapshots too: a probe speaks of the
 * harness itself, and its answer is needed exactly when the snapshots diverged.
 */
let probesFailed = 0;

for (const probe of KITS[kit].probes) {
    const result = spawnSync('pnpm', ['run', probe], {
        stdio: 'inherit',
        env: { ...process.env, STORYBOOK_URL: url },
    });

    if ((result.status ?? 1) !== 0) {
        probesFailed += 1;
    }
}

stop();

process.exit((run.status ?? 1) !== 0 || probesFailed > 0 ? 1 : 0);
