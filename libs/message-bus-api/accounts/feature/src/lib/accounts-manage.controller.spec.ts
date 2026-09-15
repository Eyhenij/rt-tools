import 'reflect-metadata';

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { ACCOUNT_OF_REQUEST, IAccountBearingRequest, passwordMatches } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPersonView } from '@rt/message-bus-common';

import { AccountsManageController } from './accounts-manage.controller';

/** Запись в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IStoredAccount {
    readonly id: string;
    readonly name: string;
    readonly nameKey: string;
    passwordHash: string;
    disabledAt: Date | null;
    readonly lastLoginAt: Date | null;
    readonly role: { readonly name: string } | null;
}

/** Вход в хранилище: чей и не оборван ли. */
interface IStoredSession {
    readonly accountId: string;
    revokedAt: Date | null;
}

/** Часы стоят в прошлом: машинные не читаются, иначе тест зелен в день написания и красен потом. */
const DISABLED_AT: Date = new Date('2026-09-02T10:00:00Z');
const NOW: Date = new Date('2026-09-05T10:00:00Z');

/** Хеш, заведомо не совпадающий ни с одним паролем спеки: сверка сравнивает поля строки. */
const OLD_HASH: string = '16384$00$00';

/** Таблица записей двойника: те три обращения, которые зовут операции. */
interface IAccountTable {
    findUnique: (args: { where: { nameKey: string } }) => Promise<IStoredAccount | null>;
    create: (args: { data: { name: string; nameKey: string; passwordHash: string } }) => Promise<void>;
    update: (args: { where: { id: string }; data: Partial<IStoredAccount> }) => Promise<void>;
}

/** Таблица входов двойника: обрыв живых входов одной записи. */
interface ISessionTable {
    updateMany: (args: { where: { accountId: string }; data: { revokedAt: Date } }) => Promise<{ count: number }>;
}

/** Двойник хранилища с записями и входами; правки он исполняет сам, и по ним судится исход. */
function storage(): { prisma: PrismaService; accounts: IStoredAccount[]; sessions: IStoredSession[] } {
    const accounts: IStoredAccount[] = [
        {
            id: 'a1',
            name: 'Ольга',
            nameKey: 'ольга',
            passwordHash: OLD_HASH,
            disabledAt: null,
            lastLoginAt: null,
            role: { name: 'Владелец' },
        },
        { id: 'a2', name: 'Борис', nameKey: 'борис', passwordHash: OLD_HASH, disabledAt: null, lastLoginAt: null, role: null },
        { id: 'a3', name: 'Андрей', nameKey: 'андрей', passwordHash: OLD_HASH, disabledAt: DISABLED_AT, lastLoginAt: null, role: null },
    ];
    const sessions: IStoredSession[] = [
        { accountId: 'a2', revokedAt: null },
        { accountId: 'a2', revokedAt: null },
        { accountId: 'a1', revokedAt: null },
    ];

    const byKey: (nameKey: string) => IStoredAccount | null = (nameKey: string): IStoredAccount | null =>
        accounts.find((row: IStoredAccount): boolean => row.nameKey === nameKey) ?? null;
    const byId: (id: string) => IStoredAccount = (id: string): IStoredAccount =>
        accounts.find((row: IStoredAccount): boolean => row.id === id) as IStoredAccount;

    const account: IAccountTable = {
        findUnique: async ({ where }: { where: { nameKey: string } }): Promise<IStoredAccount | null> => byKey(where.nameKey),
        create: async ({ data }: { data: { name: string; nameKey: string; passwordHash: string } }): Promise<void> => {
            accounts.push({ id: `a${accounts.length + 1}`, ...data, disabledAt: null, lastLoginAt: null, role: null });
        },
        update: async ({ where, data }: { where: { id: string }; data: Partial<IStoredAccount> }): Promise<void> => {
            Object.assign(byId(where.id), data);
        },
    };
    const session: ISessionTable = {
        updateMany: async ({ where, data }: { where: { accountId: string }; data: { revokedAt: Date } }): Promise<{ count: number }> => {
            const live: IStoredSession[] = sessions.filter(
                (row: IStoredSession): boolean => row.accountId === where.accountId && row.revokedAt === null
            );

            live.forEach((row: IStoredSession): void => {
                row.revokedAt = data.revokedAt;
            });

            return { count: live.length };
        },
    };
    const $transaction: (steps: Promise<unknown>[]) => Promise<unknown[]> = async (steps: Promise<unknown>[]): Promise<unknown[]> =>
        Promise.all(steps);

    return { prisma: { account, session, $transaction } as unknown as PrismaService, accounts, sessions };
}

