#!/usr/bin/env node
/**
 * Asks the running Keycloak stand of the entry module and prints a line per scenario.
 *
 *   pnpm run serve:auth          — raise the stand first
 *   node tools/auth-stand-check.mjs
 *
 * The stand is judged by requests it carried through, not by open ports: a port answers for a
 * container left from a past session as well. Every scenario of the stand agreement gets one line,
 * `ok` or `FAIL` with the reason; the exit code is 1 when any line failed.
 *
 * The check leaves the stand as it found it: the test users are removed, and the realm field edited
 * to check the second raising is restored by that very raising. The import scenario runs the built
 * command, so the script builds `@rt-tools/auth-import` before it starts.
 */
import { execFileSync } from 'node:child_process';
import { pbkdf2Sync, randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { argon2id } from 'hash-wasm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPOSE = ['compose', '-f', join(ROOT, 'deploy/auth/compose.yml')];
const BASE = 'http://localhost:58080';
const MAIL = 'http://localhost:58025';
const REALM = 'rt';
const CLIENT = 'rt-example-admin';
const DISPLAY_NAME = 'RT';
// The import client of the stand; the secret is a test value of the realm file, the stand is local.
const IMPORT_CLIENT = 'rt-user-import';
const IMPORT_SECRET = 'rt-user-import-stand';
const IMPORT_BIN = join(ROOT, 'dist/auth-import/bin.js');

const results = [];

async function scenario(id, title, run) {
    try {
        await run();
        results.push({ id, ok: true, line: `ok   ${id} ${title}` });
    } catch (error) {
        results.push({ id, ok: false, line: `FAIL ${id} ${title}: ${error.message}` });
    }
}

function expect(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function docker(args) {
    return execFileSync('docker', [...COMPOSE, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

async function json(url, init = {}) {
    const response = await fetch(url, init);
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
}

async function adminToken() {
    const { status, body } = await json(`${BASE}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username: 'admin', password: 'admin' }),
    });
    expect(status === 200, `the admin token was refused with ${status}`);
    return body.access_token;
}

async function admin(token, path, init = {}) {
    return json(`${BASE}/admin/realms/${REALM}${path}`, {
        ...init,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
    });
}

async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

await scenario('SC-AUTH-1', 'Keycloak, its database and the mail catcher are healthy', async () => {
    const rows = docker(['ps', '-a', '--format', '{{.Service}} {{.State}} {{.Health}} {{.ExitCode}}'])
        .trim()
        .split('\n')
        .map((line) => line.split(' '));
    const byService = new Map(rows.map(([service, state, health, code]) => [service, { state, health, code }]));
    for (const service of ['keycloak', 'keycloak-db', 'mailpit']) {
        const row = byService.get(service);
        expect(row, `${service} is not raised`);
        expect(row.state === 'running' && row.health === 'healthy', `${service} is ${row.state} ${row.health}`);
    }
    const config = byService.get('keycloak-config');
    expect(
        config && config.state === 'exited' && config.code === '0',
        `the realm job is ${config?.state ?? 'absent'} with code ${config?.code}`
    );
});

await scenario('SC-AUTH-2', 'the discovery document names the realm issuer on the stand port', async () => {
    const { status, body } = await json(`${BASE}/realms/${REALM}/.well-known/openid-configuration`);
    expect(status === 200, `the discovery document answered ${status}`);
    expect(body.issuer === `${BASE}/realms/${REALM}`, `the issuer is ${body.issuer}`);
    expect(body.code_challenge_methods_supported?.includes('S256'), 'S256 is not among the challenge methods');
});

const token = await adminToken().catch(() => null);

await scenario('SC-AUTH-3', 'the example client is public, requires PKCE S256 and refuses the password grant', async () => {
    expect(token, 'no admin token');
    const { body } = await admin(token, `/clients?clientId=${CLIENT}`);
    const client = body?.[0];
    expect(client, `the realm has no client ${CLIENT}`);
    expect(client.publicClient === true, 'the client is not public');
    expect(client.directAccessGrantsEnabled === false, 'the client accepts the password grant by its setting');
    expect(client.attributes?.['pkce.code.challenge.method'] === 'S256', 'the client does not require PKCE S256');
    const grant = await json(`${BASE}/realms/${REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'password', client_id: CLIENT, username: 'nobody', password: 'nothing' }),
    });
    expect(grant.status === 400 || grant.status === 401, `the password grant answered ${grant.status}`);
    expect(
        grant.body?.error === 'unauthorized_client',
        `the password grant was refused as ${grant.body?.error}, not as a road the client does not have`
    );
});

await scenario('SC-AUTH-4', 'the realm sends a letter, and the mail catcher holds it', async () => {
    expect(token, 'no admin token');
    const email = `stand-check-${randomUUID()}@rt.localhost`;
    const created = await admin(token, '/users', {
        method: 'POST',
        body: JSON.stringify({ username: email, email, enabled: true, emailVerified: false }),
    });
    expect(created.status === 201, `the test user was refused with ${created.status}`);
    const { body: found } = await admin(token, `/users?email=${encodeURIComponent(email)}&exact=true`);
    const userId = found?.[0]?.id;
    try {
        expect(userId, 'the created user is not found');
        const sent = await admin(token, `/users/${userId}/execute-actions-email`, {
            method: 'PUT',
            body: JSON.stringify(['UPDATE_PASSWORD']),
        });
        expect(sent.status === 204, `the letter was refused with ${sent.status}`);
        let total = 0;
        for (let attempt = 0; attempt < 20 && total === 0; attempt += 1) {
            const { body } = await json(`${MAIL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
            total = body?.messages_count ?? 0;
            if (total === 0) {
                await sleep(250);
            }
        }
        expect(total === 1, `the mail catcher holds ${total} letters to the test user`);
    } finally {
        if (userId) {
            await admin(token, `/users/${userId}`, { method: 'DELETE' });
        }
    }
});

async function loginPage() {
    const query = new URLSearchParams({
        client_id: CLIENT,
        response_type: 'code',
        redirect_uri: 'http://localhost:4210/',
        scope: 'openid',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
    });
    const response = await fetch(`${BASE}/realms/${REALM}/protocol/openid-connect/auth?${query}`);
    return { status: response.status, page: await response.text() };
}

await scenario('SC-AUTH-25', 'the stand realm draws the login page with the theme rt', async () => {
    const { status, page } = await loginPage();
    expect(status === 200, `the login page answered ${status}`);
    expect(
        /<base href="[^"]*\/login\/rt\/dist\/"/.test(page),
        'the login page does not load the theme rt: is the theme JAR built and mounted?'
    );
});

// The value compose puts in place of a key the owner did not give
const UNSET_KEY = 'not-set';

await scenario('SC-AUTH-53', 'the entry page offers Google exactly when the stand holds the keys of the owner', async () => {
    expect(token, 'no admin token');
    const { status, body: provider } = await admin(token, '/identity-provider/instances/google');
    expect(status === 200, `the realm has no provider google: ${status}`);
    const keyed = provider.config?.clientId !== UNSET_KEY;
    expect(
        provider.enabled === keyed,
        `the provider is ${provider.enabled ? 'on' : 'off'} while the keys are ${keyed ? 'given' : 'absent'}`
    );
    const { page } = await loginPage();
    const offered = /"alias":\s*"google"/.test(page);
    expect(
        offered === keyed,
        `the entry page ${offered ? 'offers' : 'does not offer'} Google while the keys are ${keyed ? 'given' : 'absent'}`
    );
});

await scenario('SC-AUTH-5', 'a second raising applies the realm file over a running stand', async () => {
    expect(token, 'no admin token');
    const drift = `drift-${randomUUID().slice(0, 8)}`;
    const edited = await admin(token, '', { method: 'PUT', body: JSON.stringify({ displayName: drift }) });
    expect(edited.status === 204, `the realm edit was refused with ${edited.status}`);
    const { body: before } = await admin(token, '');
    expect(before.displayName === drift, 'the realm edit did not land');
    docker(['run', '--rm', 'keycloak-config']);
    const fresh = await adminToken();
    const { body: after } = await admin(fresh, '');
    expect(after.displayName === DISPLAY_NAME, `after the second raising the realm is named ${after.displayName}`);
});

await scenario('SC-AUTH-46', 'the import moves argon2 and pbkdf2 with their passwords and scrypt without one', async () => {
    expect(token, 'no admin token');
    const tag = randomUUID().slice(0, 8);
    const password = `Old-${tag}-pass`;
    const salt = randomBytes(16);
    const unpadded = (bytes) => bytes.toString('base64').replace(/=+$/, '');
    const people = {
        argon2: `import-argon2-${tag}@stand.test`,
        pbkdf2: `import-pbkdf2-${tag}@stand.test`,
        scrypt: `import-scrypt-${tag}@stand.test`,
    };
    const file = [
        {
            email: people.argon2,
            firstName: 'Argon',
            emailVerified: true,
            lastName: 'Stand',
            passwordHash: await argon2id({
                password,
                salt,
                iterations: 3,
                memorySize: 19456,
                parallelism: 1,
                hashLength: 32,
                outputType: 'encoded',
            }),
            roles: { [CLIENT]: ['example:read'] },
        },
        {
            email: people.pbkdf2,
            firstName: 'Pbkdf',
            emailVerified: true,
            lastName: 'Stand',
            passwordHash: `$pbkdf2-sha256$i=27500,l=32$${unpadded(salt)}$${unpadded(pbkdf2Sync(password, salt, 27500, 32, 'sha256'))}`,
        },
        {
            email: people.scrypt,
            firstName: 'Scrypt',
            emailVerified: true,
            lastName: 'Stand',
            passwordHash: `$scrypt$ln=14,r=8,p=1$${unpadded(salt)}$${unpadded(scryptSync(password, salt, 32))}`,
        },
    ];
    const dir = mkdtempSync(join(tmpdir(), 'rt-auth-import-'));
    try {
        writeFileSync(join(dir, 'users.json'), JSON.stringify(file));
        execFileSync(
            'node',
            [IMPORT_BIN, '--url', BASE, '--realm', REALM, '--client-id', IMPORT_CLIENT, '--file', join(dir, 'users.json')],
            {
                env: { ...process.env, RT_AUTH_IMPORT_CLIENT_SECRET: IMPORT_SECRET },
                stdio: ['ignore', 'pipe', 'pipe'],
            }
        );
        const signIn = async (username) =>
            json(`${BASE}/realms/${REALM}/protocol/openid-connect/token`, {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ grant_type: 'password', client_id: 'admin-cli', username, password }),
            });
        for (const kept of [people.argon2, people.pbkdf2]) {
            const { status, body } = await signIn(kept);
            expect(status === 200, `${kept} did not enter with the old password: ${status} ${body?.error_description ?? ''}`);
        }
        const [scrypt] = (await admin(token, `/users?username=${encodeURIComponent(people.scrypt)}&exact=true`)).body;
        expect(scrypt?.requiredActions?.includes('UPDATE_PASSWORD'), `${people.scrypt} is not asked to set a password`);
        expect((await signIn(people.scrypt)).status !== 200, `${people.scrypt} entered with the old password`);
    } finally {
        rmSync(dir, { recursive: true, force: true });
        for (const username of Object.values(people)) {
            for (const user of (await admin(token, `/users?username=${encodeURIComponent(username)}&exact=true`)).body ?? []) {
                await admin(token, `/users/${user.id}`, { method: 'DELETE' });
            }
        }
    }
});

for (const result of results) {
    console.log(result.line);
}
process.exitCode = results.every((result) => result.ok) ? 0 : 1;
