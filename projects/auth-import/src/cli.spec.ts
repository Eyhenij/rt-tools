import { ICliIo, run, SECRET_VARIABLE } from './cli';
import { KeycloakFetchDouble } from './testing/keycloak-fetch-double';

const ARGS: string[] = ['--url', 'https://auth.test/', '--realm', 'rt', '--client-id', 'rt-user-import', '--file', 'users.json'];

type TTestIo = ICliIo & { readonly lines: string[]; readonly errors: string[] };

function ioOver(double: KeycloakFetchDouble, file: unknown): TTestIo {
    const lines: string[] = [];
    const errors: string[] = [];
    return {
        lines,
        errors,
        readFile: (): Promise<string> => Promise.resolve(JSON.stringify(file)),
        fetch: double.fetch,
        out: (line: string): void => void lines.push(line),
        err: (line: string): void => void errors.push(line),
    };
}

describe('run', () => {
    it('SC-AUTH-45 — the secret is read from the environment', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble();
        const io: TTestIo = ioOver(double, [{ email: 'a@test' }]);

        const code: number = await run(ARGS, { [SECRET_VARIABLE]: 'from-the-environment' }, io);

        expect(code).toBe(0);
        expect(double.secrets).toEqual(['from-the-environment']);
        expect(io.lines[0]).toBe('added 1, skipped as already in the realm 0');
    });

    it('SC-AUTH-45 — without the secret the command does not start', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble();
        const io: TTestIo = ioOver(double, [{ email: 'a@test' }]);

        const code: number = await run([...ARGS, '--send-actions-email'], {}, io);

        expect(code).toBe(1);
        expect(io.errors[0]).toContain(SECRET_VARIABLE);
        expect(double.requests).toEqual([]);
    });

    it('SC-AUTH-44 — a file with an error is refused before the first write', async () => {
        const double: KeycloakFetchDouble = new KeycloakFetchDouble({ 'orders-admin': ['orders:read'] });
        const io: TTestIo = ioOver(double, [
            { email: 'good@test' },
            { firstName: 'No address' },
            { email: 'bad@test', roles: { 'orders-admin': ['orders:delete'] } },
        ]);

        const code: number = await run(ARGS, { [SECRET_VARIABLE]: 'secret' }, io);

        expect(code).toBe(1);
        expect(io.errors).toEqual([
            'The file is refused, nothing was written to Keycloak:',
            '  entry 2: "email" is missing or is not an address',
            '  bad@test: the client "orders-admin" has no role "orders:delete"',
        ]);
        expect(double.writes()).toEqual([]);
        expect(double.users().size).toBe(0);
    });
});
