import { Logger } from '@nestjs/common';
import { describe, expect, it, MockInstance, vi } from 'vitest';

import { OPERATION_ACCESS, TOperationAccess } from '@rt/message-bus-api/access/util';
import { IAccountBearingRequest, rememberAccount } from '@rt/message-bus-api/accounts/util';
import { ECargoStateDenial, ICargoCloseResponse, ICargoStateResponse } from '@rt/message-bus-api/cargo-state/api';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ECargoState, TCargoBody } from '@rt/message-bus-common';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';

import { CargoCloseController } from './cargo-close.controller';
import { CargoStateController } from './cargo-state.controller';

/** Дерево, приславшее записи: закрытие правит именно его записи, а токеном владеет оно само. */
const NEIGHBOUR: IRequestTree = { id: 'tree-1', slug: 'neighbour', name: 'Соседнее дерево' };

/** Запись груза у двойника: признак из чтения, ключ отправителя, дерево и то, что правит закрытие. */
interface IStored {
    id: string;
    treeId: string;
    tree: string;
    key: string;
    state: ECargoState;
    fixNote?: string | null;
    releaseVersion?: string | null;
    closedByPublisher?: boolean;
}

/**
 * Двойник хранилища: обе таблицы груза одной формой и оба пути к записи.
 *
 * Путей два потому, что их два и в дереве: закрытие ищет запись признаком из чтения, а правка
 * деревом — своим ключом внутри своего дерева. Двойник, знающий один путь, доказывал бы, что
 * второй операции нет вовсе, — а именно рядом их и надо увидеть.
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

    public async $transaction(operations: Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #tableOf(rows: IStored[], keyField: string): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findMany: async (args: Record<string, unknown>): Promise<unknown[]> => {
                const where: Record<string, unknown> = args['where'] as Record<string, unknown>;

                if (where['id'] !== undefined) {
                    const asked: string[] = (where['id'] as { in: string[] }).in;

                    return rows
                        .filter((row: IStored): boolean => asked.includes(row.id))
                        .map((row: IStored) => ({ id: row.id, state: row.state, tree: { slug: row.tree } }));
                }

                const asked: string[] = (where[keyField] as { in: string[] }).in;

                return rows
                    .filter((row: IStored): boolean => row.treeId === where['treeId'] && asked.includes(row.key))
                    .map((row: IStored) => ({ [keyField]: row.key, state: row.state }));
            },
            update: async (args: Record<string, unknown>): Promise<{ id: string }> => {
                const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
                const found: IStored | undefined = this.#found(rows, where, keyField);
                const data: Record<string, string | boolean> = args['data'] as Record<string, string | boolean>;

                if (found) {
                    found.state = data['state'] as ECargoState;
                    found.closedByPublisher = (data['closedByPublisher'] as boolean) ?? found.closedByPublisher;

                    if (data['fixNote'] !== undefined) {
                        found.fixNote = data['fixNote'] as string;
                    }

                    if (data['releaseVersion'] !== undefined) {
                        found.releaseVersion = data['releaseVersion'] as string;
                    }
                }

                return { id: found?.id ?? '' };
            },
        };
    }

    /** Запись, названная правкой: признаком из чтения либо парой «дерево и ключ отправителя». */
    #found(rows: IStored[], where: Record<string, unknown>, keyField: string): IStored | undefined {
        if (where['id'] !== undefined) {
            return rows.find((row: IStored): boolean => row.id === where['id']);
        }

        const pair: Record<string, string> = Object.values(where)[0] as Record<string, string>;

        return rows.find((row: IStored): boolean => row.treeId === pair['treeId'] && row.key === pair[keyField]);
    }
}

function controllerWith(prisma: PrismaDouble): CargoCloseController {
    return new CargoCloseController(prisma as unknown as PrismaService);
}

function stateControllerWith(prisma: PrismaDouble): CargoStateController {
    return new CargoStateController(prisma as unknown as PrismaService);
}

function requestOf(): IAccountBearingRequest {
    const request: IAccountBearingRequest = {};
    rememberAccount(request, { id: 'account-1', name: 'издатель', sessionId: 'session-1' });

    return request;
}

function treeRequestOf(): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, NEIGHBOUR);

    return request;
}

function packet(items: TCargoBody[]): TCargoBody {
    return { items };
}

