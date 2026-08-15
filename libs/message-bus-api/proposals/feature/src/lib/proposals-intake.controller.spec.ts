import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { IIntakeAccepted } from '@rt-tools/agent-kit/cargo';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { ProposalsIntakeController } from './proposals-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

interface IRecordRow {
    id: string;
    treeId: string;
    month: string;
    summary: TCargoBody | null;
    schema: string;
    ranAt: Date;
}

interface IProposalRowStored {
    recordId: string;
    treeId: string;
    text: string;
    digest: string;
    address: string;
    resource: string;
}

/**
 * Двойник хранилища: запись месяца и предложения к ней. Уникальность пары «дерево — признак» он
 * держит сам — ею же держится отбор уже приехавшего, и подделывать её проверкой в спеке значило
 * бы проверять не то правило.
 */
class PrismaDouble {
    public readonly records: IRecordRow[] = [];
    public readonly proposals: IProposalRowStored[] = [];

    public get monthRecord(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#found(args) ?? null,
            upsert: async (args: Record<string, unknown>): Promise<{ id: string }> => this.#upsert(args),
        };
    }

    public get proposal(): { createMany: (args: Record<string, unknown>) => Promise<{ count: number }> } {
        return {
            createMany: async (args: Record<string, unknown>): Promise<{ count: number }> => {
                const rows: IProposalRowStored[] = args['data'] as IProposalRowStored[];
                const fresh: IProposalRowStored[] = [];

                for (const row of rows) {
                    const seen: boolean = [...this.proposals, ...fresh].some(
                        (stored: IProposalRowStored): boolean => stored.treeId === row.treeId && stored.digest === row.digest
                    );

                    if (!seen) {
                        fresh.push(row);
                    }
                }
                this.proposals.push(...fresh);

                return { count: fresh.length };
            },
        };
    }

    #found(args: Record<string, unknown>): IRecordRow | undefined {
        const key: { treeId: string; month: string } = (args['where'] as { treeId_month: { treeId: string; month: string } }).treeId_month;

        return this.records.find((row: IRecordRow): boolean => row.treeId === key.treeId && row.month === key.month);
    }

    #upsert(args: Record<string, unknown>): { id: string } {
        const found: IRecordRow | undefined = this.#found(args);

        if (found) {
            Object.assign(found, args['update']);

            return { id: found.id };
        }

        const created: IRecordRow = {
            id: `record-${this.records.length + 1}`,
            summary: null,
            ...(args['create'] as Omit<IRecordRow, 'id'>),
        };
        this.records.push(created);

        return { id: created.id };
    }
}

class ResponseDouble implements IIntakeResponse {
    public code: number = 0;

    public status(code: number): unknown {
        this.code = code;

        return this;
    }
}

function requestOf(tree: IRequestTree = TREE): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, tree);

    return request;
}

function proposal(text: string): TCargoBody {
    return { text, address: 'пакет', resource: 'rules/testing.md' };
}

function cargo(items: TCargoBody[]): TCargoBody {
    return { schema: '1', tree: TREE.slug, items };
}

function controllerWith(prisma: PrismaDouble): ProposalsIntakeController {
    return new ProposalsIntakeController(prisma as unknown as PrismaService);
}

