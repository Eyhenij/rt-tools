#!/usr/bin/env node
/**
 * The transfer of the bus people to Keycloak.
 *
 *   node tools/bus-people-transfer.mjs export
 *   node tools/bus-people-transfer.mjs rekey --url <keycloak> --realm <realm> --client-id <client> [--apply]
 *
 * `export` runs before the deploy of the epic: after its migration production has no tables of
 * people. It reads them over ssh, read only, takes the addresses from the address book and writes
 * the file for `rt-auth-import` and the key map. `rekey` runs after the import and the deploy: it
 * finds the Keycloak key of each person by address and gives it to the chat operators. Without
 * `--apply` it prints the statement and changes nothing.
 *
 * Every file lies in `~/.config/rt-bus-transfer/`, outside the repository: they hold addresses.
 * The secret of the import client comes from `RT_AUTH_IMPORT_CLIENT_SECRET`, as for `rt-auth-import`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { busRights, rekeySql, transferOf } from './bus-people-transfer.lib.mjs';

const DIR = join(homedir(), '.config', 'rt-bus-transfer');
const ADDRESSES = join(DIR, 'addresses.json');
const PEOPLE = join(DIR, 'people.json');
const KEYS = join(DIR, 'keys.json');

const HOST = 'message-bus';
const PSQL =
    'cd /opt/message-bus && docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db ' +
    `sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -v ON_ERROR_STOP=1'`;

/** The accounts of production with their role and edits, as one JSON list. */
const ACCOUNTS_SQL = `
SELECT coalesce(json_agg(json_build_object(
    'id', a."id",
    'name', a."name",
    'disabled', a."disabledAt" IS NOT NULL,
    'roleRights', r."rights",
    'edits', (SELECT coalesce(json_agg(json_build_object('right', p."right", 'granted', p."granted")), '[]'::json)
              FROM "account_permission" p WHERE p."accountId" = a."id")
) ORDER BY a."name"), '[]'::json)
FROM "account" a LEFT JOIN "role" r ON r."id" = a."roleId";
`;

/** Sends a statement to the production storage over ssh and answers with what psql printed. */
function psql(statement) {
    return execFileSync('ssh', [HOST, PSQL], { input: statement, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
}

/** The people of production. Read only: the statement is one SELECT. */
export function readProduction() {
    return JSON.parse(psql(ACCOUNTS_SQL).trim());
}

function readJson(file, what) {
    if (!existsSync(file)) {
        throw new Error(`${what} is not found: ${file}`);
    }
    return JSON.parse(readFileSync(file, 'utf8'));
}

function runExport() {
    const addresses = Object.fromEntries(
        Object.entries(readJson(ADDRESSES, 'the address book')).map(([name, email]) => [name.trim().toLowerCase(), email])
    );
    const { people, keys, left } = transferOf(readProduction(), addresses, busRights());

    mkdirSync(DIR, { recursive: true, mode: 0o700 });
    writeFileSync(PEOPLE, `${JSON.stringify(people, null, 4)}\n`, { mode: 0o600 });
    writeFileSync(KEYS, `${JSON.stringify(keys, null, 4)}\n`, { mode: 0o600 });

    console.log(`people to move: ${people.length} → ${PEOPLE}`);
    people.forEach((person) => console.log(`  ${person.email}: ${Object.values(person.roles)[0].join(', ') || 'no rights'}`));
    left.forEach((account) => console.log(`left behind: ${account.name} — ${account.reason}`));
    console.log(`the key map → ${KEYS}`);
    console.log(`next: rt-auth-import --url <keycloak> --realm <realm> --client-id <client> --file ${PEOPLE}`);
}

function flag(args, name) {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
}

async function keycloakKeys(url, realm, clientId, emails) {
    const secret = process.env.RT_AUTH_IMPORT_CLIENT_SECRET;
    if (!secret) {
        throw new Error('RT_AUTH_IMPORT_CLIENT_SECRET is not set');
    }
    const tokenAnswer = await fetch(`${url}/realms/${realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: secret }),
    });
    if (!tokenAnswer.ok) {
        throw new Error(`Keycloak refused the token of ${clientId}: ${tokenAnswer.status}`);
    }
    const { access_token: token } = await tokenAnswer.json();

    const found = new Map();
    for (const email of emails) {
        const answer = await fetch(`${url}/admin/realms/${realm}/users?exact=true&email=${encodeURIComponent(email)}`, {
            headers: { authorization: `Bearer ${token}` },
        });
        if (!answer.ok) {
            throw new Error(`Keycloak refused the search of ${email}: ${answer.status}`);
        }
        const [person] = await answer.json();
        if (person) {
            found.set(email, person.id);
        }
    }
    return found;
}

async function runRekey(args) {
    const url = flag(args, '--url');
    const realm = flag(args, '--realm');
    const clientId = flag(args, '--client-id');
    if (!url || !realm || !clientId) {
        throw new Error('rekey needs --url, --realm and --client-id');
    }
    const keys = readJson(KEYS, 'the key map');
    const statement = rekeySql(
        keys,
        await keycloakKeys(
            url.replace(/\/$/, ''),
            realm,
            clientId,
            keys.map((key) => key.email)
        )
    );

    if (!args.includes('--apply')) {
        console.log(statement);
        console.log('nothing is changed: add --apply to run it in production');
        return;
    }
    console.log(psql(statement).trim());
    console.log(`the operators of ${keys.length} people now name their Keycloak keys`);
}

async function main() {
    const [verb, ...args] = process.argv.slice(2);
    if (verb === 'export') {
        runExport();
    } else if (verb === 'rekey') {
        await runRekey(args);
    } else {
        throw new Error('usage: bus-people-transfer.mjs export | rekey --url <keycloak> --realm <realm> --client-id <client> [--apply]');
    }
}

main().catch((error) => {
    console.error(`refused: ${error.message}`);
    process.exit(1);
});
