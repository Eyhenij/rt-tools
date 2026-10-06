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
 * The check leaves the stand as it found it: the test user is removed, and the realm field edited
 * to check the second raising is restored by that very raising.
 */
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPOSE = ['compose', '-f', join(ROOT, 'deploy/auth/compose.yml')];
const BASE = 'http://localhost:58080';
const MAIL = 'http://localhost:58025';
const REALM = 'rt';
const CLIENT = 'rt-example-admin';
const DISPLAY_NAME = 'RT';

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

await scenario('SC-AUTH-25', 'the stand realm draws the login page with the theme rt', async () => {
    const query = new URLSearchParams({
        client_id: CLIENT,
        response_type: 'code',
        redirect_uri: 'http://localhost:4210/',
        scope: 'openid',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
    });
    const response = await fetch(`${BASE}/realms/${REALM}/protocol/openid-connect/auth?${query}`);
    const page = await response.text();
    expect(response.status === 200, `the login page answered ${response.status}`);
    expect(
        /<base href="[^"]*\/login\/rt\/dist\/"/.test(page),
        'the login page does not load the theme rt: is the theme JAR built and mounted?'
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

for (const result of results) {
    console.log(result.line);
}
process.exitCode = results.every((result) => result.ok) ? 0 : 1;
