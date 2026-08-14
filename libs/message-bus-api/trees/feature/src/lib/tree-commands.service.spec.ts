import { beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeCommandReport, treeTokenHash } from '@rt/message-bus-api/trees/util';

import { TreeCommandsService } from './tree-commands.service';

interface ITreeRow {
    id: string;
    slug: string;
    name: string;
}

interface ITokenRow {
    id: string;
    treeId: string;
    hash: string;
    revokedAt: Date | null;
}

interface IMonthRow {
    treeId: string;
    ranAt: Date;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

/** Момент, которым команда помечает отзыв: он приезжает доводом, а не читается часами. */
const NOW: Date = new Date('2026-08-14T21:30:00Z');

/**
 * Двойник хранилища: отбор, сортировку и заведение строк он делает сам, а строки лежат
 * открыто — сценарии обещают, что после команды лежит в хранилище, а не какой запрос собран.
 *
 * Сделка исполняет свои запросы разом: доводы к ней уже обещания, и порядок между ними держит
 * тот, кто их составил.
 */
class PrismaDouble {
    #nextId: number = 1;

    public readonly trees: ITreeRow[] = [];
    public readonly tokens: ITokenRow[] = [];
    public readonly months: IMonthRow[] = [];

    public get tree(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#treeMatching(args) ?? null,
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => this.#treeMatching(args) ?? null,
            findMany: async (): Promise<unknown> =>
                [...this.trees].sort((left: ITreeRow, right: ITreeRow): number => left.name.localeCompare(right.name)),
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#createTree(args),
        };
    }

    public get treeToken(): Record<string, TQuery> {
        return {
            findMany: async (): Promise<unknown> => this.tokens.filter((token: ITokenRow): boolean => token.revokedAt === null),
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => this.#revoke(args),
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#createToken(args),
        };
    }

    public get monthRecord(): Record<string, TQuery> {
        return {
            findMany: async (): Promise<unknown> =>
                [...this.months].sort((left: IMonthRow, right: IMonthRow): number => right.ranAt.getTime() - left.ranAt.getTime()),
        };
    }

    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    /** Дерево, сошедшееся с отбором: имя и признак у него уникальны оба, и отбор бывает по `OR`. */
    #treeMatching(args: Record<string, unknown>): ITreeRow | undefined {
        const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;
        const tests: Record<string, unknown>[] = (where['OR'] as Record<string, unknown>[] | undefined) ?? [where];

        return this.trees.find((row: ITreeRow): boolean =>
            tests.some((test: Record<string, unknown>): boolean =>
                Object.keys(test).every((key: string): boolean => Reflect.get(row, key) === test[key])
            )
        );
    }

    #createTree(args: Record<string, unknown>): ITreeRow {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: ITreeRow = { id: `tree-${this.#nextId++}`, slug: data['slug'] as string, name: data['name'] as string };
        this.trees.push(created);

        const nested: { create?: { hash: string } } | undefined = data['tokens'] as { create?: { hash: string } } | undefined;

        if (nested?.create) {
            this.tokens.push({ id: `token-${this.#nextId++}`, treeId: created.id, hash: nested.create.hash, revokedAt: null });
        }

        return created;
    }

    #createToken(args: Record<string, unknown>): ITokenRow {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: ITokenRow = {
            id: `token-${this.#nextId++}`,
            treeId: data['treeId'] as string,
            hash: data['hash'] as string,
            revokedAt: null,
        };
        this.tokens.push(created);

        return created;
    }

    #revoke(args: Record<string, unknown>): { count: number } {
        const where: { treeId: string } = args['where'] as { treeId: string };
        const data: { revokedAt: Date } = args['data'] as { revokedAt: Date };
        const live: ITokenRow[] = this.tokens.filter(
            (token: ITokenRow): boolean => token.treeId === where.treeId && token.revokedAt === null
        );
        live.forEach((token: ITokenRow): void => {
            token.revokedAt = data.revokedAt;
        });

        return { count: live.length };
    }
}

/** Токен из вывода команды: он печатается последней строкой и второй раз не показывается. */
function printedToken(report: ITreeCommandReport): string {
    return report.lines[report.lines.length - 1] ?? '';
}

