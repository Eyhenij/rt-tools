import { Buffer } from 'node:buffer';

import { IKeycloakUser, IReadUsers, keycloakUserOf, NEW_CREDENTIAL_ACTION, readUsers } from './import-user';

const ARGON2: string = `$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$${Buffer.alloc(32, 7).toString('base64').replace(/=+$/, '')}`;

describe('keycloakUserOf', () => {
    it('SC-AUTH-40 — a person with another hash must set a password', () => {
        const people: IKeycloakUser[] = [
            keycloakUserOf({ email: 'scrypt@test', passwordHash: '$scrypt$ln=16,r=8,p=1$c2FsdA$aGFzaA' }),
            keycloakUserOf({ email: 'bcrypt@test', passwordHash: '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW' }),
            keycloakUserOf({ email: 'none@test' }),
        ];

        for (const person of people) {
            expect(person.credentials).toEqual([]);
            expect(person.requiredActions).toEqual([NEW_CREDENTIAL_ACTION]);
        }
    });

    it('SC-AUTH-40 — a person with a kept hash needs no new password', () => {
        const person: IKeycloakUser = keycloakUserOf({ email: 'Argon@Test', firstName: 'A', passwordHash: ARGON2, emailVerified: true });

        expect(person.username).toBe('argon@test');
        expect(person.credentials).toHaveLength(1);
        expect(person.requiredActions).toEqual([]);
        expect(person.emailVerified).toBe(true);
    });
});

describe('readUsers', () => {
    it('SC-AUTH-44 — every broken entry is named by its number', () => {
        const read: IReadUsers = readUsers([
            { email: 'good@test' },
            { name: 'no address' },
            { email: 'good@test' },
            { email: 'x@test', roles: { a: 'b' } },
        ]);

        expect(read.users.map((user) => user.email)).toEqual(['good@test']);
        expect(read.problems).toEqual([
            'entry 2: "email" is missing or is not an address',
            'entry 3 (good@test): the address is already named by an earlier entry',
            'entry 4 (x@test): "roles" must map a client to a list of role names',
        ]);
    });

    it('SC-AUTH-44 — a file that is not a list is refused', () => {
        expect(readUsers({ users: [] }).problems).toEqual(['the file must hold a JSON list of users']);
    });
});
