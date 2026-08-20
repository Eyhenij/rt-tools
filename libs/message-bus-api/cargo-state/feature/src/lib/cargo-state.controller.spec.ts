import { BadRequestException, Logger } from '@nestjs/common';
import { describe, expect, it, MockInstance, vi } from 'vitest';

import { OPERATION_ACCESS, TOperationAccess } from '@rt/message-bus-api/access/util';
import { ECargoStateDenial, ICargoStateResponse } from '@rt/message-bus-api/cargo-state/api';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { ECargoState, TCargoBody } from '@rt/message-bus-common';

import { CargoStateController } from './cargo-state.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };
const NEIGHBOUR: IRequestTree = { id: 'id-2', slug: 'other-tree', name: 'Соседнее дерево' };

interface IStored {
    treeId: string;
    key: string;
    state: ECargoState;
}

/**
 * Двойник хранилища: обе таблицы груза одной формой — дерево, ключ и состояние.
 *
 * Ключ у разбора и у предложения зовётся по-разному, поэтому отбор идёт по имени поля, которое
 * назвал запрос: двойник, зашивший одно имя, отвечал бы верно только одному роду.
 */
class PrismaDouble {
    public readonly postmortems: IStored[] = [];
    public readonly proposals: IStored[] = [];

    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return this.#tableOf(this.postmortems, 'file');
    }

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return this.#tableOf(this.proposals, 'digest');
    }

    /** Сделка двойника: команды приезжают уже собранными обещаниями и ждутся по очереди. */
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
                    found.state = (args['data'] as { state: ECargoState }).state;
                }

                return { id: `${key['treeId']}:${key[keyField]}` };
            },
        };
    }
}

function requestOf(tree: IRequestTree = TREE): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, tree);

    return request;
}

function packet(items: TCargoBody[]): TCargoBody {
    return { schema: '1', tree: TREE.slug, items };
}

function controllerWith(prisma: PrismaDouble): CargoStateController {
    return new CargoStateController(prisma as unknown as PrismaService);
}

describe('CargoStateController', () => {
    it('SC-MB-172 — дерево переводит свою запись в следующее состояние', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(answer).toEqual({ tree: TREE.slug, changed: 1, same: 0, denied: [] });
    });

    it('SC-MB-173 — пакет правит записи обоих родов за один запрос', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });
        prisma.proposals.push({ treeId: TREE.id, key: 'digest-1', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                { kind: 'proposal', key: 'digest-1', state: 'in_work' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(prisma.proposals[0].state).toBe(ECargoState.InWork);
        expect(answer.changed).toBe(2);
        expect(answer.denied).toEqual([]);
    });

    it('SC-MB-175 — прыжок через шаг отбивает строку, а не пакет', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });
        prisma.postmortems.push({ treeId: TREE.id, key: 'b.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                { kind: 'postmortem', key: 'b.md', state: 'released' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(prisma.postmortems[1].state).toBe(ECargoState.New);
        expect(answer.changed).toBe(1);
        expect(answer.denied).toEqual([{ at: 1, kind: 'postmortem', key: 'b.md', denial: ECargoStateDenial.Forbidden }]);
    });

    it('SC-MB-176 — правка в то же состояние считается своим числом и не отбивается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(answer).toEqual({ tree: TREE.slug, changed: 0, same: 1, denied: [] });
    });

    it('SC-MB-177 — запись другого дерева отвечает так же, как ненайденная', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: NEIGHBOUR.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(answer.changed).toBe(0);
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.Missing }]);
    });

    it('SC-MB-179 — незнакомое состояние отбивает запрос целиком и хранилища не касается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        await expect(
            controllerWith(prisma).move(
                packet([
                    { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                    { kind: 'postmortem', key: 'b.md', state: 'разобрано наполовину' },
                ]),
                requestOf()
            )
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
    });

    it('SC-MB-179 — пустой пакет отбивается по форме', async () => {
        await expect(controllerWith(new PrismaDouble()).move(packet([]), requestOf())).rejects.toBeInstanceOf(BadRequestException);
    });

    it('SC-MB-178 — правка объявлена операцией дерева: без токена её отбивает страж входа', () => {
        const access: TOperationAccess | undefined = Reflect.getMetadata(OPERATION_ACCESS, CargoStateController.prototype.move);

        expect(access).toBe('tree');
    });

    it('SC-MB-180 — отбитая строка попадает в журнал приёмника без токена и текста записи', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: NEIGHBOUR.id, key: 'a.md', state: ECargoState.New });
        const written: unknown[][] = [];
        const warn: MockInstance = vi.spyOn(Logger.prototype, 'warn').mockImplementation((...tail: unknown[]): void => {
            written.push(tail);
        });

        try {
            await controllerWith(prisma).move(packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]), requestOf());
        } finally {
            warn.mockRestore();
        }

        expect(written).toHaveLength(1);
        expect(written[0][0]).toBe('intake.state.denied');
        expect(written[0][1]).toEqual({ tree: TREE.slug, kind: 'postmortem', denial: ECargoStateDenial.Missing });
        // Отрицательное утверждение идёт в паре с положительным: сперва строка найдена, и только
        // потом сказано, чего в ней нет
        expect(JSON.stringify(written[0])).not.toContain('a.md');
    });
});
