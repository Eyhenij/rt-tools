#!/usr/bin/env node
/**
 * The production realm `rt`, built from the stand realm file.
 *
 * One file describes the realm, so a client or a role added for the stand reaches production by
 * the same edit. What differs in production is changed here and nowhere else:
 *
 * - the example admin does not exist in production;
 * - the bus admin answers on the production origin only, no local address stays in it;
 * - the secrets of the service clients and the mail are placeholders `$(env:…)`: keycloak-config-cli
 *   substitutes them on the node from its environment, so no secret passes the repository or CI;
 * - a confirmed address is demanded only when the node has mail.
 *
 *   node tools/auth-realm-prod.mjs --bus-origin https://message-bus.dev > realm/rt.json
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STAND = join(ROOT, 'deploy/auth/realm/rt.json');

/** Clients that live only on the stand. */
const STAND_ONLY = new Set(['rt-example-admin']);

/** The service clients and the environment variable each secret is taken from on the node. */
export const SECRETS = Object.freeze({
    'rt-user-import': 'RT_USER_IMPORT_SECRET',
    'rt-catalog-sync': 'RT_CATALOG_SYNC_SECRET',
    'rt-cargo-tools': 'RT_CARGO_TOOLS_SECRET',
});

const env = (name) => `$(env:${name})`;

/** The production realm from the stand one. Throws when a service client has no named secret. */
export function prodRealm(stand, { busOrigin }) {
    if (!/^https:\/\/[^/]+$/.test(busOrigin ?? '')) {
        throw new Error(`the bus origin must be https://<host> without a path, got «${busOrigin}»`);
    }

    const realm = structuredClone(stand);

    realm.clients = realm.clients
        .filter((client) => !STAND_ONLY.has(client.clientId))
        .map((client) => {
            if (client.clientId === 'rt-message-bus-admin') {
                return {
                    ...client,
                    redirectUris: [`${busOrigin}/*`],
                    webOrigins: [busOrigin],
                    attributes: { ...client.attributes, 'post.logout.redirect.uris': `${busOrigin}/*` },
                };
            }

            if (client.publicClient === false) {
                const name = SECRETS[client.clientId];

                if (!name) {
                    throw new Error(`the service client ${client.clientId} has no secret variable in tools/auth-realm-prod.mjs`);
                }

                return { ...client, secret: env(name) };
            }

            return client;
        });

    // The roles of a stand client go with it: the realm apply refuses a role of a missing client.
    if (realm.roles?.client) {
        realm.roles.client = Object.fromEntries(Object.entries(realm.roles.client).filter(([clientId]) => !STAND_ONLY.has(clientId)));
    }

    realm.verifyEmail = env('RT_VERIFY_EMAIL');
    realm.smtpServer = {
        host: env('RT_SMTP_HOST'),
        port: env('RT_SMTP_PORT'),
        from: env('RT_SMTP_FROM'),
        fromDisplayName: 'RT',
        auth: 'true',
        user: env('RT_SMTP_USER'),
        password: env('RT_SMTP_PASSWORD'),
        ssl: 'true',
        starttls: 'false',
    };

    return realm;
}

function argOf(name) {
    const at = process.argv.indexOf(name);

    return at === -1 ? undefined : process.argv[at + 1];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    try {
        const realm = prodRealm(JSON.parse(readFileSync(STAND, 'utf8')), { busOrigin: argOf('--bus-origin') });

        process.stdout.write(`${JSON.stringify(realm, null, 2)}\n`);
    } catch (error) {
        process.stderr.write(`auth-realm-prod: ${error.message}\n`);
        process.exit(1);
    }
}
