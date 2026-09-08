import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { IMonthRecordFullRow, IMonthRecordListRow } from '@rt/message-bus-api/observations/data-access';
import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage } from '@rt/message-bus-common';

import { SummariesReadController } from './summaries-read.controller';

/** Запись месяца в хранилище: сводка лежит телом произвольной формы и бывает пустой. */
interface IStoredMonthRecord {
    readonly id: string;
    readonly month: string;
    readonly schema: string;
    readonly ranAt: Date;
    readonly summary: unknown;
    readonly tree: { readonly slug: string; readonly name: string };
}

const OWN: { slug: string; name: string } = { slug: 'own-tree', name: 'Своё дерево' };
const OTHER: { slug: string; name: string } = { slug: 'other-tree', name: 'Чужое дерево' };

/** Время первого прогона. Час стоит в прошлом: часы машины не читаются. */
const FIRST_RUN: Date = new Date('2026-08-03T08:00:00Z');

function selectOf(args: Record<string, unknown>): Record<string, unknown> {
    return (args['select'] ?? {}) as Record<string, unknown>;
}

/** Ровно те поля, что названы в `select`, — вложенные тоже. */
function projected(row: object, select: Record<string, unknown>): Record<string, unknown> {
    const taken: Record<string, unknown> = {};

    for (const field of Object.keys(select)) {
        const asked: unknown = select[field];
        const value: unknown = Reflect.get(row, field);

        if (asked === true) {
            taken[field] = value;
        } else if (typeof asked === 'object' && asked !== null && typeof value === 'object' && value !== null) {
            taken[field] = projected(value, (Reflect.get(asked, 'select') ?? {}) as Record<string, unknown>);
        }
    }

    return taken;
}

/**
 * Двойник хранилища.
 *
 * Отбор, порядок и набор полей он делает сам: спека обещает то, что приёмник отдаёт человеку, а
 * не форму запроса, которую он собрал.
 */
class PrismaDouble {
    readonly #rows: readonly IStoredMonthRecord[];

    constructor(rows: readonly IStoredMonthRecord[]) {
        this.#rows = rows;
    }

    public get monthRecord(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            count: async (args: Record<string, unknown>): Promise<unknown> => this.#picked(args).length,
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#page(args),
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#one(args),
        };
    }

    #picked(args: Record<string, unknown>): IStoredMonthRecord[] {
        const where: { tree?: { slug: string } } = args['where'] ?? {};
        const slug: string | undefined = where.tree?.slug;

        return this.#rows.filter((row: IStoredMonthRecord): boolean => !slug || row.tree.slug === slug);
    }

    #page(args: Record<string, unknown>): Record<string, unknown>[] {
        const skip: number = Number(args['skip'] ?? 0);
        const take: number = Number(args['take'] ?? this.#rows.length);
        const sorted: IStoredMonthRecord[] = [...this.#picked(args)].sort(
            (left: IStoredMonthRecord, right: IStoredMonthRecord): number => right.ranAt.getTime() - left.ranAt.getTime()
        );

        return sorted.slice(skip, skip + take).map((row: IStoredMonthRecord): Record<string, unknown> => projected(row, selectOf(args)));
    }

    #one(args: Record<string, unknown>): Record<string, unknown> | null {
        const where: { id?: string } = args['where'] ?? {};
        const found: IStoredMonthRecord | undefined = this.#rows.find((row: IStoredMonthRecord): boolean => row.id === where.id);

        return found ? projected(found, selectOf(args)) : null;
    }
}

/**
 * Хранилище: три записи месяца.
 *
 * У свежей сводки нет вовсе — запись завёл другой род груза; у второй сводка со счётчиками; у
 * третьей счётчик заходов приехал не числом, и такую строку показывать числом нечем.
 */
