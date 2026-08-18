import { beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { INVITE_HOURS, inviteCodeHash, ITreeCommandReport, treeTokenHash } from '@rt/message-bus-api/trees/util';

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

interface IInviteRow {
    id: string;
    name: string;
    hash: string;
    activeName: string | null;
    issuedAt: Date;
    expiresAt: Date;
    redeemedAt: Date | null;
    revokedAt: Date | null;
    tree: { slug: string } | null;
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
    public readonly invites: IInviteRow[] = [];

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

    public get treeInvite(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#inviteMatching(args) ?? null,
            findMany: async (): Promise<unknown> =>
                [...this.invites].sort((left: IInviteRow, right: IInviteRow): number => right.issuedAt.getTime() - left.issuedAt.getTime()),
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#createInvite(args),
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#updateInvite(args),
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => this.#expireInvites(args),
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

    /** Приглашение, сошедшееся с отбором: искать его умеют по хешу кода и по держащему имени. */
    #inviteMatching(args: Record<string, unknown>): IInviteRow | undefined {
        const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;

        return this.invites.find((row: IInviteRow): boolean =>
            Object.keys(where).every((key: string): boolean => Reflect.get(row, key) === where[key])
        );
    }

    #createInvite(args: Record<string, unknown>): IInviteRow {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: IInviteRow = {
            id: `invite-${this.#nextId++}`,
            name: data['name'] as string,
            hash: data['hash'] as string,
            activeName: (data['activeName'] as string | null) ?? null,
            issuedAt: (data['issuedAt'] as Date | undefined) ?? NOW,
            expiresAt: data['expiresAt'] as Date,
            redeemedAt: null,
            revokedAt: null,
            tree: null,
        };
        this.invites.push(created);

        return created;
    }

    #updateInvite(args: Record<string, unknown>): IInviteRow | undefined {
        const where: { id: string } = args['where'] as { id: string };
        const data: Partial<IInviteRow> = args['data'] as Partial<IInviteRow>;
        const found: IInviteRow | undefined = this.invites.find((row: IInviteRow): boolean => row.id === where.id);

        return found ? Object.assign(found, data) : undefined;
    }

    /** Снятие имени с просроченных приглашений: отбор по имени и по вышедшему сроку. */
    #expireInvites(args: Record<string, unknown>): { count: number } {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
        const until: { lte: Date } = where['expiresAt'] as { lte: Date };
        const hit: IInviteRow[] = this.invites.filter(
            (row: IInviteRow): boolean =>
                row.activeName === where['activeName'] &&
                row.redeemedAt === null &&
                row.revokedAt === null &&
                row.expiresAt.getTime() <= until.lte.getTime()
        );
        hit.forEach((row: IInviteRow): void => {
            row.activeName = null;
        });

        return { count: hit.length };
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

/**
 * Код приглашения из вывода команды.
 *
 * Он стоит своей строкой, а последняя строка — готовая команда заведения, в которой тот же код
 * повторён: строка кода берётся по её виду, а не по месту в выводе.
 */
