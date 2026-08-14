import { BadRequestException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { IIntakeAccepted, IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { SummaryIntakeController } from './summary-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

interface IRecordRow {
    id: string;
    treeId: string;
    month: string;
    summary: TCargoBody | null;
    schema: string;
    ranAt: Date;
}

/** Двойник хранилища: держит записи месяца и сам разрешает пару «дерево — месяц». */
class PrismaDouble {
    public readonly rows: IRecordRow[] = [];

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

        const created: IRecordRow = { id: `record-${this.rows.length + 1}`, summary: null, ...(args['create'] as Omit<IRecordRow, 'id'>) };
        this.rows.push(created);

        return { id: created.id };
    }
}

/** Ответ: операция ставит в нём только код, и спека читает поставленный. */
class ResponseDouble implements IIntakeResponse {
    public code: number = 0;

    public status(code: number): unknown {
        this.code = code;

        return this;
    }
}

/** Запрос с уже опознанным деревом: токен проверяет гард, до операции доходит прочитанное им. */
function requestOf(tree: IRequestTree = TREE): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};
    rememberTree(request, tree);

    return request;
}

/** Сводка: голова груза, счётчики отрезка, снимок надстроек и невыбранное. */
function cargo(overrides: Partial<TCargoBody> = {}): TCargoBody {
    return {
        schema: '1',
        tree: TREE.slug,
        days: 7,
        sessions: 12,
        loads: [{ name: 'testing', count: 4 }],
        denials: [],
        kinds: [],
        guards: [],
        unused: [],
        unpicked: ['rules/api-layer.md'],
        overrides: [{ resource: 'docs/GLOSSARY.md', section: null, kind: 'append' }],
        versions: ['1'],
        total: 16,
        ...overrides,
    };
}

describe('SummaryIntakeController', () => {
    it('SC-MB-1 — первая сводка месяца заводит запись, а ответ называет месяц и дерево', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const response: ResponseDouble = new ResponseDouble();

        const accepted: IIntakeAccepted = await new SummaryIntakeController(prisma as unknown as PrismaService).accept(
            cargo(),
            requestOf(),
            response
        );

        expect(accepted.tree).toBe(TREE.slug);
        expect(accepted.month).toMatch(/^\d{4}-\d{2}$/);
        expect(accepted.created).toBe(true);
        expect(response.code).toBe(HttpStatus.CREATED);
    });

    it('SC-MB-2 — второй прогон обновляет ту же запись и отвечает кодом обновления', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: SummaryIntakeController = new SummaryIntakeController(prisma as unknown as PrismaService);
        const response: ResponseDouble = new ResponseDouble();

        await controller.accept(cargo({ total: 16 }), requestOf(), new ResponseDouble());
        const second: IIntakeAccepted = await controller.accept(cargo({ total: 3 }), requestOf(), response);

        expect(second.created).toBe(false);
        expect(response.code).toBe(HttpStatus.OK);
        expect(prisma.rows).toHaveLength(1);
        expect(prisma.rows[0].summary).toEqual(cargo({ total: 3 }));
    });

    it('SC-MB-12 — незнакомое поле сводки ложится в запись как приехало', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await new SummaryIntakeController(prisma as unknown as PrismaService).accept(
            cargo({ freshCounter: 5 }),
            requestOf(),
            new ResponseDouble()
        );

        expect(prisma.rows[0].summary).toEqual(cargo({ freshCounter: 5 }));
    });

    it('SC-MB-11 — груз незнакомой версии схемы принимается и помечается ею', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        await new SummaryIntakeController(prisma as unknown as PrismaService).accept(
            cargo({ schema: '42' }),
            requestOf(),
            new ResponseDouble()
        );

        expect(prisma.rows[0].schema).toBe('42');
    });

    it('SC-MB-31 — пустая сводка заводит запись месяца, и снимок надстроек в ней стоит', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const empty: TCargoBody = cargo({ days: 0, sessions: 0, total: 0, loads: [], versions: [] });

        const accepted: IIntakeAccepted = await new SummaryIntakeController(prisma as unknown as PrismaService).accept(
            empty,
            requestOf(),
            new ResponseDouble()
        );

        expect(accepted.created).toBe(true);
        expect(prisma.rows[0].summary).toEqual(empty);
        expect((prisma.rows[0].summary as TCargoBody)['overrides']).toEqual(cargo()['overrides']);
    });

    it('SC-MB-8 — сводка без обязательного поля отбивается с названием поля', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const { overrides, ...withoutOverrides }: TCargoBody = cargo();

        const rejection: unknown = await new SummaryIntakeController(prisma as unknown as PrismaService)
            .accept(withoutOverrides, requestOf(), new ResponseDouble())
            .catch((error: unknown): unknown => error);

        expect(rejection).toBeInstanceOf(BadRequestException);
        expect((rejection as BadRequestException).message).toBe('в грузе рода «сводка» не хватает полей: overrides');
        expect(overrides).toBeDefined();
        expect(prisma.rows).toHaveLength(0);
    });

    it('SC-MB-9 — признак чужого дерева отбивает приём, и запись не заводится', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const rejection: unknown = await new SummaryIntakeController(prisma as unknown as PrismaService)
            .accept(cargo({ tree: 'neighbour-tree' }), requestOf(), new ResponseDouble())
            .catch((error: unknown): unknown => error);

        expect((rejection as BadRequestException).message).toBe('признак дерева в грузе принадлежит другому дереву');
        expect(prisma.rows).toHaveLength(0);
    });

    it('SC-MB-32 — сводка без версии схемы отбивается до записи', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const { schema, ...withoutSchema }: TCargoBody = cargo();

        const rejection: unknown = await new SummaryIntakeController(prisma as unknown as PrismaService)
            .accept(withoutSchema, requestOf(), new ResponseDouble())
            .catch((error: unknown): unknown => error);

        expect((rejection as BadRequestException).message).toBe('версия схемы груза обязательна');
        expect(schema).toBe('1');
        expect(prisma.rows).toHaveLength(0);
    });
});
