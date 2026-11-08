import { BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { IMetricsDayAccepted } from '@rt-tools/agent-kit/cargo';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { ERefusal, IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { MetricsIntakeController } from './metrics-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

type TRow = Record<string, unknown>;

/** Двойник таблицы: одна строка на копию и день, штамп сравнивает сам. */
class PrismaDouble {
    public readonly rows: TRow[] = [];

    public get metricsDay(): Record<string, (args: TRow) => Promise<{ count: number }>> {
        return {
            updateMany: async (args: TRow): Promise<{ count: number }> => this.#update(args),
            createMany: async (args: TRow): Promise<{ count: number }> => this.#create(args),
        };
    }

    #update(args: TRow): { count: number } {
        const edge: Date = ((args['where'] as TRow)['stamp'] as { lte: Date }).lte;
        const row: TRow | undefined = this.rows.find((one: TRow): boolean => (one['stamp'] as Date) <= edge);

        if (row) {
            Object.assign(row, args['data']);
        }

        return { count: row ? 1 : 0 };
    }

    #create(args: TRow): { count: number } {
        if (this.rows.length > 0) {
            return { count: 0 };
        }
        this.rows.push(...(args['data'] as readonly TRow[]));

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

function setup(): { readonly double: PrismaDouble; readonly controller: MetricsIntakeController; readonly request: ITreeBearingRequest } {
    const double: PrismaDouble = new PrismaDouble();
    const request: ITreeBearingRequest = {};

    rememberTree(request, TREE);

    return { double, controller: new MetricsIntakeController(double as unknown as PrismaService), request };
}

function cargo(stamp: number, metrics: TCargoBody = { sessions: 1 }): TCargoBody {
    return { schema: '2', tree: TREE.slug, origin: 'copy-1', day: '2026-11-07', version: '0.35.0', stamp, metrics };
}

async function codeOf(attempt: Promise<unknown>): Promise<unknown> {
    try {
        await attempt;

        return null;
    } catch (failure: unknown) {
        return (failure as { getResponse(): { code: unknown } }).getResponse().code;
    }
}

describe('MetricsIntakeController', () => {
    it('принимает строку дня и называет дерево и день', async () => {
        const { controller, request } = setup();
        const response: ResponseDouble = new ResponseDouble();
        const answer: IMetricsDayAccepted = await controller.accept(cargo(100), request, response);

        expect(answer).toEqual({ tree: 'own-tree', day: '2026-11-07' });
        expect(response.code).toBe(HttpStatus.OK);
    });

    it('SC-AK-1284 — две отправки одного дня дают одну запись', async () => {
        const { double, controller, request } = setup();

        await controller.accept(cargo(100), request, new ResponseDouble());
        await controller.accept(cargo(100), request, new ResponseDouble());

        expect(double.rows).toHaveLength(1);
    });

    it('чужой ключ получает код metrics-field-refused', async () => {
        const { double, controller, request } = setup();
        const attempt: Promise<IMetricsDayAccepted> = controller.accept(cargo(100, { taskTitle: 1 }), request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
        expect(await codeOf(controller.accept(cargo(100, { taskTitle: 1 }), request, new ResponseDouble()))).toBe(
            ERefusal.MetricsFieldRefused
        );
        expect(double.rows).toHaveLength(0);
    });

    it('старая строка получает код metrics-stale и запись не меняет', async () => {
        const { double, controller, request } = setup();

        await controller.accept(cargo(200, { sessions: 5 }), request, new ResponseDouble());

        const attempt: Promise<IMetricsDayAccepted> = controller.accept(cargo(100), request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(ConflictException);
        expect(await codeOf(controller.accept(cargo(100), request, new ResponseDouble()))).toBe(ERefusal.MetricsStale);
        expect(double.rows[0]?.['metrics']).toEqual({ sessions: 5 });
    });

    it('чужое дерево отказывается головой груза', async () => {
        const { controller, request } = setup();
        const attempt: Promise<IMetricsDayAccepted> = controller.accept({ ...cargo(100), tree: 'other' }, request, new ResponseDouble());

        await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
    });
});
