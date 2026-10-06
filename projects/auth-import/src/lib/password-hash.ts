import { Buffer } from 'node:buffer';

/** A password credential the way Keycloak keeps it: the parameters and the secret, both as JSON. */
export interface IKeycloakCredential {
    readonly type: 'password';
    readonly credentialData: string;
    readonly secretData: string;
}

/** The pbkdf2 algorithms Keycloak verifies without extensions. */
export type TPbkdfAlgorithm = 'pbkdf2' | 'pbkdf2-sha256' | 'pbkdf2-sha512';

/** A pbkdf2 hash given part by part: the salt and the hash in base64. */
export interface IPasswordParts {
    readonly algorithm: TPbkdfAlgorithm;
    readonly iterations: number;
    readonly salt: string;
    readonly hash: string;
}

/** The parts of an argon2 hash in PHC, before they are checked. */
interface IArgonParts {
    readonly type: string | undefined;
    readonly version: string | undefined;
    readonly cost: Readonly<Partial<Record<string, string>>>;
    readonly salt: string | null;
    readonly hash: string | null;
}

const ARGON2_TYPES: Readonly<Partial<Record<string, string>>> = { argon2id: 'id', argon2i: 'i', argon2d: 'd' };
const ARGON2_VERSIONS: Readonly<Partial<Record<string, string>>> = { '19': '1.3', '16': '1.0' };
const PBKDF_ALGORITHMS: Readonly<Partial<Record<string, TPbkdfAlgorithm>>> = {
    pbkdf2: 'pbkdf2',
    'pbkdf2-sha1': 'pbkdf2',
    'pbkdf2-sha256': 'pbkdf2-sha256',
    'pbkdf2-sha512': 'pbkdf2-sha512',
};
const BASE64: RegExp = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Base64 in the standard alphabet with padding, the form Keycloak decodes. PHC writes it without
 * padding, passlib writes `.` for `+`, the URL alphabet writes `-` and `_`.
 */
function standardBase64(value: string): string | null {
    const normalized: string = value.replaceAll('.', '+').replaceAll('-', '+').replaceAll('_', '/');
    if (!BASE64.test(normalized)) {
        return null;
    }
    const bytes: Buffer = Buffer.from(normalized, 'base64');
    return bytes.length === 0 ? null : bytes.toString('base64');
}

function parameters(segment: string): Partial<Record<string, string>> {
    return Object.fromEntries(segment.split(',').map((pair: string): string[] => pair.split('=')));
}

function isPositiveInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function credential(credentialData: object, value: string, salt: string): IKeycloakCredential {
    return {
        type: 'password',
        credentialData: JSON.stringify(credentialData),
        secretData: JSON.stringify({ value, salt, additionalParameters: {} }),
    };
}

/** `$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>`; an old hash has no version segment. */
function argon2PartsOf(parts: readonly string[]): IArgonParts {
    const tail: readonly string[] = parts[2]?.startsWith('v=') === true ? parts.slice(2) : ['v=16', ...parts.slice(2)];
    return {
        type: ARGON2_TYPES[parts[1] ?? ''],
        version: ARGON2_VERSIONS[(tail[0] ?? '').slice(2)],
        cost: parameters(tail[1] ?? ''),
        salt: standardBase64(tail[2] ?? ''),
        hash: standardBase64(tail[3] ?? ''),
    };
}

function argon2Of(parts: readonly string[]): IKeycloakCredential | null {
    const { type, version, cost, salt, hash }: IArgonParts = argon2PartsOf(parts);
    const [memory, lanes, passes]: [string | undefined, string | undefined, number] = [cost['m'], cost['p'], Number(cost['t'])];
    if (type === undefined || version === undefined || memory === undefined) {
        return null;
    }
    if (lanes === undefined || salt === null || hash === null || !isPositiveInteger(passes)) {
        return null;
    }
    const additionalParameters: Record<string, string[]> = {
        type: [type],
        version: [version],
        memory: [memory],
        parallelism: [lanes],
        hashLength: [String(Buffer.from(hash, 'base64').length)],
    };
    return credential({ algorithm: 'argon2', hashIterations: passes, additionalParameters }, hash, salt);
}

function partsOf(source: IPasswordParts): IKeycloakCredential | null {
    const value: string | null = standardBase64(source.hash);
    const salt: string | null = standardBase64(source.salt);
    const known: boolean = Object.values(PBKDF_ALGORITHMS).includes(source.algorithm);
    if (!known || value === null || salt === null || !isPositiveInteger(source.iterations)) {
        return null;
    }
    return credential({ algorithm: source.algorithm, hashIterations: source.iterations, additionalParameters: {} }, value, salt);
}

/** `$pbkdf2-sha256$i=27500,l=32$<salt>$<hash>` in PHC, or `$pbkdf2-sha256$27500$<salt>$<hash>` by passlib. */
function pbkdfOf(parts: readonly string[]): IKeycloakCredential | null {
    const algorithm: TPbkdfAlgorithm | undefined = PBKDF_ALGORITHMS[parts[1] ?? ''];
    if (algorithm === undefined) {
        return null;
    }
    const rounds: string = parts[2] ?? '';
    const iterations: number = Number(rounds.includes('=') ? parameters(rounds)['i'] : rounds);
    return partsOf({ algorithm, iterations, salt: parts[3] ?? '', hash: parts[4] ?? '' });
}

/**
 * The Keycloak credential of a hash, or `null` when Keycloak cannot verify it without an extension.
 *
 * Keycloak verifies argon2 and pbkdf2 with SHA-1, SHA-256 and SHA-512 itself, so a person with such
 * a hash enters with the old password. scrypt, bcrypt and the rest give `null`: such a person moves
 * without a password and sets a new one.
 */
export function credentialOf(source: string | IPasswordParts | undefined): IKeycloakCredential | null {
    if (source === undefined) {
        return null;
    }
    if (typeof source !== 'string') {
        return partsOf(source);
    }
    const parts: string[] = source.split('$');
    if (parts[0] !== '') {
        return null;
    }
    return ARGON2_TYPES[parts[1] ?? ''] === undefined ? pbkdfOf(parts) : argon2Of(parts);
}
