import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { TCargoBody } from '@rt/message-bus-common';

import { ensureMonthRecord, IMonthRecordWritten, writeMonthSummary } from './month-record.queries';

const TREE_ID: string = 'id-1';
const MONTH: string = '2026-08';

interface IRecordRow {
    id: string;
    treeId: string;
    month: string;
    summary: TCargoBody | null;
    schema: string;
    ranAt: Date;
}

/**
 * Двойник хранилища: пара «дерево — месяц» у него уникальна, как и в базе, и `upsert` он делает
 * сам. Проверять собранный запрос вместо строк значило бы проверять форму вызова, а сценарии
 * обещают, что лежит в записи после прогона.
 */
class PrismaDouble {
    public readonly rows: IRecordRow[] = [];

    #nextId: number = 1;

    public get monthRecord(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#found(args) ?? null,
            upsert: async (args: Record<string, unknown>): Promise<{ id: string }> => this.#upsert(args),
        };
    }

    #found(args: Record<string, unknown>): IRecordRow | undefined {
        const key: { treeId: string; month: string } = (args['where'] as { treeId_month: { treeId: string; month: string } }).treeId_month;

        return this.rows.find((row: IRecordRow): boolean => row.treeId === key.treeId && row.month === key.month);
    }

    #upsert(args: Record<string, unknown>): { id: string } {
        const found: IRecordRow | undefined = this.#found(args);

        if (found) {
            Object.assign(found, args['update']);

            return { id: found.id };
        }

        const created: IRecordRow = {
            id: `record-${this.#nextId++}`,
            summary: null,
            ...(args['create'] as Omit<IRecordRow, 'id'>),
        };
        this.rows.push(created);

        return { id: created.id };
    }
}

/** Что принимает запись сводки: голова прогона и её тело. */
interface IMonthSummaryInput {
    readonly treeId: string;
    readonly month: string;
    readonly summary: TCargoBody;
    readonly schema: string;
    readonly ranAt: Date;
}

function summary(total: number): TCargoBody {
    return { schema: '1', tree: 'own-tree', total, days: 7, overrides: [] };
}

describe('writeMonthSummary', () => {
    it('SC-MB-1 — первая сводка месяца заводит запись', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const written: IMonthRecordWritten = await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(42),
            schema: '1',
            ranAt: new Date('2026-08-14T10:00:00Z'),
        });

        expect(written).toEqual({ id: 'record-1', month: MONTH, created: true });
        expect(prisma.rows).toHaveLength(1);
        expect(prisma.rows[0].summary).toEqual(summary(42));
    });

    it('SC-MB-2 — второй прогон замещает сводку, а не складывает её с прежней', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const first: IMonthRecordWritten = await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(42),
            schema: '1',
            ranAt: new Date('2026-08-14T10:00:00Z'),
        });

        const second: IMonthRecordWritten = await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(7),
            schema: '1',
            ranAt: new Date('2026-08-14T18:00:00Z'),
        });

        expect(second).toEqual({ id: first.id, month: MONTH, created: false });
        expect(prisma.rows).toHaveLength(1);
        expect(prisma.rows[0].summary).toEqual(summary(7));
    });

    it('SC-MB-24 — запись месяца помнит время последнего прогона', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const today: Date = new Date('2026-08-14T09:00:00Z');

        await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(1),
            schema: '1',
            ranAt: new Date('2026-08-13T09:00:00Z'),
        });
        await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(2),
            schema: '1',
            ranAt: today,
        });

        expect(prisma.rows[0].ranAt).toEqual(today);
    });

    it('SC-MB-11 — версия схемы сохраняется при записи как приехала', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(1),
            schema: '99',
            ranAt: new Date('2026-08-14T09:00:00Z'),
        });

        expect(prisma.rows[0].schema).toBe('99');
    });

    it('SC-MB-23 — два прогона, начавшие с пустого месяца, оставляют одну запись', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const input: (total: number, at: string) => IMonthSummaryInput = (total: number, at: string): IMonthSummaryInput => ({
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(total),
            schema: '1',
            ranAt: new Date(at),
        });

        const [first, second]: IMonthRecordWritten[] = await Promise.all([
            writeMonthSummary(prisma as unknown as PrismaService, input(1, '2026-08-14T10:00:00Z')),
            writeMonthSummary(prisma as unknown as PrismaService, input(2, '2026-08-14T10:00:01Z')),
        ]);

        expect(prisma.rows).toHaveLength(1);
        expect(first.month).toBe(MONTH);
        expect(second.month).toBe(MONTH);
        // В записи стоит сводка того, кто дошёл до неё вторым: замещение — правило записи месяца
        expect(prisma.rows[0].summary).toEqual(summary(2));
    });
});

describe('ensureMonthRecord', () => {
    it('SC-MB-22 — груз, приехавший раньше сводки, заводит запись месяца сам', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const written: IMonthRecordWritten = await ensureMonthRecord(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            schema: '1',
            ranAt: new Date('2026-08-14T10:00:00Z'),
        });

        expect(written.created).toBe(true);
        expect(prisma.rows).toHaveLength(1);
        expect(prisma.rows[0].summary).toBeNull();
    });

    it('SC-MB-21 — груз, приехавший после сводки, её не стирает', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(42),
            schema: '1',
            ranAt: new Date('2026-08-14T10:00:00Z'),
        });
        const written: IMonthRecordWritten = await ensureMonthRecord(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            schema: '1',
            ranAt: new Date('2026-08-14T11:00:00Z'),
        });

        expect(written.created).toBe(false);
        expect(prisma.rows[0].summary).toEqual(summary(42));
    });

    it('SC-MB-24 — время прогона сдвигается и грузом, который сводкой не является', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const later: Date = new Date('2026-08-14T11:00:00Z');

        await writeMonthSummary(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            summary: summary(42),
            schema: '1',
            ranAt: new Date('2026-08-14T10:00:00Z'),
        });
        await ensureMonthRecord(prisma as unknown as PrismaService, {
            treeId: TREE_ID,
            month: MONTH,
            schema: '1',
            ranAt: later,
        });

        expect(prisma.rows[0].ranAt).toEqual(later);
    });
});
