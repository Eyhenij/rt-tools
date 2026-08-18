import { Logger, UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    ACCOUNT_OF_REQUEST,
    IAccountBearingRequest,
    passwordHash,
    SESSION_COOKIE,
    sessionTokenHash,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { AuthController, ISessionAnswer } from './auth.controller';
import { LoginAttemptsService } from './login-attempts.service';

/** Учётная запись в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IAccountRow {
    id: string;
    name: string;
    nameKey: string;
    passwordHash: string;
    disabledAt: Date | null;
    lastLoginAt: Date | null;
}

/** Вход в хранилище: в нём лежит только хеш значения, а само значение уезжает в куку. */
interface ISessionRow {
    id: string;
    accountId: string;
    hash: string;
    revokedAt: Date | null;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

const NAME: string = 'Владелец';
const PASSWORD: string = 'тайный-пароль';

/**
 * Двойник хранилища: отбор и правку строк он делает сам, а строки лежат открыто — сценарии
 * обещают, что после операции лежит в хранилище, а не какой запрос собран.
 */
class PrismaDouble {
    #nextId: number = 1;

    public readonly accounts: IAccountRow[] = [];
    public readonly sessions: ISessionRow[] = [];

    public get account(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#account(args) ?? null,
            update: async (args: Record<string, unknown>): Promise<unknown> => {
                const found: IAccountRow | undefined = this.#account(args);

                if (found) {
                    Object.assign(found, args['data'] as Record<string, unknown>);
                }

                return found ?? null;
            },
        };
    }

    public get session(): Record<string, TQuery> {
        return {
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#create(args),
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => this.#revoke(args),
        };
    }

    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #account(args: Record<string, unknown>): IAccountRow | undefined {
        const where: { nameKey?: string; id?: string } = args['where'] ?? {};

        return this.accounts.find((row: IAccountRow): boolean => row.nameKey === where.nameKey || row.id === where.id);
    }

    #create(args: Record<string, unknown>): { id: string } {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: ISessionRow = {
            id: `session-${this.#nextId++}`,
            accountId: data['accountId'] as string,
            hash: data['hash'] as string,
            revokedAt: null,
        };
        this.sessions.push(created);

        return { id: created.id };
    }

    #revoke(args: Record<string, unknown>): { count: number } {
        const where: { id: string } = args['where'] as { id: string };
        const data: { revokedAt: Date } = args['data'] as { revokedAt: Date };
        const found: ISessionRow | undefined = this.sessions.find(
            (row: ISessionRow): boolean => row.id === where.id && row.revokedAt === null
        );

        if (found) {
            found.revokedAt = data.revokedAt;
        }

        return { count: found ? 1 : 0 };
    }
}

/** Ответ: контроллер кладёт в него куку и снимает её — спека читает и то и другое. */
class ResponseDouble {
    public readonly given: { name: string; value: string; options: Record<string, unknown> }[] = [];
    public readonly cleared: string[] = [];

    public cookie(name: string, value: string, options: Record<string, unknown>): unknown {
        this.given.push({ name, value, options });

        return this;
    }

    public clearCookie(name: string): unknown {
        this.cleared.push(name);

        return this;
    }
}

/** Строки журнала: они уходят логгером каркаса, и спека читает их с его прототипа. */
function journal(): unknown[] {
    const written: unknown[] = [];

    vi.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown): void => {
        written.push(message);
    });

    return written;
}

/** Запрос, в который проверка входа уже положила вошедшего. */
function requestOf(account: { id: string; name: string; sessionId: string }): IAccountBearingRequest {
    return { [ACCOUNT_OF_REQUEST]: account };
}

afterEach((): void => {
    vi.restoreAllMocks();
});

