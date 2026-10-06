import { callerFromClaims, hasEveryPermission, hasPermission, hasSomePermission, ICaller, IKeycloakClaims } from './caller';

const CLAIMS: IKeycloakClaims = {
    sub: 'b0c1',
    email: 'anna@example.com',
    email_verified: true,
    name: 'Anna',
    preferred_username: 'anna',
    resource_access: {
        'orders-admin': { roles: ['orders:read', 'orders:write', 'uma_protection', 'manage-account'] },
        'people-admin': { roles: ['people:invite'] },
    },
};

describe('caller', () => {
    it('SC-AUTH-7 — the caller gets the rights of the named client only', () => {
        const caller: ICaller = callerFromClaims(CLAIMS, 'orders-admin');

        expect(hasPermission(caller, 'orders:read')).toBe(true);
        expect(hasPermission(caller, 'people:invite')).toBe(false);
        expect(caller.subject).toBe('b0c1');
        expect(caller.email).toBe('anna@example.com');
        expect(caller.emailVerified).toBe(true);
        expect(caller.name).toBe('Anna');
    });

    it('SC-AUTH-7 — a client the token has no roles in gives a caller without rights', () => {
        const caller: ICaller = callerFromClaims({ sub: 'b0c1' }, 'orders-admin');

        expect(caller.permissions.size).toBe(0);
        expect(caller.email).toBeNull();
        expect(caller.emailVerified).toBe(false);
        expect(caller.name).toBeNull();
    });

    it('SC-AUTH-7 — a client entry without roles gives a caller without rights, the login names the caller', () => {
        const caller: ICaller = callerFromClaims(
            { sub: 'b0c1', preferred_username: 'anna', resource_access: { 'orders-admin': {} } },
            'orders-admin'
        );

        expect(caller.permissions.size).toBe(0);
        expect(caller.name).toBe('anna');
    });

    it('SC-AUTH-8 — a role of another shape is dropped', () => {
        const caller: ICaller = callerFromClaims(CLAIMS, 'orders-admin');

        expect([...caller.permissions]).toEqual(['orders:read', 'orders:write']);
    });

    it('SC-AUTH-10 — a check of several rights says all or any', () => {
        const caller: ICaller = callerFromClaims(CLAIMS, 'people-admin');

        expect(hasEveryPermission(caller, ['people:invite', 'people:remove'])).toBe(false);
        expect(hasSomePermission(caller, ['people:invite', 'people:remove'])).toBe(true);
        expect(hasEveryPermission(caller, [])).toBe(true);
        expect(hasSomePermission(caller, [])).toBe(false);
    });
});
