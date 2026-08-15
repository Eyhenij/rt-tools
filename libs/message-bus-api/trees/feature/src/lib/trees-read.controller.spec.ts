import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeChoice } from '@rt/message-bus-common';

import { TreesReadController } from './trees-read.controller';

/** Дерево в хранилище: у него есть и то, чего отбор не показывает. */
interface IStoredTree {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
}

/**
 * Двойник хранилища: порядок и набор полей он делает сам.
 *
 * Набор полей особенно — утверждение «наружу уходит имя с признаком, а не строка хранилища»
 * доказывает что-то только тогда, когда двойник честно отдаёт ровно запрошенное.
 */
class PrismaDouble {
    readonly #rows: readonly IStoredTree[];

    constructor(rows: readonly IStoredTree[]) {
        this.#rows = rows;
    }

    public get tree(): { findMany: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findMany: async (args: Record<string, unknown>): Promise<unknown> => {
                const select: Record<string, unknown> = (args['select'] ?? {}) as Record<string, unknown>;
                const sorted: IStoredTree[] = [...this.#rows].sort((left: IStoredTree, right: IStoredTree): number =>
                    left.name.localeCompare(right.name)
                );

                return sorted.map((row: IStoredTree): Record<string, unknown> => {
                    const taken: Record<string, unknown> = {};

                    for (const field of Object.keys(select)) {
                        taken[field] = Reflect.get(row, field);
                    }

                    return taken;
                });
            },
        };
    }
}

/** Хранилище: два дерева, заведённые не в том порядке, в котором их называет отбор. */
function storage(): PrismaService {
    return new PrismaDouble([
        { id: 'id-2', slug: 'other-tree', name: 'Чужое дерево' },
        { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' },
    ]) as unknown as PrismaService;
}

function controller(): TreesReadController {
    return new TreesReadController(storage());
}

describe('TreesReadController.all', () => {
    it('SC-MB-68 — отбор получает деревья именами и признаками сразу', async () => {
        const named: ITreeChoice[] = await controller().all();

        expect(named).toEqual([
            { slug: 'own-tree', name: 'Своё дерево' },
            { slug: 'other-tree', name: 'Чужое дерево' },
        ]);
    });

    it('SC-MB-68 — строки хранилища наружу не уходят: в ответе только признак и имя', async () => {
        const named: ITreeChoice[] = await controller().all();

        expect(named[0]).toHaveProperty('slug');
        expect(named[0]).not.toHaveProperty('id');
    });
});
