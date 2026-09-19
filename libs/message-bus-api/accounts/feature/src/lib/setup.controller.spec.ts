import 'reflect-metadata';

import { BadRequestException, ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS } from '@rt/message-bus-api/access/util';
import { passwordMatches, SESSION_COOKIE } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { ISessionAnswer } from './sign-in-issue';
import { OWNER_ROLE_KEY, SetupController } from './setup.controller';

/** Запись так, как её держит двойник: то, что кладёт заведение, и роль. */
interface IAccountRow {
    id: string;
    name: string;
    nameKey: string;
    passwordHash: string;
    roleId: string | null;
    lastLoginAt: Date | null;
}

interface IRoleRow {
    id: string;
    key: string;
    rights: string[];
}

interface ISessionRow {
    id: string;
    accountId: string;
    hash: string;
}

type TQuery = (args?: Record<string, unknown>) => Promise<unknown>;

const OWNER_RIGHTS: readonly string[] = ['postmortems:read', 'accounts:manage', 'roles:manage'];

/**
 * Двойник хранилища: записи, роли и входы в памяти.
 *
 * Сделка заведения первой записи исполняется тем же клиентом: замок таблицы у двойника — пустая
 * операция, а счёт и запись внутри сделки читают те же ряды. Двойник с одной записью отвечает на
 * заведение так, как отвечает хранилище второму первому запросу.
 */
class PrismaDouble {
    #nextId: number = 1;

    public readonly accounts: IAccountRow[] = [];
    public readonly roles: IRoleRow[] = [];
    public readonly sessions: ISessionRow[] = [];

    public get account(): Record<string, TQuery> {
        return {
            count: async (): Promise<number> => this.accounts.length,
            create: async (args?: Record<string, unknown>): Promise<{ id: string }> => this.#createAccount(args ?? {}),
            update: async (args?: Record<string, unknown>): Promise<unknown> => this.#touch(args ?? {}),
            findUnique: async (args?: Record<string, unknown>): Promise<unknown> => this.#rightsOf(args ?? {}),
        };
    }

    public get role(): Record<string, TQuery> {
        return {
            findUnique: async (args?: Record<string, unknown>): Promise<unknown> => {
                const where: { key?: string } = args?.['where'] ?? {};
                const found: IRoleRow | undefined = this.roles.find((row: IRoleRow): boolean => row.key === where.key);

                return found ? { id: found.id, rights: found.rights } : null;
            },
        };
    }

    public get session(): Record<string, TQuery> {
        return {
            create: async (args?: Record<string, unknown>): Promise<{ id: string }> => this.#createSession(args ?? {}),
        };
    }

    public async $executeRaw(): Promise<number> {
        return 0;
    }

    public async $transaction(work: readonly Promise<unknown>[] | ((tx: PrismaDouble) => Promise<unknown>)): Promise<unknown> {
        return typeof work === 'function' ? work(this) : Promise.all(work);
    }

    public withOwnerRole(): PrismaDouble {
        this.roles.push({ id: 'role-owner', key: OWNER_ROLE_KEY, rights: [...OWNER_RIGHTS] });

        return this;
    }

    public withAccount(name: string): PrismaDouble {
        this.accounts.push({
            id: `account-${this.#nextId++}`,
            name,
            nameKey: name.toLowerCase(),
            passwordHash: 'x',
            roleId: null,
            lastLoginAt: null,
        });

        return this;
    }

    #createAccount(args: Record<string, unknown>): { id: string } {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: IAccountRow = {
            id: `account-${this.#nextId++}`,
            name: data['name'] as string,
            nameKey: data['nameKey'] as string,
            passwordHash: data['passwordHash'] as string,
            roleId: (data['roleId'] as string | undefined) ?? null,
            lastLoginAt: null,
        };
        this.accounts.push(created);

        return { id: created.id };
    }

    #touch(args: Record<string, unknown>): IAccountRow | null {
        const where: { id?: string } = args['where'] ?? {};
        const found: IAccountRow | undefined = this.accounts.find((row: IAccountRow): boolean => row.id === where.id);

        if (found) {
            Object.assign(found, args['data'] as Record<string, unknown>);
        }

        return found ?? null;
    }

    #rightsOf(args: Record<string, unknown>): unknown {
        const where: { id?: string } = args['where'] ?? {};
        const found: IAccountRow | undefined = this.accounts.find((row: IAccountRow): boolean => row.id === where.id);
        const role: IRoleRow | undefined = this.roles.find((row: IRoleRow): boolean => row.id === found?.roleId);

        return found ? { role: role ? { rights: role.rights } : null, permissions: [] } : null;
    }

    #createSession(args: Record<string, unknown>): { id: string } {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: ISessionRow = {
            id: `session-${this.#nextId++}`,
            accountId: data['accountId'] as string,
            hash: data['hash'] as string,
        };
        this.sessions.push(created);

        return { id: created.id };
    }
}