describe('TreeCommandsService', () => {
    let db: PrismaDouble;
    let commands: TreeCommandsService;

    beforeEach((): void => {
        db = new PrismaDouble();
        commands = new TreeCommandsService(db as unknown as PrismaService);
    });

    it('SC-MB-19 — заведение печатает токен один раз, а в хранилище кладёт только его хеш', async () => {
        const report: ITreeCommandReport = await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        const token: string = printedToken(report);

        expect(report.failed).toBe(false);
        expect(token).not.toBe('');
        expect(report.lines.join('\n').split(token)).toHaveLength(2);

        expect(db.trees).toEqual([{ id: 'tree-1', slug: 'own-tree', name: 'Своё дерево' }]);
        expect(db.tokens).toHaveLength(1);
        expect(db.tokens[0].hash).toBe(treeTokenHash(token));
        expect(JSON.stringify(db.tokens)).not.toContain(token);
    });

    it('SC-MB-26 — заведение без признака дерева не заводит его и говорит, что признак обязателен', async () => {
        const report: ITreeCommandReport = await commands.run(['tree:add', 'Своё дерево'], NOW);

        expect(report.failed).toBe(true);
        expect(report.lines.join('\n')).toContain('признак дерева обязателен');
        expect(db.trees).toHaveLength(0);
    });

    it('SC-MB-27 — заведение с занятым именем отбивается, и прежний токен цел', async () => {
        const first: ITreeCommandReport = await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        const hashBefore: string = db.tokens[0].hash;

        const second: ITreeCommandReport = await commands.run(['tree:add', 'Своё дерево', 'other-tree'], NOW);

        expect(first.failed).toBe(false);
        expect(second.failed).toBe(true);
        expect(second.lines.join('\n')).toContain('уже заведено');
        expect(db.trees).toHaveLength(1);
        expect(db.tokens).toHaveLength(1);
        expect(db.tokens[0].hash).toBe(hashBefore);
        expect(db.tokens[0].revokedAt).toBeNull();
    });

    it('SC-MB-27 — заведение с занятым признаком отбивается тем же отказом', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        const report: ITreeCommandReport = await commands.run(['tree:add', 'Соседнее дерево', 'own-tree'], NOW);

        expect(report.failed).toBe(true);
        expect(db.trees).toHaveLength(1);
    });

    it('SC-MB-25 — новый токен принимается, прежний помечен отозванным, и печатается новый', async () => {
        const added: ITreeCommandReport = await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        const oldToken: string = printedToken(added);

        const report: ITreeCommandReport = await commands.run(['tree:token', 'Своё дерево'], NOW);
        const newToken: string = printedToken(report);

        expect(report.failed).toBe(false);
        expect(newToken).not.toBe(oldToken);
        expect(report.lines.join('\n').split(newToken)).toHaveLength(2);

        const live: ITokenRow[] = db.tokens.filter((token: ITokenRow): boolean => token.revokedAt === null);
        expect(live).toHaveLength(1);
        expect(live[0].hash).toBe(treeTokenHash(newToken));

        const revoked: ITokenRow[] = db.tokens.filter((token: ITokenRow): boolean => token.revokedAt !== null);
        expect(revoked).toHaveLength(1);
        expect(revoked[0].hash).toBe(treeTokenHash(oldToken));
        expect(revoked[0].revokedAt).toEqual(NOW);
    });

    it('SC-MB-25 — выдача токена дереву, которого нет, отбивается', async () => {
        const report: ITreeCommandReport = await commands.run(['tree:token', 'Чужое дерево'], NOW);

        expect(report.failed).toBe(true);
        expect(db.tokens).toHaveLength(0);
    });

    it('SC-MB-6 — отзыв помечает токен отозванным, а записи дерева не трогает', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        db.months.push({ treeId: 'tree-1', ranAt: new Date('2026-07-30T10:00:00Z') });

        const report: ITreeCommandReport = await commands.run(['tree:revoke', 'Своё дерево'], NOW);

        expect(report.failed).toBe(false);
        expect(db.tokens[0].revokedAt).toEqual(NOW);
        expect(db.months).toHaveLength(1);
    });

    it('SC-MB-6 — второй отзыв говорит, что годного токена не было', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        await commands.run(['tree:revoke', 'Своё дерево'], NOW);

        const report: ITreeCommandReport = await commands.run(['tree:revoke', 'Своё дерево'], NOW);

        expect(report.failed).toBe(false);
        expect(report.lines.join('\n')).toContain('годного токена не было');
    });

    it('SC-MB-6 — список называет дерево с отозванным токеном вместе с днём последнего прогона', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        db.months.push({ treeId: 'tree-1', ranAt: new Date('2026-07-30T10:00:00Z') });
        db.months.push({ treeId: 'tree-1', ranAt: new Date('2026-08-14T09:00:00Z') });
        await commands.run(['tree:revoke', 'Своё дерево'], NOW);

        const report: ITreeCommandReport = await commands.run(['tree:list'], NOW);
        const printed: string = report.lines.join('\n');

        expect(report.failed).toBe(false);
        expect(printed).toContain('Своё дерево (own-tree)');
        expect(printed).toContain('токен отозван');
        expect(printed).toContain('последний прогон 2026-08-14');
        expect(db.months).toHaveLength(2);
    });

    it('SC-MB-6 — список зовёт токен годным, пока его не отозвали', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);

        expect((await commands.run(['tree:list'], NOW)).lines.join('\n')).toContain('токен годен');
    });
});
