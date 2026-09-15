import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { IUsageRow, IUsageSessionRow } from '@rt/message-bus-api/observations/data-access';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { UsageReadController } from './usage-read.controller';

const OWN: { id: string; slug: string } = { id: 'tree-1', slug: 'own-tree' };
const PERIOD: { from: string; to: string } = { from: '2026-08-01', to: '2026-08-31' };

/** Запрос своим текстом, как его собирает клиент хранилища: текст и подставленные значения. */
interface IAskedQuery {
    readonly sql: string;
    readonly values: readonly unknown[];
}

/**
 * Двойник хранилища: знает одно дерево по признаку и отвечает на запрос своим текстом заранее
 * положенными строками, запоминая, с какими значениями его позвали. Сам текст запроса сверяется
 * стендом сквозного набора над засеянными строками, не здесь: двойник не исполняет SQL.
 */
class PrismaDouble {
    public readonly asked: IAskedQuery[] = [];

    readonly #rows: readonly unknown[];

    constructor(rows: readonly unknown[] = []) {
        this.#rows = rows;
    }

    public get tree(): { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string } | null> } {
        return {
            findUnique: async (args: { where: { slug: string } }): Promise<{ id: string } | null> =>
                args.where.slug === OWN.slug ? { id: OWN.id } : null,
        };
    }

    public async $queryRaw(query: IAskedQuery): Promise<unknown[]> {
        this.asked.push(query);

        return [...this.#rows];
    }
}

function controllerOf(double: PrismaDouble): UsageReadController {
    return new UsageReadController(double as unknown as PrismaService);
}

describe('UsageReadController', () => {
    it('SC-MB-343 — использование читается по дереву и периоду: строки хранилища как есть, отказ гейта без рода — правило', async () => {
        const double: PrismaDouble = new PrismaDouble([
            { skill: 'testing', kind: 'rule', loads: 3, sessions: 2, denials: 1 },
            { skill: 'git-workflow-commit', kind: 'pattern', loads: 1, sessions: 1, denials: 0 },
            { skill: 'lists', kind: null, loads: 0, sessions: 0, denials: 2 },
        ]);

        const rows: readonly IUsageRow[] = await controllerOf(double).usage({ tree: OWN.slug, ...PERIOD });

        expect(rows.map((row: IUsageRow): string => `${row.skill}:${row.kind}:${row.loads}:${row.sessions}:${row.denials}`)).toEqual([
            'testing:rule:3:2:1',
            'git-workflow-commit:pattern:1:1:0',
            'lists:rule:0:0:2',
        ]);
        expect(double.asked).toHaveLength(1);
        expect(double.asked[0].values).toEqual([OWN.id, PERIOD.from, PERIOD.to]);
        expect(double.asked[0].sql).toContain('COUNT(DISTINCT "sid")');
    });

    it('SC-MB-345 — сессии скила читаются по дереву, скилу и периоду', async () => {
        const double: PrismaDouble = new PrismaDouble([
            { day: '2026-08-13', sid: '2', count: 1 },
            { day: '2026-08-12', sid: '1', count: 2 },
        ]);

        const rows: readonly IUsageSessionRow[] = await controllerOf(double).sessions('testing', { tree: OWN.slug, ...PERIOD });

        expect(rows).toEqual([
            { day: '2026-08-13', sid: '2', count: 1 },
            { day: '2026-08-12', sid: '1', count: 2 },
        ]);
        expect(double.asked[0].values).toEqual([OWN.id, 'testing', PERIOD.from, PERIOD.to]);
        expect(double.asked[0].sql).toContain('ORDER BY "day" DESC');
    });

    it('SC-MB-344 — период длиннее четырёхсот дней отбивается кодом 400 с пределом, хранилище не спрашивается', async () => {
        const double: PrismaDouble = new PrismaDouble();

        const refusal: Promise<readonly IUsageRow[]> = controllerOf(double).usage({ tree: OWN.slug, from: '2025-07-01', to: '2026-08-31' });

        await expect(refusal).rejects.toBeInstanceOf(BadRequestException);
        await expect(refusal).rejects.toThrow('предела 400');
        expect(double.asked).toHaveLength(0);
    });

    it('SC-MB-347 — пустой период отвечает пустым списком, а не отказом', async () => {
        const rows: readonly IUsageRow[] = await controllerOf(new PrismaDouble()).usage({ tree: OWN.slug, ...PERIOD });

        expect(rows).toEqual([]);
    });

    it('SC-MB-346 — обе операции закрыты правом чтения использования', () => {
        for (const method of [UsageReadController.prototype.usage, UsageReadController.prototype.sessions]) {
            expect(Reflect.getMetadata(OPERATION_ACCESS, method)).toBe('permission');
            expect(Reflect.getMetadata(OPERATION_RIGHT, method)).toBe('usage:read');
        }
    });

    it('SC-MB-343 — дерево не названо или не известно — отказ 404', async () => {
        const controller: UsageReadController = controllerOf(new PrismaDouble());

        await expect(controller.usage({ ...PERIOD })).rejects.toBeInstanceOf(NotFoundException);
        await expect(controller.usage({ tree: 'other-tree', ...PERIOD })).rejects.toThrow('не известно приёмнику');
    });
});
