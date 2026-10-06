/**
 * The seeding of the realm: the people of the stand with their rights in the example client.
 *
 * Every run removes the people of the stand and creates them anew. A person carries the failed
 * entries of past runs — the realm guards against guessing — and a state left from yesterday would
 * make a spec about a wrong password depend on how many runs came before it.
 *
 * The seeding goes through the admin API of Keycloak as the master administrator of the local
 * stand. A person gets a name, a verified address and no required actions: without them Keycloak
 * asks for the missing fields after the password, and the entry stops on a screen the suite does
 * not check.
 */
import { CLIENT, KEYCLOAK_ORIGIN, PEOPLE, REALM, STAND_PASSWORD } from './stand.mjs';

/** The master administrator of the local stand, the value of its compose file. */
const MASTER_LOGIN = Object.freeze({ username: 'admin', secret: 'admin' });

const ADMIN_API = `${KEYCLOAK_ORIGIN}/admin/realms/${REALM}`;

async function masterToken() {
    const response = await fetch(`${KEYCLOAK_ORIGIN}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'password',
            client_id: 'admin-cli',
            username: MASTER_LOGIN.username,
            password: MASTER_LOGIN.secret,
        }),
    });
    if (!response.ok) {
        throw new Error(`the master administrator of the stand did not enter: ${response.status}`);
    }
    return (await response.json()).access_token;
}

async function call(token, path, init = {}) {
    const response = await fetch(`${ADMIN_API}${path}`, {
        ...init,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...init.headers },
    });
    if (!response.ok) {
        throw new Error(`${init.method ?? 'GET'} ${path} — ${response.status} ${await response.text()}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

async function removePerson(token, email) {
    const found = await call(token, `/users?email=${encodeURIComponent(email)}&exact=true`);
    for (const user of found) {
        await call(token, `/users/${user.id}`, { method: 'DELETE' });
    }
}

async function createPerson(token, person, clientId) {
    await call(token, '/users', {
        method: 'POST',
        body: JSON.stringify({
            username: person.email,
            email: person.email,
            firstName: person.firstName,
            lastName: person.lastName,
            enabled: true,
            emailVerified: true,
            requiredActions: [],
            credentials: [{ type: 'password', value: STAND_PASSWORD, temporary: false }],
        }),
    });
    const [user] = await call(token, `/users?email=${encodeURIComponent(person.email)}&exact=true`);
    if (person.rights.length) {
        const roles = await Promise.all(
            person.rights.map((right) => call(token, `/clients/${clientId}/roles/${encodeURIComponent(right)}`))
        );
        await call(token, `/users/${user.id}/role-mappings/clients/${clientId}`, { method: 'POST', body: JSON.stringify(roles) });
    }
}

/** Recreates the people of the stand. */
export async function seed() {
    const token = await masterToken();
    const [client] = await call(token, `/clients?clientId=${CLIENT}`);
    if (!client) {
        throw new Error(`the realm has no client ${CLIENT}: was the stand raised by \`pnpm run serve:auth\`?`);
    }
    for (const person of Object.values(PEOPLE)) {
        await removePerson(token, person.email);
        await createPerson(token, person, client.id);
    }
}
