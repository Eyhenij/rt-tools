import { KeycloakFetchDouble } from '../testing/keycloak-fetch-double';
import { IImportUser, NEW_CREDENTIAL_ACTION } from './import-user';
import { IImportReport, importUsers, realmClients, TRealmClients, unknownRoles } from './import-users';
import { KeycloakAdmin } from './keycloak-admin';

function adminOver(double: KeycloakFetchDouble): KeycloakAdmin {
    return new KeycloakAdmin({
        url: 'https://auth.test',
        realm: 'rt',
        clientId: 'rt-user-import',
        clientSecret: 'secret',
        fetch: double.fetch,
    });
}

async function runImport(double: KeycloakFetchDouble, users: IImportUser[], sendActionsEmail: boolean): Promise<IImportReport> {
    const admin: KeycloakAdmin = adminOver(double);
    return importUsers(users, admin, await realmClients(users, admin), { sendActionsEmail });
}

describe('importUsers', () => {
    it('SC-AUTH-41 — the letter goes only by the flag and only to the added', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble();
        await runImport(double, [{ email: 'old@test' }], false);

        const quiet: IImportReport = await runImport(double, [{ email: 'quiet@test' }], false);
        const loud: IImportReport = await runImport(double, [{ email: 'old@test' }, { email: 'new@test' }], true);

        expect(quiet.withoutPassword).toEqual(['quiet@test']);
        expect(quiet.emailed).toEqual([]);
        expect(loud.emailed).toEqual(['new@test']);
        expect(double.letters).toEqual([{ userId: double.users().get('new@test')?.id, actions: [NEW_CREDENTIAL_ACTION] }]);
    });

    it('SC-AUTH-42 — a second run skips the people already in the realm', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble();
        const file: IImportUser[] = [{ email: 'a@test' }, { email: 'b@test' }];

        const first: IImportReport = await runImport(double, file, true);
        const second: IImportReport = await runImport(double, file, true);

        expect(first.added).toEqual(['a@test', 'b@test']);
        expect(second.added).toEqual([]);
        expect(second.skipped).toEqual(['a@test', 'b@test']);
        expect(double.letters).toHaveLength(2);
    });

    it('SC-AUTH-43 — the rights move as client roles', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble({ 'orders-admin': ['orders:read', 'orders:write'] });

        await runImport(double, [{ email: 'a@test', roles: { 'orders-admin': ['orders:read', 'orders:write'] } }], false);

        expect(double.users().get('a@test')?.clientRoles).toEqual({ 'orders-admin': ['orders:read', 'orders:write'] });
    });
});

describe('unknownRoles', () => {
    it('SC-AUTH-44 — a role or a client the realm does not have is named', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble({ 'orders-admin': ['orders:read'] });
        const file: IImportUser[] = [
            { email: 'a@test', roles: { 'orders-admin': ['orders:read', 'orders:delete'] } },
            { email: 'b@test', roles: { 'missing-admin': ['x:y'] } },
        ];

        const clients: TRealmClients = await realmClients(file, adminOver(double));

        expect(unknownRoles(file, clients)).toEqual([
            'a@test: the client "orders-admin" has no role "orders:delete"',
            'b@test: the realm has no client "missing-admin"',
        ]);
        expect(double.writes()).toEqual([]);
    });
});