describe('AuthController', () => {
    let db: PrismaDouble;
    let auth: AuthController;
    let response: ResponseDouble;

    beforeEach((): void => {
        db = new PrismaDouble();
        db.accounts.push({
            id: 'account-1',
            name: NAME,
            nameKey: 'владелец',
            passwordHash: passwordHash(PASSWORD),
            disabledAt: null,
            lastLoginAt: null,
        });
        auth = new AuthController(db as unknown as PrismaService, new LoginAttemptsService());
        response = new ResponseDouble();
    });

    describe('login', () => {
        it('SC-MB-33 — годная пара заводит вход и отвечает именем вошедшего', async () => {
            const answered: ISessionAnswer = await auth.login({ name: NAME, password: PASSWORD }, response);

            expect(answered).toEqual({ name: NAME });
            expect(db.sessions).toHaveLength(1);
        });

        it('SC-MB-33 — время последнего входа отмечается той же операцией', async () => {
            await auth.login({ name: NAME, password: PASSWORD }, response);

            expect(db.accounts[0].lastLoginAt).not.toBeNull();
        });

        it('SC-MB-56 — значение входа уезжает кукой, недоступной скриптам и чужому переходу', async () => {
            await auth.login({ name: NAME, password: PASSWORD }, response);

            expect(response.given).toHaveLength(1);
            expect(response.given[0].name).toBe(SESSION_COOKIE);
            expect(response.given[0].options).toMatchObject({ httpOnly: true, sameSite: 'strict' });
        });

        it('SC-MB-56 — в хранилище ложится хеш входа, а не само его значение', async () => {
            await auth.login({ name: NAME, password: PASSWORD }, response);

            const given: string = response.given[0].value;

            expect(given.length).toBeGreaterThan(0);
            expect(db.sessions[0].hash).toBe(sessionTokenHash(given));
            expect(db.sessions[0].hash).not.toBe(given);
        });

        it('SC-MB-60 — вход по имени в другом регистре принимается как по названному', async () => {
            const answered: ISessionAnswer = await auth.login({ name: 'ВЛАДЕЛЕЦ', password: PASSWORD }, response);

            expect(answered).toEqual({ name: NAME });
        });

        it('SC-MB-34 — неверный пароль вход не заводит и причины не называет', async () => {
            await expect(auth.login({ name: NAME, password: 'не-тот-пароль' }, response)).rejects.toThrow('пара не принята');
            expect(db.sessions).toEqual([]);
        });

        it('SC-MB-35 — неизвестное имя отбивается тем же ответом, что и неверный пароль', async () => {
            const unknown: unknown = await auth.login({ name: 'Никто', password: PASSWORD }, response).catch((refused: unknown) => refused);
            const wrong: unknown = await auth.login({ name: NAME, password: 'не-тот' }, response).catch((refused: unknown) => refused);

            expect(unknown).toBeInstanceOf(UnauthorizedException);
            expect(String(unknown)).toBe(String(wrong));
        });

        it('SC-MB-58 — отключённая запись вход не заводит, хотя пара сошлась', async () => {
            db.accounts[0].disabledAt = new Date('2026-08-15T10:00:00Z');

            await expect(auth.login({ name: NAME, password: PASSWORD }, response)).rejects.toThrow('пара не принята');
            expect(db.sessions).toEqual([]);
        });

        it('SC-MB-41 — неудачная попытка пишется в журнал с именем записи и без пароля', async () => {
            const written: unknown[] = journal();

            await auth.login({ name: NAME, password: PASSWORD + '-не-тот' }, response).catch((): void => undefined);

            expect(written).toEqual([{ event: 'login-refused', name: 'владелец' }]);
            expect(JSON.stringify(written)).not.toContain(PASSWORD);
        });

        it('SC-MB-34 — запрос без имени или без пароля отбивается отказом формы', async () => {
            await expect(auth.login({}, response)).rejects.toThrow('в запросе нет имени или пароля');
            await expect(auth.login({ name: '  ', password: PASSWORD }, response)).rejects.toThrow('в запросе нет имени или пароля');
            await expect(auth.login('не набор полей', response)).rejects.toThrow('в запросе нет имени или пароля');
        });
    });

    describe('logout', () => {
        it('SC-MB-57 — выход обрывает тот вход, которым пришли, и только его', async () => {
            await auth.login({ name: NAME, password: PASSWORD }, response);
            await auth.login({ name: NAME, password: PASSWORD }, new ResponseDouble());

            const first: string = db.sessions[0].id;

            await auth.logout(requestOf({ id: 'account-1', name: NAME, sessionId: first }), response);

            expect(db.sessions[0].revokedAt).not.toBeNull();
            expect(db.sessions[1].revokedAt).toBeNull();
        });

        it('SC-MB-56 — выход снимает куку входа', async () => {
            await auth.login({ name: NAME, password: PASSWORD }, response);

            await auth.logout(requestOf({ id: 'account-1', name: NAME, sessionId: db.sessions[0].id }), response);

            expect(response.cleared).toEqual([SESSION_COOKIE]);
        });
    });

    describe('session', () => {
        it('SC-MB-33 — ответ о вошедшем называет имя и ничего сверх него', () => {
            expect(auth.session(requestOf({ id: 'account-1', name: NAME, sessionId: 'session-1' }))).toEqual({ name: NAME });
        });
    });
});
