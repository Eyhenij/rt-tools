/**
 * Обвязка спек правки состояния: двойник хранилища и сборка вызова.
 *
 * Стоит отдельным файлом, потому что спек две — про приём починки и про версию выпуска, — а
 * двойник у них один: вторая копия разошлась бы с первой молча.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { ECargoState, TCargoBody } from '@rt/message-bus-common';

import { CargoStateController } from './cargo-state.controller';

export const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };
export const NEIGHBOUR: IRequestTree = { id: 'id-2', slug: 'other-tree', name: 'Соседнее дерево' };

export interface IStored {
    treeId: string;
    key: string;
    state: ECargoState;
    fixNote?: string | null;
    releaseVersion?: string | null;
}

/**
 * Двойник хранилища: обе таблицы груза одной формой — дерево, ключ и состояние.
 *
 * Ключ у разбора и у предложения зовётся по-разному, поэтому отбор идёт по имени поля, которое
 * назвал запрос: двойник, зашивший одно имя, отвечал бы верно только одному роду.
 */
export class PrismaDouble {
    public readonly postmortems: IStored[] = [];
    public readonly proposals: IStored[] = [];

    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return this.#tableOf(this.postmortems, 'file');
    }

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return this.#tableOf(this.proposals, 'digest');
    }

    /**
     * Сделка двойника: команды приезжают уже собранными обещаниями и ждутся по очереди.
     *
     * Имя со знаком доллара — не выбор двойника: так зовётся сделка у клиента хранилища, и
     * названный иначе метод домен просто не позовёт.
     */
    // eslint-disable-next-line sonarjs/function-name -- имя задано клиентом хранилища, а не этим двойником
    public async $transaction(operations: Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #tableOf(rows: IStored[], keyField: string): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findMany: async (args: Record<string, unknown>): Promise<Record<string, string>[]> => {
                const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
                const asked: string[] = (where[keyField] as { in: string[] }).in;

                return rows
                    .filter((row: IStored): boolean => row.treeId === where['treeId'] && asked.includes(row.key))
                    .map((row: IStored): Record<string, string> => ({ [keyField]: row.key, state: row.state }));
            },
            update: async (args: Record<string, unknown>): Promise<{ id: string }> => {
                const key: Record<string, string> = Object.values(args['where'] as Record<string, unknown>)[0] as Record<string, string>;
                const found: IStored | undefined = rows.find(
                    (row: IStored): boolean => row.treeId === key['treeId'] && row.key === key[keyField]
                );

                if (found) {
                    const data: { state: ECargoState; fixNote?: string; releaseVersion?: string } = args['data'] as {
                        state: ECargoState;
                        fixNote?: string;
                        releaseVersion?: string;
                    };

                    found.state = data.state;

                    if (data.fixNote !== undefined) {
                        found.fixNote = data.fixNote;
                    }

                    if (data.releaseVersion !== undefined) {
                        found.releaseVersion = data.releaseVersion;
                    }
                }

                return { id: `${key['treeId']}:${key[keyField]}` };
            },
        };
    }
}

export function requestOf(tree: IRequestTree = TREE): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, tree);

    return request;
}

export function packet(items: TCargoBody[]): TCargoBody {
    return { schema: '1', tree: TREE.slug, items };
}

export function controllerWith(prisma: PrismaDouble): CargoStateController {
    // eslint-disable-next-line no-restricted-syntax -- двойник повторяет ту часть клиента хранилища, которую зовёт домен, и его типом не является
    return new CargoStateController(prisma as unknown as PrismaService);
}