/** Запрос, в который проверка входа положила вошедшего: здесь — Ольгу. */
function requestOf(id: string, name: string): IAccountBearingRequest {
    return { [ACCOUNT_OF_REQUEST]: { id, name, sessionId: 's1' } };
}

describe('AccountsManageController', (): void => {
    it('SC-MB-369 — все три операции закрыты правом на правку людей', (): void => {
        ['create', 'replacePassword', 'disable'].forEach((method: string): void => {
            const handler: unknown = Reflect.get(AccountsManageController.prototype, method);

            expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
            expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('accounts:manage');
        });
    });

    it('SC-MB-361 — заведение кладёт запись с хешем пароля и отвечает строкой списка', async (): Promise<void> => {
        const { prisma, accounts } = storage();

        const row: IPersonView = await new AccountsManageController(prisma).create({ name: ' Вера ', password: 'тайна' });

        expect(row).toEqual({ name: 'Вера', role: null, disabledAt: null, lastLoginAt: null });

        const stored: IStoredAccount = accounts[accounts.length - 1];

        expect(stored.nameKey).toBe('вера');
        expect(stored.passwordHash).not.toBe('тайна');
        expect(passwordMatches('тайна', stored.passwordHash)).toBe(true);
    });

    it('SC-MB-362 — занятое имя отбивается словами о нём, и прежняя запись цела', async (): Promise<void> => {
        const { prisma, accounts } = storage();

        await expect(new AccountsManageController(prisma).create({ name: 'ольга', password: 'другая' })).rejects.toThrow(ConflictException);
        expect(accounts).toHaveLength(3);
        expect(accounts[0].passwordHash).toBe(OLD_HASH);
    });

    it('SC-MB-363 — пустой пароль и пустое имя отбиваются до записи в хранилище', async (): Promise<void> => {
        const { prisma, accounts } = storage();
        const controller: AccountsManageController = new AccountsManageController(prisma);

        await expect(controller.create({ name: 'Вера', password: '' })).rejects.toThrow(BadRequestException);
        await expect(controller.create({ name: '', password: 'тайна' })).rejects.toThrow(BadRequestException);
        await expect(controller.replacePassword('Борис', {})).rejects.toThrow(BadRequestException);
        expect(accounts).toHaveLength(3);
        expect(accounts[1].passwordHash).toBe(OLD_HASH);
    });

    it('SC-MB-364 — новый пароль сменяет хеш, а живые входы записи остаются', async (): Promise<void> => {
        const { prisma, accounts, sessions } = storage();

        const row: IPersonView = await new AccountsManageController(prisma).replacePassword('Борис', { password: 'новая' });

        expect(row.name).toBe('Борис');
        expect(passwordMatches('новая', accounts[1].passwordHash)).toBe(true);
        expect(sessions.filter((one: IStoredSession): boolean => one.accountId === 'a2' && one.revokedAt === null)).toHaveLength(2);
    });

    it('SC-MB-365 — отключение ставит время и обрывает входы записи, чужие входы цел', async (): Promise<void> => {
        const { prisma, accounts, sessions } = storage();

        const row: IPersonView = await new AccountsManageController(prisma).disable('борис', requestOf('a1', 'Ольга'), NOW);

        expect(row.disabledAt).toBe(NOW.toISOString());
        expect(accounts[1].disabledAt).toEqual(NOW);
        expect(
            sessions
                .filter((one: IStoredSession): boolean => one.accountId === 'a2')
                .every((one: IStoredSession): boolean => one.revokedAt === NOW)
        ).toBe(true);
        expect(sessions[2].revokedAt).toBeNull();
    });

    it('SC-MB-366 — своя запись не отключается, и отказ называет причину', async (): Promise<void> => {
        const { prisma, accounts } = storage();

        await expect(new AccountsManageController(prisma).disable('Ольга', requestOf('a1', 'Ольга'), NOW)).rejects.toThrow(/свою запись/);
        expect(accounts[0].disabledAt).toBeNull();
    });

    it('SC-MB-367 — уже отключённая не отключается второй раз, а незнакомое имя не найдено', async (): Promise<void> => {
        const { prisma, accounts } = storage();
        const controller: AccountsManageController = new AccountsManageController(prisma);

        await expect(controller.disable('Андрей', requestOf('a1', 'Ольга'), NOW)).rejects.toThrow(ConflictException);
        expect(accounts[2].disabledAt).toEqual(DISABLED_AT);
        await expect(controller.disable('Никто', requestOf('a1', 'Ольга'), NOW)).rejects.toThrow(NotFoundException);
        await expect(controller.replacePassword('Никто', { password: 'x' })).rejects.toThrow(NotFoundException);
    });
});
