import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { IPersonRow } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { AccountsReadController } from './accounts-read.controller';

/** Запись в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IStoredAccount {
    readonly name: string;
    readonly disabledAt: Date | null;
    readonly lastLoginAt: Date | null;
    readonly role: { readonly name: string } | null;
}

/** Часы стоят в прошлом: машинные не читаются, иначе тест зелен в день написания и красен потом. */
const ENTERED_AT: Date = new Date('2026-09-01T10:00:00Z');
const DISABLED_AT: Date = new Date('2026-09-02T10:00:00Z');

/**
 * Три записи разом: с ролью, без роли и отключённая, ни разу не входившая.
 *
 * Порядок нарочно не по имени: выборка обязана расставить их сама, и набор, лежащий уже
 * расставленным, о порядке не сказал бы ничего.
 */
const STORED: IStoredAccount[] = [
    { name: 'Ольга', disabledAt: null, lastLoginAt: ENTERED_AT, role: { name: 'Владелец' } },
    { name: 'Андрей', disabledAt: DISABLED_AT, lastLoginAt: null, role: null },
    { name: 'Борис', disabledAt: null, lastLoginAt: ENTERED_AT, role: { name: 'Наблюдатель' } },
];

/**
 * Двойник хранилища. Порядок он исполняет сам: выборка просит его по имени, и двойник, отдающий
 * набор как лежит, зеленел бы при любом порядке в запросе.
 */
function prismaDouble(rows: IStoredAccount[] = STORED): PrismaService {
    const account: { findMany: (args: { orderBy?: { name?: string } }) => Promise<IStoredAccount[]> } = {
        findMany: async ({ orderBy }: { orderBy?: { name?: string } }): Promise<IStoredAccount[]> => {
            if (orderBy?.name !== 'asc') {
                return [...rows];
            }

            return [...rows].sort((a: IStoredAccount, b: IStoredAccount): number => a.name.localeCompare(b.name, 'ru'));
        },
    };

    return { account } as unknown as PrismaService;
}

describe('AccountsReadController', (): void => {
    it('SC-MB-324 — список отдаёт имя, роль, состояние и время последнего входа', async (): Promise<void> => {
        const rows: IPersonRow[] = await new AccountsReadController(prismaDouble()).page();

        expect(rows.map((row: IPersonRow): string => row.name)).toEqual(['Андрей', 'Борис', 'Ольга']);
        expect(rows[2]).toEqual({ name: 'Ольга', role: 'Владелец', disabledAt: null, lastLoginAt: ENTERED_AT });
    });

    it('SC-MB-324 — у записи без роли роль пуста, а словами её называет экран', async (): Promise<void> => {
        // Утверждение о пустоте идёт в паре с положительным: у соседней записи роль на месте.
        const rows: IPersonRow[] = await new AccountsReadController(prismaDouble()).page();

        expect(rows[1].role).toBe('Наблюдатель');
        expect(rows[0].role).toBeNull();
    });

    it('SC-MB-324 — отключённая запись и запись без входов отдают свои пустоты, а не пропадают', async (): Promise<void> => {
        const rows: IPersonRow[] = await new AccountsReadController(prismaDouble()).page();

        expect(rows[0]).toEqual({ name: 'Андрей', role: null, disabledAt: DISABLED_AT, lastLoginAt: null });
    });

    it('SC-MB-324 — записей нет: список пуст, а не отказ', async (): Promise<void> => {
        // Пустое хранилище — законное состояние свежей службы, и отказ на него читался бы поломкой.
        expect(await new AccountsReadController(prismaDouble([])).page()).toEqual([]);
    });

    it('SC-MB-326 — операция закрыта правом `accounts:read`, а не одним входом', (): void => {
        // Вид доступа «permission» — это и есть та развилка, на которой отказ без входа отвечает
        // одно, а отказ без права другое: объявленный видом «session» отвечал бы обоим одинаково.
        const handler: () => void = AccountsReadController.prototype.page;

        expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
        expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('accounts:read');
    });
});
