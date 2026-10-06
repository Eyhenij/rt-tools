/**
 * The names of the stand of the example suite: ports, the realm and the people.
 *
 * They are asked by three sides — the raising of the stand, the seeding of the realm and the specs —
 * and live in one place: diverged, they refuse nothing, a spec just looks for a person the seeding
 * never created.
 *
 * The ports are not those of the example on one's own machine (3210 and 4210): the suite raises
 * production builds next to a working machine and has no right to answer in its place. The realm
 * client returns a person to both ports.
 */

/** Keycloak of the stand, raised by `pnpm run serve:auth`. */
export const KEYCLOAK_ORIGIN = 'http://localhost:58080';

export const REALM = 'rt';

/** The client of the example admin in the realm. */
export const CLIENT = 'rt-example-admin';

export const API_PORT = 3410;
export const ADMIN_PORT = 4410;
export const API_ORIGIN = `http://localhost:${API_PORT}`;
export const ADMIN_ORIGIN = `http://localhost:${ADMIN_PORT}`;

/**
 * The password of every person of the stand. A test value of a local stand: the realm lives in a
 * container on this machine, and the people are recreated on every run. It meets the realm
 * password policy: Keycloak refuses to create a person with a weaker one.
 */
export const STAND_PASSWORD = 'Example-stand-2026';

/** The people of the stand and their rights in the example client. */
export const PEOPLE = Object.freeze({
    reader: Object.freeze({ email: 'reader@example.test', firstName: 'Rita', lastName: 'Reader', rights: ['example:read'] }),
    editor: Object.freeze({
        email: 'editor@example.test',
        firstName: 'Eddie',
        lastName: 'Editor',
        rights: ['example:read', 'example:write'],
    }),
    outsider: Object.freeze({ email: 'outsider@example.test', firstName: 'Olga', lastName: 'Outsider', rights: [] }),
});