function printedCode(report: ITreeCommandReport): string {
    return report.lines.find((line: string): boolean => /^[0-9a-f]{64}$/.test(line)) ?? '';
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

    it('SC-MB-128 — выдача печатает код один раз, а в хранилище кладёт только его хеш', async () => {
        const report: ITreeCommandReport = await commands.run(['tree:invite', 'Своё дерево'], NOW);
        const code: string = printedCode(report);

        expect(report.failed).toBe(false);
        expect(code).toMatch(/^[0-9a-f]{64}$/);
        expect(report.lines.join('\n').split(code)).toHaveLength(3);

        expect(db.invites).toHaveLength(1);
        expect(db.invites[0].hash).toBe(inviteCodeHash(code));
        expect(db.invites[0].name).toBe('Своё дерево');
        expect(db.invites[0].activeName).toBe('Своё дерево');
        expect(JSON.stringify(db.invites)).not.toContain(code);
    });

    it('SC-MB-128 — приглашение годно двое суток от выдачи', async () => {
        await commands.run(['tree:invite', 'Своё дерево'], NOW);

        expect(db.invites[0].expiresAt.getTime() - NOW.getTime()).toBe(INVITE_HOURS * 60 * 60 * 1000);
    });

    it('второе приглашение на то же имя отбивается, пока первое годно', async () => {
        await commands.run(['tree:invite', 'Своё дерево'], NOW);
        const report: ITreeCommandReport = await commands.run(['tree:invite', 'Своё дерево'], NOW);

        expect(report.failed).toBe(true);
        expect(report.lines.join('\n')).toContain('уже выдано');
        expect(db.invites).toHaveLength(1);
    });

    it('приглашение заведённому дереву отбивается: имя занято, и токен ему выдаёт своя команда', async () => {
        await commands.run(['tree:add', 'Своё дерево', 'own-tree'], NOW);
        const report: ITreeCommandReport = await commands.run(['tree:invite', 'Своё дерево'], NOW);

        expect(report.failed).toBe(true);
        expect(report.lines.join('\n')).toContain('уже заведено');
        expect(db.invites).toHaveLength(0);
    });

    it('просроченное приглашение имя не держит: новое выдаётся, старое остаётся лежать', async () => {
        await commands.run(['tree:invite', 'Своё дерево'], NOW);
        const later: Date = new Date(NOW.getTime() + (INVITE_HOURS + 1) * 60 * 60 * 1000);

        const report: ITreeCommandReport = await commands.run(['tree:invite', 'Своё дерево'], later);

        expect(report.failed).toBe(false);
        expect(db.invites).toHaveLength(2);
        expect(db.invites[0].activeName).toBeNull();
        expect(db.invites[1].activeName).toBe('Своё дерево');
    });

    it('отзыв снимает приглашение, а запись о нём остаётся', async () => {
        await commands.run(['tree:invite', 'Своё дерево'], NOW);

        const report: ITreeCommandReport = await commands.run(['tree:uninvite', 'Своё дерево'], NOW);

        expect(report.failed).toBe(false);
        expect(report.lines.join('\n')).toContain('отозвано');
        expect(db.invites).toHaveLength(1);
        expect(db.invites[0].revokedAt).toEqual(NOW);
        expect(db.invites[0].activeName).toBeNull();
    });

    it('отзыв без годного приглашения отбивается и ничего не меняет', async () => {
        const report: ITreeCommandReport = await commands.run(['tree:uninvite', 'Своё дерево'], NOW);

        expect(report.failed).toBe(true);
        expect(report.lines.join('\n')).toContain('годного приглашения');
        expect(db.invites).toHaveLength(0);
    });

    it('SC-MB-128 — список называет имя, состояние и сроки, а кода в нём нет', async () => {
        const issued: ITreeCommandReport = await commands.run(['tree:invite', 'Своё дерево'], NOW);
        const code: string = printedCode(issued);

        const report: ITreeCommandReport = await commands.run(['tree:invites'], NOW);
        const printed: string = report.lines.join('\n');

        expect(report.failed).toBe(false);
        expect(printed).toContain('Своё дерево');
        expect(printed).toContain('ждёт');
        expect(printed).not.toContain(code);
    });

    it('SC-MB-128 — отозванное и просроченное приглашения из списка не выпадают', async () => {
        await commands.run(['tree:invite', 'Своё дерево'], NOW);
        await commands.run(['tree:uninvite', 'Своё дерево'], NOW);
        await commands.run(['tree:invite', 'Соседнее дерево'], NOW);
        const later: Date = new Date(NOW.getTime() + (INVITE_HOURS + 1) * 60 * 60 * 1000);

        const printed: string = (await commands.run(['tree:invites'], later)).lines.join('\n');

        expect(printed).toContain('отозвано');
        expect(printed).toContain('просрочено');
    });

    it('SC-MB-128 — пустой список говорит, что приглашений нет', async () => {
        expect((await commands.run(['tree:invites'], NOW)).lines.join('\n')).toContain('приглашений нет');
    });
});
