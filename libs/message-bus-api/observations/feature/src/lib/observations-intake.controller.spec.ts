import { BadRequestException, HttpStatus, PayloadTooLargeException } from '@nestjs/common';
import { afterEach, describe, expect, it } from 'vitest';

import { IObservationRowInput } from '@rt/message-bus-api/observations/data-access';
import { OBSERVATION_LINES_CAP_KEY } from '@rt/message-bus-api/observations/util';
import { IObservationsAccepted } from '@rt-tools/agent-kit/cargo';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';
import { IIntakeResponse, TCargoBody } from '@rt/message-bus-common';

import { ObservationsIntakeController } from './observations-intake.controller';

const TREE: IRequestTree = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };
const DAY: string = '2026-08-12';

type TStoredRow = IObservationRowInput & { readonly id: string };

/** Двойник хранилища: держит строки и сам снимает день копии перед вставкой. */
class PrismaDouble {
    public readonly rows: TStoredRow[] = [];

    #nextId: number = 1;

    public get observation(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            deleteMany: async (args: Record<string, unknown>): Promise<{ count: number }> => this.#deleteMany(args),
            createMany: async (args: Record<string, unknown>): Promise<{ count: number }> => this.#createMany(args),
        };
    }

    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #deleteMany(args: Record<string, unknown>): { count: number } {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
        const before: number = this.rows.length;
        const kept: TStoredRow[] = this.rows.filter(
            (row: TStoredRow): boolean => !(row.treeId === where['treeId'] && row.origin === where['origin'] && row.day === where['day'])
        );
        this.rows.splice(0, this.rows.length, ...kept);

        return { count: before - kept.length };
    }

    #createMany(args: Record<string, unknown>): { count: number } {
        const data: readonly IObservationRowInput[] = args['data'] as readonly IObservationRowInput[];

        for (const row of data) {
            this.rows.push({ ...row, id: `row-${this.#nextId++}` });
        }

        return { count: data.length };
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

function line(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { t: `${DAY}T10:00:00Z`, ev: 'skill-load', res: 'testing', sid: '1', v: '0.27.0', skill: 'rule', ...overrides };
}

function cargo(days: readonly { day: string; lines: readonly unknown[] }[], origin: string = 'copy-a'): TCargoBody {
    return { schema: '2', tree: TREE.slug, origin, days };
}

function controllerOf(prisma: PrismaDouble): ObservationsIntakeController {
    return new ObservationsIntakeController(prisma as unknown as PrismaService);
}

describe('ObservationsIntakeController', () => {
    afterEach((): void => {
        delete process.env[OBSERVATION_LINES_CAP_KEY];
    });

    it('SC-MB-337 — строки ложатся по одной, с деревом токена и признаком копии; ответ называет дни и строки', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const response: ResponseDouble = new ResponseDouble();

        const accepted: IObservationsAccepted = await controllerOf(prisma).accept(
            cargo([
                { day: DAY, lines: [line(), line({ ev: 'gate-deny', kind: 'ext', skill: undefined }), line({ sid: '2' })] },
                { day: '2026-08-13', lines: [line({ res: 'task-flow' })] },
            ]),
            requestOf(),
            response
        );

        expect(accepted).toEqual({ tree: TREE.slug, days: 2, rows: 4 });
        expect(response.code).toBe(HttpStatus.OK);
        expect(prisma.rows).toHaveLength(4);
        expect(prisma.rows[1]).toMatchObject({
            treeId: TREE.id,
            origin: 'copy-a',
            day: DAY,
            ev: 'gate-deny',
            kind: 'ext',
            skill: null,
            sid: '1',
        });
        expect(prisma.rows[3]).toMatchObject({ treeId: TREE.id, day: '2026-08-13', res: 'task-flow', skill: 'rule' });
    });

    it('SC-MB-338 — тот же день той же копии замещается целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ObservationsIntakeController = controllerOf(prisma);
        await controller.accept(cargo([{ day: DAY, lines: [line(), line(), line()] }]), requestOf(), new ResponseDouble());

        await controller.accept(
            cargo([{ day: DAY, lines: [line({ res: 'grill-me' }), line({ res: 'lists' })] }]),
            requestOf(),
            new ResponseDouble()
        );

        expect(prisma.rows.map((row: TStoredRow): string => row.res)).toEqual(['grill-me', 'lists']);
    });

    it('SC-MB-339 — день другой копии того же дерева остаётся рядом', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ObservationsIntakeController = controllerOf(prisma);
        await controller.accept(cargo([{ day: DAY, lines: [line()] }], 'copy-a'), requestOf(), new ResponseDouble());

        await controller.accept(cargo([{ day: DAY, lines: [line({ res: 'lists' })] }], 'copy-b'), requestOf(), new ResponseDouble());

        expect(prisma.rows.map((row: TStoredRow): string => `${row.origin}:${row.res}`)).toEqual(['copy-a:testing', 'copy-b:lists']);
    });

    it('SC-MB-340 — незнакомое событие отбивает груз целиком кодом 400 и местом строки', async () => {
        const prisma: PrismaDouble = new PrismaDouble();

        const refusal: Promise<IObservationsAccepted> = controllerOf(prisma).accept(
            cargo([{ day: DAY, lines: [line(), line({ ev: 'unknown' })] }]),
            requestOf(),
            new ResponseDouble()
        );

        await expect(refusal).rejects.toBeInstanceOf(BadRequestException);
        await expect(refusal).rejects.toThrow('день 2026-08-12, строка 2');
        expect(prisma.rows).toHaveLength(0);
    });

    it('SC-MB-341 — строк больше предела — отказ 413 с пределом и числом, без единой строки', async () => {
        process.env[OBSERVATION_LINES_CAP_KEY] = '10';
        const prisma: PrismaDouble = new PrismaDouble();

        const refusal: Promise<IObservationsAccepted> = controllerOf(prisma).accept(
            cargo([{ day: DAY, lines: Array.from({ length: 11 }, (): unknown => line()) }]),
            requestOf(),
            new ResponseDouble()
        );

        await expect(refusal).rejects.toBeInstanceOf(PayloadTooLargeException);
        await expect(refusal).rejects.toThrow('строк 11, а предел 10');
        expect(prisma.rows).toHaveLength(0);
    });

    it('SC-MB-340 — груз чужого дерева или без признака копии отбивается головой', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        const controller: ObservationsIntakeController = controllerOf(prisma);

        await expect(controller.accept({ ...cargo([]), tree: 'other' }, requestOf(), new ResponseDouble())).rejects.toThrow(
            'принадлежит другому дереву'
        );
        await expect(controller.accept({ schema: '2', tree: TREE.slug, days: [] }, requestOf(), new ResponseDouble())).rejects.toThrow(
            'не хватает полей: origin'
        );
    });
});
