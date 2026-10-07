/**
 * The sign-in of the cargo commands: the token of the service client of Keycloak.
 *
 * The intake checks Keycloak tokens only. A command has no person behind it, so it signs in by
 * its own confidential client, whose service account holds the roles of the bus client. Where to
 * ask for the token the command learns from the intake itself — the same open operation the admin
 * panel asks at start — so the address of Keycloak lies in one place.
 *
 * The client's pair lies outside the repository as two lines: the client id and the secret. The
 * path to it is named by the key `account` in `.claude/rt-kit.json`; `RT_CARGO_CLIENT_ID` and
 * `RT_CARGO_CLIENT_SECRET` override it.
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const TIMEOUT_MS = 15_000;

/** What the refusal says when there is no pair: where it lies and where the client is created. */
export const NO_PAIR = [
    'it lies outside the repository as two lines — the client id and the secret — and the path to it is named by the key `account` in `.claude/rt-kit.json`',
    'the client itself is created in Keycloak with a service account holding the roles of the bus client',
];

/**
 * The client's pair: the environment first, then the file named by the settings.
 *
 * Two lines rather than one with a separator: a secret may hold any character, and a separator met
 * inside it would cut the pair silently.
 */
export function accountOf(where, root = process.cwd(), env = process.env) {
    let named = { name: '', password: '' };

    if (where) {
        const path = where.startsWith('~') ? join(homedir(), where.slice(1)) : resolve(root, where);

        if (existsSync(path)) {
            const lines = readFileSync(path, 'utf8').split('\n');
            named = { name: (lines[0] ?? '').trim(), password: (lines[1] ?? '').trim() };
        }
    }

    return { name: env.RT_CARGO_CLIENT_ID || named.name, password: env.RT_CARGO_CLIENT_SECRET || named.password };
}

/** What the answer said in words: the message from the answer, and for an unreadable one the answer itself. */
export function saidOf(text) {
    try {
        const said = JSON.parse(text);

        return typeof said.message === 'string'
            ? said.message
            : typeof said.error_description === 'string'
              ? said.error_description
              : text.trim();
    } catch {
        return text.trim();
    }
}

async function ask(url, init) {
    try {
        const answer = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

        return { ok: answer.ok, status: answer.status, text: await answer.text() };
    } catch (error) {
        return { ok: false, status: 0, text: error.message };
    }
}

/**
 * The sign-in: where Keycloak is, then the token of the client. A refusal is as much an answer as an
 * accepted one, and it names which of the two steps refused.
 */
export async function login(intake, account) {
    const settings = await ask(`${intake.replace(/\/+$/, '')}/api/auth/settings`, {});

    if (!settings.ok) {
        return {
            ok: false,
            status: settings.status,
            said: `the intake did not name where to sign in: ${saidOf(settings.text)}`,
            token: '',
        };
    }

    const { url, realm } = JSON.parse(settings.text);
    const issued = await ask(`${String(url).replace(/\/+$/, '')}/realms/${realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: account.name, client_secret: account.password }),
    });

    if (!issued.ok) {
        return { ok: false, status: issued.status, said: `Keycloak did not issue the token: ${saidOf(issued.text)}`, token: '' };
    }

    return { ok: true, status: issued.status, said: '', token: JSON.parse(issued.text).access_token ?? '' };
}

/** The header a signed-in request carries. */
export function signedIn(token) {
    return { authorization: `Bearer ${token}` };
}
