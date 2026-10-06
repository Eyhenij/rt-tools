import { IImportUser, IKeycloakUser, keycloakUserOf, NEW_CREDENTIAL_ACTION } from './import-user.js';
import { IClientRole, IRealmClient, KeycloakAdmin } from './keycloak-admin.js';

/** How the import runs. */
export interface IImportOptions {
    /** Whether the people added without a password get the Keycloak letter to set one. */
    readonly sendActionsEmail: boolean;
}

/** What the import did, by address. */
export interface IImportReport {
    readonly added: readonly string[];
    readonly skipped: readonly string[];
    /** The added people who must set a password. */
    readonly withoutPassword: readonly string[];
    /** The people who got the letter. */
    readonly emailed: readonly string[];
}

/** The clients the file names, read once; `null` stands for a client the realm does not have. */
export type TRealmClients = ReadonlyMap<string, IRealmClient | null>;

/** Reads every client the file names. */
export async function realmClients(users: readonly IImportUser[], admin: KeycloakAdmin): Promise<TRealmClients> {
    const clients: Map<string, IRealmClient | null> = new Map<string, IRealmClient | null>();
    for (const clientId of new Set<string>(users.flatMap((user: IImportUser): string[] => Object.keys(user.roles ?? {})))) {
        clients.set(clientId, await admin.client(clientId));
    }
    return clients;
}

/**
 * The roles of the file that their clients do not have, a line each. They are named before the
 * first write: otherwise part of the people would move and the rest would not.
 */
export function unknownRoles(users: readonly IImportUser[], clients: TRealmClients): string[] {
    const problems: string[] = [];
    for (const user of users) {
        for (const [clientId, roles] of Object.entries(user.roles ?? {})) {
            const client: IRealmClient | null | undefined = clients.get(clientId);
            if (client === null || client === undefined) {
                problems.push(`${user.email}: the realm has no client "${clientId}"`);
                continue;
            }
            for (const role of roles.filter((name: string): boolean => !client.roles.has(name))) {
                problems.push(`${user.email}: the client "${clientId}" has no role "${role}"`);
            }
        }
    }
    return problems;
}

async function grantRoles(userId: string, user: IImportUser, clients: TRealmClients, admin: KeycloakAdmin): Promise<void> {
    for (const [clientId, names] of Object.entries(user.roles ?? {})) {
        const client: IRealmClient | null | undefined = clients.get(clientId);
        const roles: IClientRole[] = names.flatMap((name: string): IClientRole[] => {
            const role: IClientRole | undefined = client?.roles.get(name);
            return role === undefined ? [] : [role];
        });
        if (client !== null && client !== undefined && roles.length > 0) {
            await admin.addClientRoles(userId, client, roles);
        }
    }
}

/**
 * Moves the people into the realm one by one and gives them their rights. A person already there
 * is skipped. The letter to set a password goes only by the flag and only to the people added by
 * this run: a second run skips them and sends nothing twice.
 */
export async function importUsers(
    users: readonly IImportUser[],
    admin: KeycloakAdmin,
    clients: TRealmClients,
    options: IImportOptions
): Promise<IImportReport> {
    const report: { added: string[]; skipped: string[]; withoutPassword: string[]; emailed: string[] } = {
        added: [],
        skipped: [],
        withoutPassword: [],
        emailed: [],
    };
    for (const user of users) {
        const person: IKeycloakUser = keycloakUserOf(user);
        const id: string | null = await admin.createUser(person);
        if (id === null) {
            report.skipped.push(person.username);
            continue;
        }
        report.added.push(person.username);
        await grantRoles(id, user, clients, admin);
        if (person.requiredActions.includes(NEW_CREDENTIAL_ACTION)) {
            report.withoutPassword.push(person.username);
            if (options.sendActionsEmail) {
                await admin.executeActionsEmail(id, [NEW_CREDENTIAL_ACTION]);
                report.emailed.push(person.username);
            }
        }
    }
    return report;
}
