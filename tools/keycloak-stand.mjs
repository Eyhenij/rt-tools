/**
 * The people of a stand in the local Keycloak: one seeding for every end-to-end suite of an admin.
 *
 * Every run removes the people of the stand and creates them anew. A person carries the failed
 * entries of past runs — the realm guards against guessing — and a state left from yesterday would
 * make a spec about a wrong password depend on how many runs came before it.
 *
 * The seeding goes through the admin API of Keycloak as the master administrator of the local
 * stand. A person gets a name, a verified address and no required actions: without them Keycloak
 * asks for the missing fields after the password, and the entry stops on a screen no suite checks.
 */

/** The master administrator of the local stand, the value of its compose file. */
const MASTER_LOGIN = Object.freeze({ username: 'admin', secret: 'admin' });

async function masterToken(origin) {
    const response = await fetch(`${origin}/realms/master/protocol/openid-connect/token`, {
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

function caller(api, token) {
    return async (path, init = {}) => {
        const response = await fetch(`${api}${path}`, {
            ...init,
            headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...init.headers },
        });

        if (!response.ok) {
            throw new Error(`${init.method ?? 'GET'} ${path} — ${response.status} ${await response.text()}`);
        }

        const text = await response.text();

        return text ? JSON.parse(text) : null;
    };
}

/**
 * Creates the people anew with their rights as roles of the client and answers with the Keycloak id
 * of each by the address. A person with `enabled: false` is created switched off.
 *
 * @param {{ origin: string, realm: string, clientId: string, password: string,
 *   people: readonly { email: string, firstName: string, lastName: string, rights: readonly string[], enabled?: boolean }[] }} stand
 * @returns {Promise<Map<string, string>>}
 */
export async function seedRealmPeople(stand) {
    const call = caller(`${stand.origin}/admin/realms/${stand.realm}`, await masterToken(stand.origin));
    const [client] = await call(`/clients?clientId=${stand.clientId}`);

    if (!client) {
        throw new Error(`the realm has no client ${stand.clientId}: was the stand raised by \`pnpm run serve:auth\`?`);
    }

    const ids = new Map();

    for (const person of stand.people) {
        for (const user of await call(`/users?email=${encodeURIComponent(person.email)}&exact=true`)) {
            await call(`/users/${user.id}`, { method: 'DELETE' });
        }

        await call('/users', {
            method: 'POST',
            body: JSON.stringify({
                username: person.email,
                email: person.email,
                firstName: person.firstName,
                lastName: person.lastName,
                enabled: person.enabled ?? true,
                emailVerified: true,
                requiredActions: [],
                credentials: [{ type: 'password', value: stand.password, temporary: false }],
            }),
        });

        const [user] = await call(`/users?email=${encodeURIComponent(person.email)}&exact=true`);

        if (person.rights.length) {
            const roles = await Promise.all(person.rights.map((right) => call(`/clients/${client.id}/roles/${encodeURIComponent(right)}`)));
            await call(`/users/${user.id}/role-mappings/clients/${client.id}`, { method: 'POST', body: JSON.stringify(roles) });
        }

        ids.set(person.email, user.id);
    }

    return ids;
}
