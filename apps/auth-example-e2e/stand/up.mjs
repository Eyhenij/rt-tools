/**
 * The raising of the stand of the example suite: Keycloak, the people, the production builds of the
 * example and their servers.
 *
 * One script for everything because the spec runner waits for one address: until the admin answers
 * there, the suite does not start, and by that minute Keycloak, the people and the example server
 * must already stand. Split into three commands, the order would be held by the memory of whoever
 * runs them.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { seed } from './seed.mjs';
import { ADMIN_ORIGIN, API_ORIGIN, API_PORT, CLIENT, KEYCLOAK_ORIGIN, REALM } from './stand.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

/** How long to wait for a raised server, milliseconds. */
const WAIT_LIMIT = 60_000;

/** How often to ask again, milliseconds. */
const WAIT_STEP = 300;

const children = [];

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, NX_SKIP_NX_INSTALL_CHECK: 'true' } });
        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} — exit code ${code}`))));
    });
}

function start(command, args, env = {}) {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
    children.push(child);
}

/** Waits for an answer at the address. A refused connection reads as "not up yet". */
async function awaitAnswer(url) {
    const until = Date.now() + WAIT_LIMIT;
    while (Date.now() < until) {
        try {
            await fetch(url);
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, WAIT_STEP));
        }
    }
    throw new Error(`${url} did not answer in ${WAIT_LIMIT / 1000} seconds`);
}

function stopChildren() {
    for (const child of children) {
        child.kill('SIGTERM');
    }
}

for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        stopChildren();
        process.exit(0);
    });
}

// The realm file is applied by the raising of Keycloak: a stand raised before the last edit of the
// file would answer with yesterday's clients
await run('pnpm', ['run', 'serve:auth']);
await seed();

await run('npx', ['nx', 'run-many', '-t', 'build', '-p', 'auth-example-api', 'auth-example-admin', '--configuration', 'production']);

start('node', ['dist/apps/auth-example-api/main.js'], {
    PORT: String(API_PORT),
    AUTH_ISSUER: `${KEYCLOAK_ORIGIN}/realms/${REALM}`,
    AUTH_CLIENT_ID: CLIENT,
});
await awaitAnswer(`${API_ORIGIN}/api/health`);

start('node', ['apps/auth-example-e2e/stand/serve-admin.mjs']);
await awaitAnswer(ADMIN_ORIGIN);

process.stdout.write('the stand of the example suite is up\n');