function storage(): PrismaService {
    const rows: IStoredMonthRecord[] = [
        {
            id: 'mr-3',
            month: '2026-08',
            schema: '1',
            ranAt: new Date(FIRST_RUN.getTime() + 120_000),
            summary: null,
            tree: OTHER,
        },
        {
            id: 'mr-2',
            month: '2026-08',
            schema: '1',
            ranAt: new Date(FIRST_RUN.getTime() + 60_000),
            summary: { schema: '1', tree: 'own-tree', sessions: 42, loads: 7, unused: ['правило-без-загрузки'] },
            tree: OWN,
        },
        {
            id: 'mr-1',
            month: '2026-07',
            schema: '1',
            ranAt: FIRST_RUN,
            summary: { schema: '1', tree: 'own-tree', sessions: 'много' },
            tree: OWN,
        },
    ];

    return new PrismaDouble(rows) as unknown as PrismaService;
}

function controller(): SummariesReadController {
    return new SummariesReadController(storage());
}

describe('SummariesReadController.page', () => {
    it('SC-MB-62 — страница несёт строки и общее число записей', async () => {
        const answered: IPage<IMonthRecordListRow> = await controller().page({ size: '2' });

        expect(answered.rows).toHaveLength(2);
        expect(answered).toMatchObject({ page: 1, size: 2, total: 3 });
    });

    it('SC-MB-53 — строка списка несёт месяц и число заходов, а сводки целиком не несёт', async () => {
        const answered: IPage<IMonthRecordListRow> = await controller().page({});
        const row: IMonthRecordListRow | undefined = answered.rows.find((each: IMonthRecordListRow): boolean => each.id === 'mr-2');

        expect(row).toMatchObject({ month: '2026-08', sessions: 42 });
        expect(row).not.toHaveProperty('summary');
    });

    it('SC-MB-53 — месяц без сводки называет число заходов пустым, а не нулём', async () => {
        const answered: IPage<IMonthRecordListRow> = await controller().page({});
        const row: IMonthRecordListRow | undefined = answered.rows.find((each: IMonthRecordListRow): boolean => each.id === 'mr-3');

        expect(row?.sessions).toBeNull();
    });

    it('SC-MB-53 — счётчик, приехавший не числом, числом не показывается', async () => {
        const answered: IPage<IMonthRecordListRow> = await controller().page({});
        const row: IMonthRecordListRow | undefined = answered.rows.find((each: IMonthRecordListRow): boolean => each.id === 'mr-1');

        expect(row?.sessions).toBeNull();
    });

    it('SC-MB-68 — отбор по признаку дерева сужает и строки, и общее число', async () => {
        const answered: IPage<IMonthRecordListRow> = await controller().page({ tree: 'own-tree' });

        expect(answered.total).toBe(2);
        expect(answered.rows.every((row: IMonthRecordListRow): boolean => row.tree.slug === 'own-tree')).toBe(true);
    });
});

describe('SummariesReadController.one', () => {
    it('SC-MB-52 — чтение одной записи несёт сводку целиком', async () => {
        const found: IMonthRecordFullRow = await controller().one('mr-2');

        expect(found).toMatchObject({ id: 'mr-2', month: '2026-08', sessions: 42 });
        expect(found.summary).toEqual({ schema: '1', tree: 'own-tree', sessions: 42, loads: 7, unused: ['правило-без-загрузки'] });
    });

    it('SC-MB-71 — записи, которой нет, отвечает отказ, а не пустая запись', async () => {
        await expect(controller().one('mr-нет-такой')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('SC-MB-304 — список сводок закрыт правом чтения своего раздела, а не одним лишь входом', () => {
        // Скрытый пункт меню при открытой операции закрывает раздел лишь на вид: данные
        // отдаются по прямому запросу любому вошедшему.
        const access: unknown = Reflect.getMetadata(OPERATION_ACCESS, SummariesReadController.prototype.page);
        const right: unknown = Reflect.getMetadata(OPERATION_RIGHT, SummariesReadController.prototype.page);

        expect(access).toBe('permission');
        expect(right).toBe('summaries:read');
    });
});
