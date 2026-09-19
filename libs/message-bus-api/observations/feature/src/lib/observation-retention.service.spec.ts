import { Logger } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { IObservationsSwept } from '@rt/message-bus-api/observations/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { ObservationRetentionService } from './observation-retention.service';

const NOW: Date = new Date('2026-09-14T03:10:00Z');

interface IStoredRow {
    readonly treeId: string;
    readonly day: string;
}

/** Двойник хранилища: строки с деревом и днём, группировка и снятие по дню — сам. */
function storage(rows: IStoredRow[], failing: boolean = false): PrismaService {
    const older: (where: Record<string, unknown>) => IStoredRow[] = (where: Record<string, unknown>): IStoredRow[] => {
        const since: string = (where['day'] as { lt: string }).lt;

        return rows.filter(
            (row: IStoredRow): boolean =>
                row.day.localeCompare(since) < 0 && (where['treeId'] === undefined || row.treeId === where['treeId'])
        );
    };

    return {
        observation: {
            findMany: async (args: Record<string, unknown>): Promise<unknown[]> => {
                if (failing) {
                    throw new Error('the storage is unavailable');
                }
                const trees: string[] = [];

                for (const row of older(args['where'] as Record<string, unknown>)) {
                    if (!trees.includes(row.treeId)) {
                        trees.push(row.treeId);
                    }
                }

                return trees.map((treeId: string): unknown => ({ treeId }));
            },
            deleteMany: async (args: Record<string, unknown>): Promise<{ count: number }> => {
                const gone: IStoredRow[] = older(args['where'] as Record<string, unknown>);
                rows.splice(0, rows.length, ...rows.filter((row: IStoredRow): boolean => !gone.includes(row)));

                return { count: gone.length };
            },
        },
    } as unknown as PrismaService;
}

/** Журнал: строки уходят логгером каркаса, спека читает их с его прототипа вместе с полями. */
function journal(): { text: string; fields: unknown }[] {
    const written: { text: string; fields: unknown }[] = [];
    const keep: (message: unknown, ...tail: unknown[]) => void = (message: unknown, ...tail: unknown[]): void => {
        written.push({ text: String(message), fields: tail.find((one: unknown): boolean => typeof one === 'object') });
    };

    vi.spyOn(Logger.prototype, 'log').mockImplementation(keep);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(keep);

    return written;
}

afterEach((): void => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('ObservationRetentionService', () => {
    it('SC-MB-342 — строки старше года сняты по деревьям, сегодняшние остались, журнал — строка на дерево', async () => {
        const rows: IStoredRow[] = [
            { treeId: 'tree-1', day: '2025-01-01' },
            { treeId: 'tree-1', day: '2025-09-13' },
            { treeId: 'tree-2', day: '2025-06-01' },
            { treeId: 'tree-1', day: '2026-09-14' },
        ];
        const written: { text: string; fields: unknown }[] = journal();

        const swept: readonly IObservationsSwept[] = await new ObservationRetentionService(storage(rows)).sweep(NOW);

        expect(swept).toEqual([
            { treeId: 'tree-1', count: 2 },
            { treeId: 'tree-2', count: 1 },
        ]);
        expect(rows).toEqual([{ treeId: 'tree-1', day: '2026-09-14' }]);
        expect(written.map((one: { text: string; fields: unknown }): unknown => one.fields)).toEqual([
            { treeId: 'tree-1', count: 2, since: '2025-09-14' },
            { treeId: 'tree-2', count: 1, since: '2025-09-14' },
        ]);
    });

    it('SC-MB-342 — нечего снимать — одна строка журнала о том, что старше срока нет', async () => {
        const written: { text: string; fields: unknown }[] = journal();

        await new ObservationRetentionService(storage([{ treeId: 'tree-1', day: '2026-09-14' }])).sweep(NOW);

        expect(written).toHaveLength(1);
        expect(written[0].text).toContain('старше срока нет');
    });

    it('SC-MB-342 — отказ хранилища — строка журнала, а не падение', async () => {
        const written: { text: string; fields: unknown }[] = journal();

        const swept: readonly IObservationsSwept[] = await new ObservationRetentionService(storage([], true)).sweep(NOW);

        expect(swept).toEqual([]);
        expect(written).toHaveLength(1);
        expect(written[0].text).toContain('не состоялось');
    });

    it('SC-MB-342 — таймер взводится до ближайшего ночного часа и снимает по нему', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-14T01:00:00Z'));
        const rows: IStoredRow[] = [{ treeId: 'tree-1', day: '2025-01-01' }];
        journal();
        const service: ObservationRetentionService = new ObservationRetentionService(storage(rows));

        const at: Date = service.arm();
        expect(at.toISOString()).toBe('2026-09-14T03:10:00.000Z');

        await vi.advanceTimersByTimeAsync(at.getTime() - Date.now());

        expect(rows).toEqual([]);
        service.onApplicationShutdown();
    });
});
