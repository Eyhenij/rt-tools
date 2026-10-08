/**
 * The pure part of the transfer of the bus people to Keycloak: what a person carries, who stays
 * behind and how the operator column is rewritten.
 *
 * Kept apart from the command so that the decisions are checked by a call: the command only reads
 * production, the address book and Keycloak, and writes what comes out of here.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The client of the bus in the realm: its client roles are the rights of a person. */
export const BUS_CLIENT = 'rt-message-bus-admin';

/** The service sign-in of the cargo commands. It is not a person and gets a service client instead. */
export const SERVICE_ACCOUNTS = Object.freeze(['cargo-triage']);

const RIGHTS_FILE = join(dirname(fileURLToPath(import.meta.url)), '../libs/message-bus-common/src/lib/rights.ts');

/**
 * The closed set of rights, read from the file that declares it.
 *
 * A second list here would drift from the declaration silently: the bus would gain a right and the
 * transfer would drop it as unknown.
 */
export function busRights(source = readFileSync(RIGHTS_FILE, 'utf8')) {
    const block = /export const RIGHTS[^=]*=\s*Object\.freeze\(\[([\s\S]*?)\]/.exec(source);
    if (!block) {
        throw new Error(`the set of rights is not found in ${RIGHTS_FILE}`);
    }
    return new Set([...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]));
}

/** The key an account is looked up by in the address book: the name brought to one form. */
export function nameKey(name) {
    return name.trim().toLowerCase();
}

/**
 * The rights of a person: the rights of their role with their edits over it.
 *
 * A name outside the set — a typo or a right that left the bus — is dropped on both sides.
 */
export function rightsOf(roleRights, edits, set) {
    const rights = new Set((roleRights ?? []).filter((right) => set.has(right)));
    for (const edit of edits ?? []) {
        if (!set.has(edit.right)) {
            continue;
        }
        if (edit.granted) {
            rights.add(edit.right);
        } else {
            rights.delete(edit.right);
        }
    }
    return [...rights].sort();
}

/**
 * The transfer file, the key map and the report of who stayed behind.
 *
 * `accounts` are the rows of production: `{ id, name, disabled, roleRights, edits }`. `addresses`
 * maps the brought-to name of an account to its address. An account without an address refuses
 * the whole export: a file without one person looks complete.
 */
export function transferOf(accounts, addresses, set) {
    const people = [];
    const keys = [];
    const left = [];
    const missing = [];

    for (const account of accounts) {
        if (SERVICE_ACCOUNTS.includes(nameKey(account.name))) {
            left.push({ name: account.name, reason: 'the service account of the cargo commands' });
            continue;
        }
        if (account.disabled) {
            left.push({ name: account.name, reason: 'disabled' });
            continue;
        }
        const email = addresses[nameKey(account.name)]?.trim().toLowerCase();
        if (!email) {
            missing.push(account.name);
            continue;
        }
        people.push({ email, emailVerified: true, roles: { [BUS_CLIENT]: rightsOf(account.roleRights, account.edits, set) } });
        keys.push({ id: account.id, email });
    }

    if (missing.length) {
        throw new Error(`the address book names no address for: ${missing.join(', ')}`);
    }
    return { people, keys, left };
}

/**
 * The statement that gives each operator the Keycloak key of the same person.
 *
 * `found` maps an address to the Keycloak key. An address the realm did not answer refuses the
 * whole rewrite: a half-rewritten column leaves some operators without their sites.
 */
export function rekeySql(keys, found) {
    const unknown = keys.filter((key) => !found.get(key.email)).map((key) => key.email);
    if (unknown.length) {
        throw new Error(`the realm knows no person with the address: ${unknown.join(', ')}`);
    }
    const quoted = (value) => `'${String(value).replaceAll("'", "''")}'`;
    const updates = keys.map(
        (key) => `UPDATE "chat_operator" SET "personId" = ${quoted(found.get(key.email))} WHERE "personId" = ${quoted(key.id)};`
    );
    return ['BEGIN;', ...updates, 'COMMIT;'].join('\n');
}

/**
 * The report of the rewrite, read from what `psql` answered: the sum of the `UPDATE n` lines. Zero
 * rows is no error — a repeated run changes nothing — but it is named, not reported as success.
 */
export function rekeyReport(answer, people) {
    const rows = [...String(answer).matchAll(/^UPDATE (\d+)$/gm)].reduce((sum, [, count]) => sum + Number(count), 0);
    if (rows === 0) {
        return `nothing is rewritten: no operator carried the old key of any of ${people} people — they already name their Keycloak keys, or the column holds other keys`;
    }
    return `${rows} operators of ${people} people now name their Keycloak keys`;
}
