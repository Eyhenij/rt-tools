import { Buffer } from 'node:buffer';

import { credentialOf, IKeycloakCredential } from './password-hash';

interface IParsed {
    readonly data: Record<string, unknown>;
    readonly secret: Record<string, unknown>;
}

function parsed(credential: IKeycloakCredential | null): IParsed {
    if (credential === null) {
        throw new Error('The hash was not kept');
    }
    return {
        data: JSON.parse(credential.credentialData) as Record<string, unknown>,
        secret: JSON.parse(credential.secretData) as Record<string, unknown>,
    };
}

/** Sixteen bytes `somesaltsomesalt` and a hash of thirty-two bytes, unpadded as PHC writes them. */
const SALT: string = 'c29tZXNhbHRzb21lc2FsdA';
const HASH: string = Buffer.alloc(32, 7).toString('base64').replace(/=+$/, '');

describe('credentialOf', () => {
    it('SC-AUTH-38 — an argon2 hash in PHC becomes a Keycloak credential', () => {
        const { data, secret } = parsed(credentialOf(`$argon2id$v=19$m=65536,t=3,p=4$${SALT}$${HASH}`));

        expect(data).toEqual({
            algorithm: 'argon2',
            hashIterations: 3,
            additionalParameters: { type: ['id'], version: ['1.3'], memory: ['65536'], parallelism: ['4'], hashLength: ['32'] },
        });
        expect(secret['salt']).toBe('c29tZXNhbHRzb21lc2FsdA==');
        expect(secret['value']).toBe(Buffer.alloc(32, 7).toString('base64'));
    });

    it('SC-AUTH-38 — an old argon2i hash without a version is read as version 1.0', () => {
        const { data } = parsed(credentialOf(`$argon2i$m=4096,t=2,p=1$${SALT}$${HASH}`));

        expect(data['additionalParameters']).toMatchObject({ type: ['i'], version: ['1.0'] });
    });

    it('SC-AUTH-39 — a pbkdf2 hash moves in PHC and as an object', () => {
        const salt: string = Buffer.from('somesaltsomesalt').toString('base64');
        const hash: string = Buffer.alloc(32, 9).toString('base64');

        const phc: IParsed = parsed(credentialOf(`$pbkdf2-sha256$i=27500,l=32$${salt.replace(/=+$/, '')}$${hash.replace(/=+$/, '')}`));
        const passlib: IParsed = parsed(
            credentialOf(`$pbkdf2-sha512$29000$${salt.replaceAll('+', '.').replace(/=+$/, '')}$${hash.replace(/=+$/, '')}`)
        );
        const parts: IParsed = parsed(credentialOf({ algorithm: 'pbkdf2', iterations: 1000, salt, hash }));

        expect(phc.data).toEqual({ algorithm: 'pbkdf2-sha256', hashIterations: 27500, additionalParameters: {} });
        expect(passlib.data).toEqual({ algorithm: 'pbkdf2-sha512', hashIterations: 29000, additionalParameters: {} });
        expect(parts.data).toEqual({ algorithm: 'pbkdf2', hashIterations: 1000, additionalParameters: {} });
        for (const each of [phc, passlib, parts]) {
            expect(each.secret).toEqual({ value: hash, salt, additionalParameters: {} });
        }
    });

    it('SC-AUTH-40 — scrypt, bcrypt, a broken hash and none are not kept', () => {
        expect(credentialOf(`$scrypt$ln=16,r=8,p=1$${SALT}$${HASH}`)).toBeNull();
        expect(credentialOf('$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW')).toBeNull();
        expect(credentialOf(`$argon2id$v=19$m=65536,t=0,p=4$${SALT}$${HASH}`)).toBeNull();
        expect(credentialOf('plain text')).toBeNull();
        expect(credentialOf(undefined)).toBeNull();
    });
});
