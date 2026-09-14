import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import {
    IObservationDayInput,
    IObservationRowInput,
    IObservationsSwept,
    IObservationsWritten,
    replaceObservationDays,
    sweepObservationsBefore,
} from './observation.queries';

const TREE: string = 'tree-1';
const OTHER_TREE: string = 'tree-2';
const COPY_A: string = 'origin-a';
const COPY_B: string = 'origin-b';
const DAY: string = '2026-08-12';

type TStoredRow = IObservationRowInput & { readonly id: string };

/**
 * Двойник хранилища: держит строки, снимает по условию и группирует по дереву сам. Сделка у него
 * — последовательный прогон уже вызванных операций: порядок «снять, потом положить» виден по
 * тому, что легло.
 */
class PrismaDouble {
    public readonly rows: TStoredRow[] = [];

    #nextId: number = 1;

    public get observation(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            deleteMany: async (args: Record<string, unknown>): Promise<{ count: number }> => this.#deleteMany(args),
            createMany: async (args: Record<string, unknown>): Promise<{ count: number }> => this.#createMany(args),
            groupBy: async (args: Record<string, unknown>): Promise<unknown[]> => this.#groupBy(args),
        };
    }

    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #matches(row: TStoredRow, where: Record<string, unknown>): boolean {
        const day: unknown = where['day'];

        if (typeof day === 'object' && day !== null && 'lt' in day) {
            return row.day.localeCompare(String((day as { lt: string }).lt)) < 0;
        }

        return ['treeId', 'origin', 'day'].every(
            (key: string): boolean => where[key] === undefined || Reflect.get(row, key) === where[key]
        );
    }

    #deleteMany(args: Record<string, unknown>): { count: number } {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
        const before: number = this.rows.length;
        const kept: TStoredRow[] = this.rows.filter((row: TStoredRow): boolean => !this.#matches(row, where));
        this.rows.splice(0, this.rows.length, ...kept);

        return { count: before - kept.length };
    }

    #createMany(args: Record<string, unknown>): { count: number } {
        const data: readonly IObservationRowInput[] = args['data'] as readonly IObservationRowInput[];

        for (const row of data) {
            this.rows.push({ ...row, id: `row-${this.#nextId++}` });
        }

        return { count: data.length };
    }

    #groupBy(args: Record<string, unknown>): unknown[] {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
        const counts: Map<string, number> = new Map<string, number>();

        for (const row of this.rows.filter((one: TStoredRow): boolean => this.#matches(one, where))) {
            counts.set(row.treeId, (counts.get(row.treeId) ?? 0) + 1);
        }

        return [...counts.entries()].map(([treeId, count]: [string, number]): unknown => ({ treeId, _count: { _all: count } }));
    }
}

function row(treeId: string, origin: string, day: string, res: string): IObservationRowInput {
    return {
        treeId,
        origin,
        day,
        t: new Date(`${day}T10:00:00Z`),
        ev: 'skill-load',
        res,
        kind: null,
        skill: 'rule',
        sid: '1',
        v: '0.27.0',
    };
}

function dayOf(treeId: string, origin: string, day: string, names: readonly string[]): IObservationDayInput {
    return { treeId, origin, day, rows: names.map((name: string): IObservationRowInput => row(treeId, origin, day, name)) };
}

function prismaOf(double: PrismaDouble): PrismaService {
    return double as unknown as PrismaService;
}

describe('строки наблюдений в хранилище', () => {
    it('SC-MB-338 — день одной копии замещается целиком', async () => {
        const double: PrismaDouble = new PrismaDouble();
        await replaceObservationDays(prismaOf(double), [dayOf(TREE, COPY_A, DAY, ['a', 'b', 'c'])]);

        const written: IObservationsWritten = await replaceObservationDays(prismaOf(double), [dayOf(TREE, COPY_A, DAY, ['d', 'e'])]);

        expect(written).toEqual({ days: 1, rows: 2 });
        expect(double.rows.map((one: TStoredRow): string => one.res)).toEqual(['d', 'e']);
    });

    it('SC-MB-339 — день другой копии того же дерева не трогается', async () => {
        const double: PrismaDouble = new PrismaDouble();
        await replaceObservationDays(prismaOf(double), [dayOf(TREE, COPY_A, DAY, ['a'])]);

        await replaceObservationDays(prismaOf(double), [dayOf(TREE, COPY_B, DAY, ['b'])]);

        expect(double.rows.map((one: TStoredRow): string => `${one.origin}:${one.res}`)).toEqual(['origin-a:a', 'origin-b:b']);
    });

    it('SC-MB-337 — дни груза ложатся строками, по строке на каждую', async () => {
        const double: PrismaDouble = new PrismaDouble();

        const written: IObservationsWritten = await replaceObservationDays(prismaOf(double), [
            dayOf(TREE, COPY_A, DAY, ['a', 'b', 'c']),
            dayOf(TREE, COPY_A, '2026-08-13', ['d']),
        ]);

        expect(written).toEqual({ days: 2, rows: 4 });
        expect(double.rows).toHaveLength(4);
        expect(double.rows[3]).toMatchObject({ treeId: TREE, origin: COPY_A, day: '2026-08-13', res: 'd', skill: 'rule', sid: '1' });
    });

    it('SC-MB-342 — строки старше границы снимаются по деревьям, сегодняшние остаются', async () => {
        const double: PrismaDouble = new PrismaDouble();
        await replaceObservationDays(prismaOf(double), [
            dayOf(TREE, COPY_A, '2025-01-01', ['a', 'b']),
            dayOf(OTHER_TREE, COPY_A, '2025-02-01', ['c']),
            dayOf(TREE, COPY_A, DAY, ['d']),
        ]);

        const swept: readonly IObservationsSwept[] = await sweepObservationsBefore(prismaOf(double), '2025-08-12');

        expect(swept).toEqual([
            { treeId: TREE, count: 2 },
            { treeId: OTHER_TREE, count: 1 },
        ]);
        expect(double.rows.map((one: TStoredRow): string => one.res)).toEqual(['d']);
    });

    it('SC-MB-342 — нечего снимать — ответ пуст, и снятие не зовётся', async () => {
        const double: PrismaDouble = new PrismaDouble();
        await replaceObservationDays(prismaOf(double), [dayOf(TREE, COPY_A, DAY, ['a'])]);

        const swept: readonly IObservationsSwept[] = await sweepObservationsBefore(prismaOf(double), '2025-08-12');

        expect(swept).toEqual([]);
        expect(double.rows).toHaveLength(1);
    });
});
