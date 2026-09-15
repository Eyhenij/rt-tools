import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPersonView } from '@rt/message-bus-common';

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
const LATER_AT: Date = new Date('2026-09-03T10:00:00Z');
const DISABLED_AT: Date = new Date('2026-09-02T10:00:00Z');

/**
 * Три записи разом: с ролью, без роли и отключённая, ни разу не входившая.
 *
 * Порядок нарочно не тот, в котором их ждёт ответ: выборка обязана расставить их сама, и набор,
 * лежащий уже расставленным, о порядке не сказал бы ничего.
 */
const STORED: IStoredAccount[] = [
    { name: 'Ольга', disabledAt: null, lastLoginAt: ENTERED_AT, role: { name: 'Владелец' } },
    { name: 'Андрей', disabledAt: DISABLED_AT, lastLoginAt: null, role: null },
    { name: 'Борис', disabledAt: null, lastLoginAt: LATER_AT, role: { name: 'Наблюдатель' } },
];

/** Ступень порядка, как её просит выборка: либо направление, либо направление с местом пустоты. */
type TOrderStep = Record<string, 'asc' | 'desc' | { sort: 'asc' | 'desc'; nulls: 'last' }>;

/** Что просит выборка страницы. */
interface IFindArgs {
    readonly orderBy: TOrderStep[];
    readonly skip: number;
    readonly take: number;
}

/** Значение поля для порядка. Пустота уезжает в конец — так же, как её кладёт хранилище. */
function keyOf(row: IStoredAccount, field: string): number | string | null {
    if (field === 'name') {
        return row.name;
    }

    return (field === 'disabledAt' ? row.disabledAt : row.lastLoginAt)?.getTime() ?? null;
}

/**
 * Двойник хранилища. Порядок и страницу он исполняет сам: выборка просит их доводами, и двойник,
 * отдающий набор как лежит, зеленел бы при любом запросе.
 */
function prismaDouble(rows: IStoredAccount[] = STORED): PrismaService {
    const account: {
        count: () => Promise<number>;
        findMany: (args: IFindArgs) => Promise<IStoredAccount[]>;
    } = {
        count: async (): Promise<number> => rows.length,
        findMany: async ({ orderBy, skip, take }: IFindArgs): Promise<IStoredAccount[]> => {
            const [first]: TOrderStep[] = orderBy;
            const [field]: string[] = Object.keys(first);
            const asked: 'asc' | 'desc' | { sort: 'asc' | 'desc'; nulls: 'last' } = first[field];
            const dir: 'asc' | 'desc' = typeof asked === 'string' ? asked : asked.sort;
            const sign: number = dir === 'asc' ? 1 : -1;

            const sorted: IStoredAccount[] = [...rows].sort((a: IStoredAccount, b: IStoredAccount): number => {
                const left: number | string | null = keyOf(a, field);
                const right: number | string | null = keyOf(b, field);

                // Пустота всегда в конце, каким бы ни было направление: так её кладёт запрос.
                if (left === null || right === null) {
                    return left === right ? 0 : left === null ? 1 : -1;
                }

                return left < right ? -sign : left > right ? sign : 0;
            });

            return sorted.slice(skip, skip + take);
        },
    };

    return { account } as unknown as PrismaService;
}

describe('AccountsReadController', (): void => {
    it('SC-MB-360 — список отдаёт имя, роль, состояние и время последнего входа', async (): Promise<void> => {
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble()).page({});

        // Умолчание порядка — последний вход, свежие сверху; не входившая запись уезжает в конец.
        expect(page.rows.map((row: IPersonView): string => row.name)).toEqual(['Борис', 'Ольга', 'Андрей']);
        expect(page.rows[1]).toEqual({
            name: 'Ольга',
            role: 'Владелец',
            disabledAt: null,
            lastLoginAt: ENTERED_AT.toISOString(),
        });
    });

    it('SC-MB-360 — у записи без роли роль пуста, а словами её называет экран', async (): Promise<void> => {
        // Утверждение о пустоте идёт в паре с положительным: у соседней записи роль на месте.
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble()).page({});

        expect(page.rows[0].role).toBe('Наблюдатель');
        expect(page.rows[2].role).toBeNull();
    });

    it('SC-MB-360 — отключённая запись и запись без входов отдают свои пустоты, а не пропадают', async (): Promise<void> => {
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble()).page({});

        expect(page.rows[2]).toEqual({
            name: 'Андрей',
            role: null,
            disabledAt: DISABLED_AT.toISOString(),
            lastLoginAt: null,
        });
    });

    it('SC-MB-360 — список приезжает страницей: строки, их общее число и сама выборка', async (): Promise<void> => {
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble()).page({ size: '20', sort: 'name', dir: 'asc' });

        expect(page.rows.map((row: IPersonView): string => row.name)).toEqual(['Андрей', 'Борис', 'Ольга']);
        expect(page).toMatchObject({ total: 3, page: 1, size: 20 });
    });

    it('SC-MB-360 — вторая страница отдаёт своё окно, а общее число остаётся числом всех', async (): Promise<void> => {
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble()).page({
            page: '2',
            size: '20',
            sort: 'name',
            dir: 'asc',
        });

        // Записей три, окно второй страницы начинается с двадцать первой — оно пусто, а всего три.
        expect(page.rows).toEqual([]);
        expect(page.total).toBe(3);
        expect(page.page).toBe(2);
    });

    it('SC-MB-360 — поле порядка вне набора отбивается отказом с именем параметра', async (): Promise<void> => {
        // Утверждение об отказе идёт в паре с положительным: поле из набора запрос принимает.
        await expect(new AccountsReadController(prismaDouble()).page({ sort: 'passwordHash' })).rejects.toBeInstanceOf(BadRequestException);
        await expect(new AccountsReadController(prismaDouble()).page({ sort: 'name' })).resolves.toBeDefined();
    });

    it('SC-MB-360 — записей нет: страница пуста, а не отказ', async (): Promise<void> => {
        // Пустое хранилище — законное состояние свежей службы, и отказ на него читался бы поломкой.
        const page: IPage<IPersonView> = await new AccountsReadController(prismaDouble([])).page({});

        expect(page.rows).toEqual([]);
        expect(page.total).toBe(0);
    });

    it('SC-MB-326 — операция закрыта правом `accounts:read`, а не одним входом', (): void => {
        // Вид доступа «permission» — это и есть та развилка, на которой отказ без входа отвечает
        // одно, а отказ без права другое: объявленный видом «session» отвечал бы обоим одинаково.
        const handler: () => void = AccountsReadController.prototype.page;

        expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
        expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('accounts:read');
    });
});
