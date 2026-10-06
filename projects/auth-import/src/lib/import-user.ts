import { credentialOf, IKeycloakCredential, IPasswordParts } from './password-hash.js';

/** One person of the file of users. */
export interface IImportUser {
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly emailVerified?: boolean;
    /** A hash in PHC: `$argon2id$…`, `$pbkdf2-sha256$…`; any other is kept out. */
    readonly passwordHash?: string;
    /** A pbkdf2 hash given part by part, for an application that keeps it in its own form. */
    readonly password?: IPasswordParts;
    /** The rights by client: `{ "orders-admin": ["orders:read"] }`. */
    readonly roles?: Readonly<Record<string, readonly string[]>>;
}

/** A person the way the users API of Keycloak takes it; the rights go by a role mapping after it. */
export interface IKeycloakUser {
    readonly username: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly emailVerified: boolean;
    readonly enabled: true;
    readonly credentials: readonly IKeycloakCredential[];
    readonly requiredActions: readonly string[];
}

/** The read file: the people without errors and a line for each error. */
export interface IReadUsers {
    readonly users: readonly IImportUser[];
    readonly problems: readonly string[];
}

/** The Keycloak required action that makes a person set a new password on the next entry. */
export const NEW_CREDENTIAL_ACTION: string = 'UPDATE_PASSWORD';

const EMAIL: RegExp = /^[^\s@]+@[^\s@]+$/;

/**
 * The person for Keycloak. A hash Keycloak verifies moves as it is; with any other hash or without
 * one the person moves without a password and must set one on the first entry.
 */
export function keycloakUserOf(user: IImportUser): IKeycloakUser {
    const kept: IKeycloakCredential | null = credentialOf(user.password ?? user.passwordHash);
    const email: string = user.email.toLowerCase();
    return {
        username: email,
        email,
        ...(user.firstName === undefined ? {} : { firstName: user.firstName }),
        ...(user.lastName === undefined ? {} : { lastName: user.lastName }),
        emailVerified: user.emailVerified === true,
        enabled: true,
        credentials: kept === null ? [] : [kept],
        requiredActions: kept === null ? [NEW_CREDENTIAL_ACTION] : [],
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item: unknown): boolean => typeof item === 'string');
}

function rolesProblem(roles: unknown): string | null {
    if (roles === undefined) {
        return null;
    }
    if (!isRecord(roles) || !Object.values(roles).every(isStringList)) {
        return '"roles" must map a client to a list of role names';
    }
    return null;
}

function entryProblems(entry: unknown): string[] {
    if (!isRecord(entry)) {
        return ['the entry is not an object'];
    }
    const problems: string[] = [];
    if (typeof entry['email'] !== 'string' || !EMAIL.test(entry['email'])) {
        problems.push('"email" is missing or is not an address');
    }
    for (const field of ['firstName', 'lastName', 'passwordHash']) {
        if (entry[field] !== undefined && typeof entry[field] !== 'string') {
            problems.push(`"${field}" must be a string`);
        }
    }
    if (entry['password'] !== undefined && credentialOf(entry['password'] as IPasswordParts) === null) {
        problems.push('"password" must name a pbkdf2 algorithm, the iterations, the salt and the hash in base64');
    }
    const roles: string | null = rolesProblem(entry['roles']);
    if (roles !== null) {
        problems.push(roles);
    }
    return problems;
}

/** The person of an entry already checked by `entryProblems`. */
function importUserOf(entry: Record<string, unknown>): IImportUser {
    return {
        email: String(entry['email']),
        emailVerified: entry['emailVerified'] === true,
        ...(typeof entry['firstName'] === 'string' ? { firstName: entry['firstName'] } : {}),
        ...(typeof entry['lastName'] === 'string' ? { lastName: entry['lastName'] } : {}),
        ...(typeof entry['passwordHash'] === 'string' ? { passwordHash: entry['passwordHash'] } : {}),
        ...(entry['password'] === undefined ? {} : { password: entry['password'] as IPasswordParts }),
        ...(isRecord(entry['roles']) ? { roles: entry['roles'] as Record<string, string[]> } : {}),
    };
}

/**
 * Reads the file of users. Every error is named by the number of the entry, and the people with
 * errors stay out: the caller refuses the whole file while any problem is left.
 */
export function readUsers(raw: unknown): IReadUsers {
    if (!Array.isArray(raw)) {
        return { users: [], problems: ['the file must hold a JSON list of users'] };
    }
    const users: IImportUser[] = [];
    const problems: string[] = [];
    const seen: Set<string> = new Set<string>();
    raw.forEach((entry: unknown, index: number): void => {
        const found: string[] = entryProblems(entry);
        const email: string = isRecord(entry) && typeof entry['email'] === 'string' ? entry['email'].toLowerCase() : '';
        if (email !== '' && seen.has(email)) {
            found.push('the address is already named by an earlier entry');
        }
        seen.add(email);
        if (found.length > 0 || !isRecord(entry)) {
            const label: string = email === '' ? `entry ${index + 1}` : `entry ${index + 1} (${email})`;
            problems.push(...found.map((problem: string): string => `${label}: ${problem}`));
            return;
        }
        users.push(importUserOf(entry));
    });
    return { users, problems };
}
