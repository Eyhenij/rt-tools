import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { IMetricsDayInput, sweepMetricsDaysBefore, writeMetricsDay } from './metrics-day.queries';

type TWhere = Record<string, unknown>;

function line(stamp: number, sessions: number, over: Partial<IMetricsDayInput> = {}): IMetricsDayInput {
    return { treeId: 't1', origin: 'c1', day: '2026-11-07', version: '0.35.0', stamp: new Date(stamp), metrics: { sessions }, ...over };
}

/** Двойник таблицы: уникальность дерева, копии и дня держит сам. */
class PrismaDouble {
    public readonly rows: IMetricsDayInput[] = [];

    public get metricsDay(): Record<string, (args: TWhere) => Promise<{ count: number }>> {
        return {
            updateMany: async (args: TWhere): Promise<{ count: number }> => this.#update(args),
            createMany: async (args: TWhere): Promise<{ count: number }> => this.#create(args),
            deleteMany: async (args: TWhere): Promise<{ count: number }> => this.#delete(args),
        };
    }

    #same(left: IMetricsDayInput, right: TWhere): boolean {
        return left.treeId === right['treeId'] && left.origin === right['origin'] && left.day === right['day'];
    }

    #update(args: TWhere): { count: number } {
        const where: TWhere = args['where'] as TWhere;
        const edge: Date = (where['stamp'] as { lte: Date }).lte;
        const at: number = this.rows.findIndex((row: IMetricsDayInput): boolean => this.#same(row, where) && row.stamp <= edge);

        if (at < 0) {
            return { count: 0 };
        }
        this.rows[at] = { ...this.rows[at], ...(args['data'] as Partial<IMetricsDayInput>) };

        return { count: 1 };
    }

    #create(args: TWhere): { count: number } {
        const [row]: readonly IMetricsDayInput[] = args['data'] as readonly IMetricsDayInput[];

        if (this.rows.some((one: IMetricsDayInput): boolean => this.#same(one, row as unknown as TWhere))) {
            return { count: 0 };
        }
        this.rows.push(row);

        return { count: 1 };
    }

    #delete(args: TWhere): { count: number } {
        const edge: string = ((args['where'] as TWhere)['day'] as { lt: string }).lt;
        const before: number = this.rows.length;

        this.rows.splice(0, before, ...this.rows.filter((row: IMetricsDayInput): boolean => row.day >= edge));

        return { count: before - this.rows.length };
    }
}

function setup(): { readonly double: PrismaDouble; readonly prisma: PrismaService } {
    const double: PrismaDouble = new PrismaDouble();

    return { double, prisma: double as unknown as PrismaService };
}

describe('writeMetricsDay', () => {
    it('первая строка ложится', async () => {
        const { double, prisma } = setup();

        expect(await writeMetricsDay(prisma, line(100, 1))).toBe(true);
        expect(double.rows).toHaveLength(1);
    });

    it('повторная отправка той же строки итог не меняет', async () => {
        const { double, prisma } = setup();

        await writeMetricsDay(prisma, line(100, 1));

        expect(await writeMetricsDay(prisma, line(100, 1))).toBe(true);
        expect(double.rows).toHaveLength(1);
        expect(double.rows[0]?.metrics).toEqual({ sessions: 1 });
    });

    it('новая строка заменяет прежнюю', async () => {
        const { double, prisma } = setup();

        await writeMetricsDay(prisma, line(100, 1));
        await writeMetricsDay(prisma, line(200, 5));

        expect(double.rows).toHaveLength(1);
        expect(double.rows[0]?.metrics).toEqual({ sessions: 5 });
    });

    it('старая строка устарела и запись не меняет', async () => {
        const { double, prisma } = setup();

        await writeMetricsDay(prisma, line(200, 5));

        expect(await writeMetricsDay(prisma, line(100, 1))).toBe(false);
        expect(double.rows[0]?.metrics).toEqual({ sessions: 5 });
    });

    it('другая копия и другой день лежат рядом', async () => {
        const { double, prisma } = setup();

        await writeMetricsDay(prisma, line(100, 1));
        await writeMetricsDay(prisma, line(100, 2, { origin: 'c2' }));
        await writeMetricsDay(prisma, line(100, 3, { day: '2026-11-08' }));

        expect(double.rows).toHaveLength(3);
    });
});

describe('sweepMetricsDaysBefore', () => {
    it('снимает только дни раньше границы', async () => {
        const { double, prisma } = setup();

        await writeMetricsDay(prisma, line(100, 1, { day: '2025-11-06' }));
        await writeMetricsDay(prisma, line(100, 2, { day: '2025-11-07' }));

        expect(await sweepMetricsDaysBefore(prisma, '2025-11-07')).toBe(1);
        expect(double.rows.map((row: IMetricsDayInput): string => row.day)).toEqual(['2025-11-07']);
    });
});