describe('ProposalsIntakeController', () => {
    it('SC-MB-22 — предложения, приехавшие раньше сводки, заводят запись месяца', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const accepted: IIntakeAccepted = await controllerWith(prisma).accept(
            cargo([proposal('первое')]),
            requestOf(),
            new ResponseDouble()
        );

        expect(accepted.created).toBe(true);
        expect(prisma.records).toHaveLength(1);
        expect(prisma.records[0].summary).toBeNull();
        expect(prisma.proposals).toHaveLength(1);
    });

    it('SC-MB-16 — уже приехавшее предложение второй раз не заводится', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ProposalsIntakeController = controllerWith(prisma);

        await controller.accept(cargo([proposal('первое'), proposal('второе')]), requestOf(), new ResponseDouble());
        await controller.accept(cargo([proposal('первое'), proposal('второе'), proposal('третье')]), requestOf(), new ResponseDouble());

        expect(prisma.proposals.map((row: IProposalRowStored): string => row.text)).toEqual(['первое', 'второе', 'третье']);
    });

    it('SC-MB-85 — то же предложение в новом месяце второй записью не становится', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ProposalsIntakeController = controllerWith(prisma);

        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date('2026-07-31T12:00:00Z'));
            await controller.accept(cargo([proposal('первое')]), requestOf(), new ResponseDouble());

            vi.setSystemTime(new Date('2026-08-01T12:00:00Z'));
            const accepted: IIntakeAccepted = await controller.accept(cargo([proposal('первое')]), requestOf(), new ResponseDouble());

            expect(prisma.records.map((row: IRecordRow): string => row.month)).toEqual(['2026-07', '2026-08']);
            expect(prisma.proposals).toHaveLength(1);
            expect(accepted.added).toBe(0);
            expect(accepted.known).toBe(1);
        } finally {
            vi.useRealTimers();
        }
    });

    it('SC-MB-81 — ответ приёма называет принятое и уже лежавшее', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ProposalsIntakeController = controllerWith(prisma);

        await controller.accept(cargo([proposal('первое'), proposal('второе')]), requestOf(), new ResponseDouble());
        const accepted: IIntakeAccepted = await controller.accept(
            cargo([proposal('первое'), proposal('второе'), proposal('третье')]),
            requestOf(),
            new ResponseDouble()
        );

        expect(accepted.added).toBe(1);
        expect(accepted.known).toBe(2);
    });

    it('SC-MB-83 — одинаковый текст от двух деревьев лежит двумя записями', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ProposalsIntakeController = controllerWith(prisma);
        const other: IRequestTree = { id: 'id-2', slug: 'other-tree', name: 'Соседнее дерево' };

        await controller.accept(cargo([proposal('первое')]), requestOf(), new ResponseDouble());
        const accepted: IIntakeAccepted = await controller.accept(
            { schema: '1', tree: other.slug, items: [proposal('первое')] },
            requestOf(other),
            new ResponseDouble()
        );

        expect(prisma.proposals).toHaveLength(2);
        expect(accepted.added).toBe(1);
        expect(accepted.known).toBe(0);
    });

    it('SC-MB-21 — предложения копятся, а не замещаются', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ProposalsIntakeController = controllerWith(prisma);

        await controller.accept(cargo([proposal('первое')]), requestOf(), new ResponseDouble());
        await controller.accept(cargo([proposal('второе')]), requestOf(), new ResponseDouble());

        expect(prisma.proposals).toHaveLength(2);
        expect(prisma.records).toHaveLength(1);
    });

    it('SC-MB-13 — негодная запись отбивает операцию целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const items: TCargoBody[] = [
            proposal('первое'),
            proposal('второе'),
            { text: 'третье', address: 'пакет' },
            proposal('четвёртое'),
            proposal('пятое'),
        ];

        const rejection: unknown = await controllerWith(prisma)
            .accept(cargo(items), requestOf(), new ResponseDouble())
            .catch((error: unknown): unknown => error);

        expect(rejection).toBeInstanceOf(BadRequestException);
        expect((rejection as BadRequestException).message).toBe('в грузе рода «предложения» записи 3 не хватает полей: resource');
        expect(prisma.proposals).toHaveLength(0);
        expect(prisma.records).toHaveLength(0);
    });

    it('SC-MB-8 — список записей, приехавший не списком, отбивается с названием поля', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const rejection: unknown = await controllerWith(prisma)
            .accept({ schema: '1', tree: TREE.slug, items: 'одно предложение' }, requestOf(), new ResponseDouble())
            .catch((error: unknown): unknown => error);

        expect((rejection as BadRequestException).message).toBe('в грузе рода «предложения» поле items ожидается списком записей');
        expect(prisma.records).toHaveLength(0);
    });
});
