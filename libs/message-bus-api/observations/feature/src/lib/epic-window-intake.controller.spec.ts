import { BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { ERefusal, IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { EpicWindowIntakeController, IEpicWindowAccepted } from './epic-window-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

type TRow = Record<string, unknown>;

const QUADRUPLE: readonly string[] = ['treeId', 'origin', 'epic', 'openedAt'];

function sameMoment(a: unknown, b: unknown): boolean {
    return a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;
}

/** Двойник таблицы: одна строка на четвёрку, штамп сравнивает сам. */
class PrismaDouble {
    public readonly rows: TRow[] = [];

    public get epicWindow(): Record<string, (args: TRow) => Promise<{ count: number }>> {
        return {
            updateMany: async (args: TRow): Promise<{ count: number }> => this.#update(args),
            createMany: async (args: TRow): Promise<{ count: number }> => this.#create(args),
        };
    }

    #find(where: TRow): TRow | undefined {
        return this.rows.find((row: TRow): boolean => QUADRUPLE.every((key: string): boolean => sameMoment(row[key], where[key])));
    }

    #update(args: TRow): { count: number } {
        const where: TRow = args['where'] as TRow;
        const edge: Date = (where['stamp'] as { lte: Date }).lte;
        const row: TRow | undefined = this.#find(where);

        if (row && (row['stamp'] as Date) <= edge) {
            Object.assign(row, args['data']);

            return { count: 1 };
        }

        return { count: 0 };
    }

    #create(args: TRow): { count: number } {
        const row: TRow = (args['data'] as readonly TRow[])[0] ?? {};

        if (this.#find(row)) {
            return { count: 0 };
        }
        this.rows.push({ ...row });

        return { count: 1 };
    }
}

class ResponseDouble implements IIntakeResponse {
    public code: number = 0;

    public status(code: number): unknown {
        this.code = code;

        return this;
    }
}

interface ISetup {
    readonly double: PrismaDouble;
    readonly controller: EpicWindowIntakeController;
    readonly request: ITreeBearingRequest;
}

function setup(): ISetup {
    const double: PrismaDouble = new PrismaDouble();
    const request: ITreeBearingRequest = {};

    rememberTree(request, TREE);

    return { double, controller: new EpicWindowIntakeController(double as unknown as PrismaService), request };
}

/** Штамп в прошлом: приём сверяет его со своими часами, и прошлое остаётся прошлым в любой день прогона. */
const STAMP: number = Date.parse('2026-11-13T06:00:00Z');

function window(fields: TCargoBody = {}): TCargoBody {
    return {
        schema: '2',
        tree: TREE.slug,
        origin: 'copy-1',
        epic: 3227,
        from: '2026-11-13T00:34:01Z',
        to: null,
        calls: 100,
        refusals: 20,
        reasks: 1,
        merged: 0,
        released: 0,
        mergedAt: null,
        releasedAt: null,
        minutes: null,
        stamp: STAMP,
        ...fields,
    };
}

async function refusalOf(attempt: Promise<unknown>): Promise<unknown> {
    try {
        await attempt;

        return null;
    } catch (failure: unknown) {
        return (failure as { getResponse(): unknown }).getResponse();
    }
}

describe('EpicWindowIntakeController', () => {
    it('принимает окно и называет дерево и эпик', async () => {
        const { controller, request } = setup();
        const response: ResponseDouble = new ResponseDouble();
        const answer: IEpicWindowAccepted = await controller.accept(window(), request, response);

        expect(answer).toEqual({ tree: 'own-tree', epic: 3227 });
        expect(response.code).toBe(HttpStatus.OK);
    });

    it('SC-MB-435 — окно эпика ложится, и более позднее того же открытия его заменяет', async () => {
        const { double, controller, request } = setup();

        await controller.accept(window(), request, new ResponseDouble());
        await controller.accept(
            window({ to: '2026-11-13T03:04:27.708Z', calls: 187, refusals: 35, reasks: 3, stamp: STAMP + 1000 }),
            request,
            new ResponseDouble()
        );

        expect(double.rows).toHaveLength(1);
        expect(double.rows[0]).toMatchObject({ calls: 187, refusals: 35, reasks: 3, closedAt: new Date('2026-11-13T03:04:27.708Z') });
    });

    it('SC-MB-446 — окно, присланное выпущенным, заменяет присланное невыпущенным', async () => {
        const { double, controller, request } = setup();
        const closed: TCargoBody = { to: '2026-11-13T03:04:27Z', merged: 1, mergedAt: '2026-11-13T05:48:08Z' };

        await controller.accept(window(closed), request, new ResponseDouble());
        await controller.accept(
            window({ ...closed, released: 1, releasedAt: '2026-11-13T05:59:00Z', stamp: STAMP + 1000 }),
            request,
            new ResponseDouble()
        );

        expect(double.rows).toHaveLength(1);
        expect(double.rows[0]).toMatchObject({ released: true, releasedAt: new Date('2026-11-13T05:59:00Z') });
    });

    it('SC-MB-436 — окно с более старой отметкой ничего не меняет', async () => {
        const { double, controller, request } = setup();

        await controller.accept(window({ calls: 187, stamp: STAMP + 1000 }), request, new ResponseDouble());

        const attempt: Promise<IEpicWindowAccepted> = controller.accept(window(), request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(ConflictException);
        expect(await refusalOf(controller.accept(window(), request, new ResponseDouble()))).toMatchObject({ code: ERefusal.MetricsStale });
        expect(double.rows[0]?.['calls']).toBe(187);
    });

    it.each([
        ['epic', { epic: '3227' }],
        ['epic', { epic: 0 }],
        ['calls', { calls: 1.5 }],
        ['refusals', { refusals: 101 }],
        ['released', { released: 2 }],
        ['minutes', { minutes: -1 }],
        ['origin', { origin: 'копия 1' }],
    ])('SC-MB-437 — окно с числом вне формы отказано с полем %s', async (field: string, fields: TCargoBody) => {
        const { double, controller, request } = setup();
        const attempt: Promise<IEpicWindowAccepted> = controller.accept(window(fields), request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
        expect(await refusalOf(controller.accept(window(fields), request, new ResponseDouble()))).toMatchObject({
            code: ERefusal.EpicWindowFieldRefused,
            params: { field },
        });
        expect(double.rows).toHaveLength(0);
    });

    it.each([
        ['to', { to: '2026-11-12T23:00:00Z' }],
        ['to', { to: '2026-11-13T07:00:00Z' }],
        ['from', { from: '2026-11-13 00:34:01' }],
        ['from', { from: '2026-02-30T00:00:00Z' }],
        ['mergedAt', { mergedAt: '2026-11-14T00:00:00Z' }],
        ['stamp', { stamp: Number.MAX_SAFE_INTEGER }],
    ])('SC-MB-447 — окно с моментом вне формы отказано с полем %s', async (field: string, fields: TCargoBody) => {
        const { double, controller, request } = setup();

        expect(await refusalOf(controller.accept(window(fields), request, new ResponseDouble()))).toMatchObject({
            code: ERefusal.EpicWindowFieldRefused,
            params: { field },
        });
        expect(double.rows).toHaveLength(0);
    });

    it('чужое дерево отказывается головой груза', async () => {
        const { controller, request } = setup();
        const attempt: Promise<IEpicWindowAccepted> = controller.accept(window({ tree: 'other' }), request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
    });
});