class ResponseDouble {
    public readonly given: { name: string; value: string; options: Record<string, unknown> }[] = [];

    public cookie(name: string, value: string, options: Record<string, unknown>): unknown {
        this.given.push({ name, value, options });

        return this;
    }

    public clearCookie(): unknown {
        return this;
    }
}

function controllerOf(db: PrismaDouble): SetupController {
    return new SetupController(db as unknown as PrismaService);
}

describe('SetupController', (): void => {
    it('SC-MB-383 — обе операции открыты без входа: входить ещё некому', (): void => {
        ['open', 'create'].forEach((method: string): void => {
            expect(Reflect.getMetadata(OPERATION_ACCESS, Reflect.get(SetupController.prototype, method))).toBe('public');
        });
    });

    it('SC-MB-383 — пустое хранилище отвечает «ждёт», хранилище с записью — «не ждёт»', async (): Promise<void> => {
        expect(await controllerOf(new PrismaDouble()).open()).toEqual({ open: true });
        expect(await controllerOf(new PrismaDouble().withAccount('Ольга')).open()).toEqual({ open: false });
    });

    it('SC-MB-384 — первая запись заводится с ролью владельца и хешем, и входит тем же запросом', async (): Promise<void> => {
        const db: PrismaDouble = new PrismaDouble().withOwnerRole();
        const response: ResponseDouble = new ResponseDouble();

        const answer: ISessionAnswer = await controllerOf(db).create({ name: ' Ольга ', password: 'тайный' }, response);

        expect(answer).toEqual({ name: 'Ольга', rights: OWNER_RIGHTS });
        expect(db.accounts).toHaveLength(1);
        expect(db.accounts[0].roleId).toBe('role-owner');
        expect(db.accounts[0].nameKey).toBe('ольга');
        expect(db.accounts[0].passwordHash).not.toContain('тайный');
        expect(passwordMatches('тайный', db.accounts[0].passwordHash)).toBe(true);
        expect(db.sessions).toHaveLength(1);
        expect(db.accounts[0].lastLoginAt).not.toBeNull();
        expect(response.given).toHaveLength(1);
        expect(response.given[0].name).toBe(SESSION_COOKIE);
        expect(response.given[0].options['httpOnly']).toBe(true);
    });

    it('SC-MB-385 — с записью в хранилище первый запуск закрыт навсегда, и ничего не пишется', async (): Promise<void> => {
        const db: PrismaDouble = new PrismaDouble().withOwnerRole().withAccount('Ольга');

        await expect(controllerOf(db).create({ name: 'Борис', password: 'тайный' }, new ResponseDouble())).rejects.toThrow(
            ConflictException
        );
        await expect(controllerOf(db).create({ name: 'Борис', password: 'тайный' }, new ResponseDouble())).rejects.toThrow(/уже заведена/);
        expect(db.accounts).toHaveLength(1);
        expect(db.sessions).toHaveLength(0);
    });

    it('SC-MB-386 — пустое имя и пустой пароль отбиваются до записи словом о том, чего не хватает', async (): Promise<void> => {
        const db: PrismaDouble = new PrismaDouble().withOwnerRole();

        await expect(controllerOf(db).create({ name: '  ', password: 'тайный' }, new ResponseDouble())).rejects.toThrow(
            BadRequestException
        );
        await expect(controllerOf(db).create({ name: 'Ольга', password: '' }, new ResponseDouble())).rejects.toThrow(/парол/);
        expect(db.accounts).toHaveLength(0);
    });

    it('SC-MB-387 — узел без роли владельца отказывает, называя роль, и записи не заводит', async (): Promise<void> => {
        const db: PrismaDouble = new PrismaDouble();

        await expect(controllerOf(db).create({ name: 'Ольга', password: 'тайный' }, new ResponseDouble())).rejects.toThrow(/owner/);
        expect(db.accounts).toHaveLength(0);
    });

    it('SC-MB-388 — второй первый запрос, увидевший запись внутри сделки, отвечает закрытым запуском', async (): Promise<void> => {
        const db: PrismaDouble = new PrismaDouble().withOwnerRole();
        // Первый счёт снаружи сделки видит пустоту, а внутри сделки запись уже есть: так выглядит
        // второй запрос, дождавшийся замка таблицы
        let counted: number = 0;
        db.account['count'] = async (): Promise<number> => counted++;
        db.withAccount('Ольга');

        await expect(controllerOf(db).create({ name: 'Борис', password: 'тайный' }, new ResponseDouble())).rejects.toThrow(/уже заведена/);
        expect(db.accounts).toHaveLength(1);
        expect(db.accounts[0].name).toBe('Ольга');
    });
});
