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
 * **Frames are matched only in the pipeline.** The raster of glyphs is computed by the machine, and
 * two machines at the same code give a different frame: a text-heavy page diverges by 0.01 of its
 * pixels across every letter at once, while a small component matches. The pipeline's runner is not
 * the developer's machine — its working directory says so in the run's output — so a reference
 * cannot match both: taken by the developer it fails the pipeline, taken for the pipeline it fails
 * the push gate, and every re-take swaps one side of the divergence for the other. The probes of the
 * harness run in both places: they judge the harness, not the machine.
 *
 * The showcase is stopped together with its process tree: the task runner starts it, and killing one
 * parent would leave a working server holding the port until the end of the session.
 *
 *   node tools/visual-gate.mjs ui-kit       # the first showcase's snapshots
 *   node tools/visual-gate.mjs ui-kit-v2    # the second showcase's snapshots
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

/**
 * The kits are kept apart on purpose: each has its own showcase, its own snapshot runner and its
 * own references directory. Here they stand next to each other only as two lines of the set —
 * they share no shooting code, and an edit for one does not move the other's frames.
 */
const KITS = {
    'ui-kit': { target: '@rt-tools/ui-kit:storybook', snapshots: 'test:visual', probes: ['check:paint'] },
    'ui-kit-v2': { target: '@rt-tools/ui-kit-v2:storybook', snapshots: 'test:visual:v2', probes: ['check:icons', 'check:window'] },
};

/** The waiting limit for the showcase to come up. Not a measure of readiness but a sign that it did not. */
const READY_TIMEOUT_MS = 240_000;

/** How often to ask the showcase. The poll is cheap: it is one request to the story index. */
const POLL_MS = 2_000;

const kit = process.argv[2];

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

const port = await freePort();
const url = `http://localhost:${port}`;

console.log(`visual-gate: raising the showcase ${kit} on ${url}`);

const showcase = spawn('pnpm', ['exec', 'nx', 'run', KITS[kit].target, '--port', String(port), '--no-open'], {
    stdio: ['ignore', 'ignore', 'ignore'],
    // A process group of its own: killing one parent would leave the server holding the port.
    detached: true,
});

let stopped = false;

function stop() {
    if (stopped) {
        return;
    }
    stopped = true;
    try {
        process.kill(-showcase.pid, 'SIGTERM');
    } catch {
        // The process tree has already ended by itself — there is nothing to stop.
    }
}

process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

if (!(await ready(url))) {
    stop();
    console.error(`\n  The showcase ${kit} did not come up in ${READY_TIMEOUT_MS / 1000} s — there is nothing to shoot.\n`);
    process.exit(1);
}

const judgesFrames = Boolean(process.env['CI']);

if (!judgesFrames) {
    console.log(`\n  The frames of ${kit} are not matched outside the pipeline — they are judged where they are taken.\n`);
}

const run = judgesFrames
    ? spawnSync('pnpm', ['run', KITS[kit].snapshots], {
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