describe('CargoCloseController', () => {
    it('SC-MB-269 — издатель закрывает запись чужого дерева, и приём починки на ней остаётся', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ id: 'p-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'digest-1', state: ECargoState.New });

        const answer: ICargoCloseResponse = await controllerWith(prisma).close(
            packet([{ kind: 'proposal', key: 'p-1', state: 'fixed', fixNote: 'статьёй правила' }]),
            requestOf()
        );

        expect(prisma.proposals[0].state).toBe(ECargoState.Fixed);
        expect(prisma.proposals[0].fixNote).toBe('статьёй правила');
        expect(answer).toEqual({ changed: 1, same: 0, denied: [] });
    });

    it('SC-MB-270 — закрытие объявлено операцией под входом человека, а не под токеном дерева', () => {
        const access: TOperationAccess | undefined = Reflect.getMetadata(OPERATION_ACCESS, CargoCloseController.prototype.close);

        expect(access).toBe('session');
    });

    it('SC-MB-271 — перевод в «в работе» отбивается: это состояние ставит дерево', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ id: 'p-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'digest-1', state: ECargoState.New });

        const answer: ICargoCloseResponse = await controllerWith(prisma).close(
            packet([{ kind: 'proposal', key: 'p-1', state: 'in_work' }]),
            requestOf()
        );

        expect(prisma.proposals[0].state).toBe(ECargoState.New);
        expect(answer.changed).toBe(0);
        expect(answer.denied).toEqual([{ at: 0, kind: 'proposal', key: 'p-1', denial: ECargoStateDenial.Forbidden }]);
    });

    it('SC-MB-272 — переход в выпуск без версии отбивает строку, а соседняя строка пакета проходит', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ id: 'p-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'digest-1', state: ECargoState.Fixed });
        prisma.postmortems.push({ id: 'm-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'a.md', state: ECargoState.Fixed });

        const answer: ICargoCloseResponse = await controllerWith(prisma).close(
            packet([
                { kind: 'proposal', key: 'p-1', state: 'released' },
                { kind: 'postmortem', key: 'm-1', state: 'released', releaseVersion: 'rt-agent-kit@0.17.0' },
            ]),
            requestOf()
        );

        expect(prisma.proposals[0].state).toBe(ECargoState.Fixed);
        expect(prisma.postmortems[0].state).toBe(ECargoState.Released);
        expect(answer.changed).toBe(1);
        expect(answer.denied).toEqual([{ at: 0, kind: 'proposal', key: 'p-1', denial: ECargoStateDenial.NoReleaseVersion }]);
    });

    it('SC-MB-273 — закрытая запись несёт признак того, что её закрыл издатель', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ id: 'm-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'a.md', state: ECargoState.Fixed });

        await controllerWith(prisma).close(
            packet([{ kind: 'postmortem', key: 'm-1', state: 'released', releaseVersion: 'rt-agent-kit@0.17.0' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].closedByPublisher).toBe(true);
    });

    it('SC-MB-269 — записи, которой в приёме нет, отвечает отбитая строка, а не отказ всему пакету', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const answer: ICargoCloseResponse = await controllerWith(prisma).close(
            packet([{ kind: 'proposal', key: 'p-404', state: 'fixed', fixNote: 'статьёй правила' }]),
            requestOf()
        );

        expect(answer.denied).toEqual([{ at: 0, kind: 'proposal', key: 'p-404', denial: ECargoStateDenial.Missing }]);
    });

    it('SC-MB-274 — закрытое издателем дерево двигает дальше само: второй путь заведён рядом с первым', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ id: 'p-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'digest-1', state: ECargoState.New });

        await controllerWith(prisma).close(
            packet([{ kind: 'proposal', key: 'p-1', state: 'fixed', fixNote: 'статьёй правила' }]),
            requestOf()
        );
        const answer: ICargoStateResponse = await stateControllerWith(prisma).move(
            {
                schema: '1',
                tree: NEIGHBOUR.slug,
                items: [{ kind: 'proposal', key: 'digest-1', state: 'released', releaseVersion: 'rt-agent-kit@0.17.0' }],
            },
            treeRequestOf()
        );

        expect(prisma.proposals[0].state).toBe(ECargoState.Released);
        expect(answer).toEqual({ tree: NEIGHBOUR.slug, changed: 1, same: 0, denied: [] });
    });

    it('SC-MB-275 — закрытие пишет в журнал, кто закрыл и чьи это деревья, без ключей и текстов', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ id: 'p-1', treeId: NEIGHBOUR.id, tree: NEIGHBOUR.slug, key: 'digest-1', state: ECargoState.Fixed });
        const written: unknown[][] = [];
        const told: MockInstance = vi.spyOn(Logger.prototype, 'log').mockImplementation((...tail: unknown[]): void => {
            written.push(tail);
        });

        await controllerWith(prisma).close(
            packet([{ kind: 'proposal', key: 'p-1', state: 'released', releaseVersion: 'rt-agent-kit@0.17.0' }]),
            requestOf()
        );
        told.mockRestore();

        expect(written).toEqual([['intake.close.applied', { account: 'издатель', changed: 1, same: 0, trees: ['neighbour'] }]]);
    });
});
