import { parseArgs } from 'node:util';

import { IReadUsers, readUsers } from './lib/import-user.js';
import { IImportReport, importUsers, realmClients, TRealmClients, unknownRoles } from './lib/import-users.js';
import { KeycloakAdmin } from './lib/keycloak-admin.js';

/** The environment variable with the secret of the import client: an argument stays in the history. */
export const SECRET_VARIABLE: string = 'RT_AUTH_IMPORT_CLIENT_SECRET';

/** What the command reads and writes; a test puts doubles in place of the file and the terminal. */
export interface ICliIo {
    readonly readFile: (path: string) => Promise<string>;
    readonly fetch: typeof fetch;
    readonly out: (line: string) => void;
    readonly err: (line: string) => void;
}

const USAGE: string = `Usage: rt-auth-import --url <keycloak> --realm <realm> --client-id <import client> --file <users.json> [--send-actions-email]
The secret of the import client is read from ${SECRET_VARIABLE}.`;

function printReport(report: IImportReport, io: ICliIo): void {
    io.out(`added ${report.added.length}, skipped as already in the realm ${report.skipped.length}`);
    io.out(`must set a password ${report.withoutPassword.length}, got the letter ${report.emailed.length}`);
    for (const email of report.withoutPassword) {
        io.out(`  without a password: ${email}`);
    }
}

/** Runs the command and returns its exit code. */
export async function run(argv: readonly string[], env: Readonly<Record<string, string | undefined>>, io: ICliIo): Promise<number> {
    const { values } = parseArgs({
        args: [...argv],
        strict: true,
        options: {
            url: { type: 'string' },
            realm: { type: 'string' },
            'client-id': { type: 'string' },
            file: { type: 'string' },
            'send-actions-email': { type: 'boolean', default: false },
        },
    });
    const { url, realm, file } = values;
    const clientId: string | undefined = values['client-id'];
    const secret: string | undefined = env[SECRET_VARIABLE];
    if (typeof url !== 'string' || typeof realm !== 'string' || typeof clientId !== 'string' || typeof file !== 'string') {
        io.err(USAGE);
        return 1;
    }
    if (secret === undefined || secret === '') {
        io.err(`The secret of the import client is not set: put it in ${SECRET_VARIABLE}.`);
        return 1;
    }
    const read: IReadUsers = readUsers(JSON.parse(await io.readFile(file)));
    const admin: KeycloakAdmin = new KeycloakAdmin({
        realm,
        clientId,
        url: url.endsWith('/') ? url.slice(0, -1) : url,
        clientSecret: secret,
        fetch: io.fetch,
    });
    const clients: TRealmClients = await realmClients(read.users, admin);
    const problems: string[] = [...read.problems, ...unknownRoles(read.users, clients)];
    if (problems.length > 0) {
        io.err(`The file is refused, nothing was written to Keycloak:`);
        problems.forEach((problem: string): void => io.err(`  ${problem}`));
        return 1;
    }
    printReport(await importUsers(read.users, admin, clients, { sendActionsEmail: values['send-actions-email'] }), io);
    return 0;
}
