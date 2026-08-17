import { BadRequestException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { ENROLL_LIMIT } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { inviteCodeHash, inviteExpiry, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { IEnrollGranted } from '@rt-tools/agent-kit/cargo';

import { EnrollController } from './enroll.controller';

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

interface IInviteRow {
    id: string;
    name: string;
    hash: string;
    activeName: string | null;
    issuedAt: Date;
    expiresAt: Date;
    redeemedAt: Date | null;
    revokedAt: Date | null;
    treeId: string | null;
    tree: { slug: string } | null;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

/** Момент обращения: он один на все проверки, а сроки считаются от него. */
const NOW: Date = new Date('2026-08-17T10:00:00.000Z');

/** Код приглашения образца: в хранилище лежит его хеш, а сам код приезжает обращением. */
const CODE: string = 'a'.repeat(64);

/**
 * Двойник хранилища: сделку он исполняет так же, как настоящий клиент, — телом функции, а
 * отбор и заведение строк делает сам. Строки лежат открыто: сценарии обещают, что после
 * обращения лежит в хранилище, а не какой запрос собран.
 */
class PrismaDouble {
    #nextId: number = 1;

    public readonly trees: ITreeRow[] = [];
    public readonly tokens: ITokenRow[] = [];
    public readonly invites: IInviteRow[] = [];

    /** Заведено ли дерево с занятым именем или признаком: уникальность держит хранилище. */
    public clashes: boolean = false;

    public get tree(): Record<string, TQuery> {
        return {
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => this.#treeMatching(args) ?? null,
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#treeMatching(args) ?? null,
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#createTree(args),
        };
    }

    public get treeInvite(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#inviteMatching(args) ?? null,
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => this.#redeem(args),
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#updateInvite(args),
        };
    }

    /** Сделка: тело исполняется на том же двойнике — вложенных сделок у него нет, как и у клиента. */
    public async $transaction(work: (tx: PrismaDouble) => Promise<unknown>): Promise<unknown> {
        return work(this);
    }

    public invite(patch: Partial<IInviteRow> = {}): IInviteRow {
        const created: IInviteRow = {
            id: `invite-${this.#nextId++}`,
            name: 'Своё дерево',
            hash: inviteCodeHash(CODE),
            activeName: 'Своё дерево',
            issuedAt: NOW,
            expiresAt: inviteExpiry(NOW),
            redeemedAt: null,
            revokedAt: null,
            treeId: null,
            tree: null,
            ...patch,
        };
        this.invites.push(created);

        return created;
    }

    #treeMatching(args: Record<string, unknown>): ITreeRow | undefined {
        if (this.clashes) {
            return { id: 'tree-занято', slug: 'own-tree', name: 'Своё дерево' };
        }

        const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;
        const tests: Record<string, unknown>[] = (where['OR'] as Record<string, unknown>[] | undefined) ?? [where];

        return this.trees.find((row: ITreeRow): boolean =>
            tests.some((test: Record<string, unknown>): boolean =>
                Object.keys(test).every((key: string): boolean => Reflect.get(row, key) === test[key])
            )
        );
    }

    #inviteMatching(args: Record<string, unknown>): IInviteRow | undefined {
        const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;

        return this.invites.find((row: IInviteRow): boolean =>
            Object.keys(where).every((key: string): boolean => Reflect.get(row, key) === where[key])
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

    /** Условное погашение: строка правится, только пока она не погашена и не отозвана. */
    #redeem(args: Record<string, unknown>): { count: number } {
        const where: Record<string, unknown> = args['where'] as Record<string, unknown>;
        const data: { redeemedAt: Date } = args['data'] as { redeemedAt: Date };
        const hit: IInviteRow[] = this.invites.filter(
            (row: IInviteRow): boolean => row.id === where['id'] && row.redeemedAt === null && row.revokedAt === null
        );
        hit.forEach((row: IInviteRow): void => {
            row.redeemedAt = data.redeemedAt;
            row.activeName = null;
        });

        return { count: hit.length };
    }

    #updateInvite(args: Record<string, unknown>): IInviteRow | undefined {
        const where: { id: string } = args['where'] as { id: string };
        const data: Partial<IInviteRow> = args['data'] as Partial<IInviteRow>;
        const found: IInviteRow | undefined = this.invites.find((row: IInviteRow): boolean => row.id === where.id);

        return found ? Object.assign(found, data) : undefined;
    }
}

/** Обращение так, как его видит операция: адрес клиента приходит заголовком. */
function request(ip: string = '10.0.0.7'): { ip: string; headers: Record<string, string> } {
    return { ip, headers: {} };
}

/** Текст отказа обращения: сравнивается дословно — по разнице ответов видно, что заведено. */
async function refusalOf(controller: EnrollController): Promise<string> {
    try {
        await controller.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW);
    } catch (error: unknown) {
        return error instanceof Error ? error.message : String(error);
    }

    return 'отказа не было';
}

describe('EnrollController', () => {
    let db: PrismaDouble;
    let enroll: EnrollController;

    beforeEach((): void => {
        db = new PrismaDouble();
        enroll = new EnrollController(db as unknown as PrismaService, new RateLimitService());
    });

    it('SC-MB-117 — годное приглашение заводит дерево и отдаёт токен', async () => {
        db.invite();

        const granted: IEnrollGranted = await enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW);

        expect(granted.tree).toBe('own-tree');
        expect(granted.name).toBe('Своё дерево');
        expect(granted.token).toMatch(/^[0-9a-f]{64}$/);

        expect(db.trees).toEqual([{ id: 'tree-2', slug: 'own-tree', name: 'Своё дерево' }]);
        expect(db.tokens).toHaveLength(1);
        expect(db.tokens[0].hash).toBe(treeTokenHash(granted.token));
        expect(JSON.stringify(db.tokens)).not.toContain(granted.token);
    });

    it('SC-MB-118 — приглашение гаснет первым же удачным обращением, и второе отбивается', async () => {
        db.invite();
        await enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW);

        await expect(enroll.enroll({ code: CODE, tree: 'other-tree' }, request(), NOW)).rejects.toThrow(UnauthorizedException);
        expect(db.trees).toHaveLength(1);
        expect(db.invites[0].redeemedAt).toEqual(db.invites[0].redeemedAt);
        expect(db.invites[0].activeName).toBeNull();
    });

    it('SC-MB-118 — погашенное приглашение помечено деревом, которое им завелось', async () => {
        db.invite();
        await enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW);

        expect(db.invites[0].treeId).toBe('tree-2');
    });

    it('SC-MB-119 — просроченное приглашение не принимается', async () => {
        db.invite({ expiresAt: new Date(NOW.getTime() - 1) });

        await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(UnauthorizedException);
        expect(db.trees).toHaveLength(0);
    });

    it('SC-MB-120 — отозванное приглашение не принимается, а запись об отзыве остаётся', async () => {
        db.invite({ revokedAt: NOW, activeName: null });

        await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(UnauthorizedException);
        expect(db.invites[0].revokedAt).toEqual(NOW);
        expect(db.trees).toHaveLength(0);
    });

    it('SC-MB-121 — четыре негодных состояния отвечают одним и тем же текстом', async () => {
        const said: string[] = [];

        for (const patch of [null, { redeemedAt: NOW }, { expiresAt: new Date(NOW.getTime() - 1) }, { revokedAt: NOW }]) {
            const fresh: PrismaDouble = new PrismaDouble();

            if (patch) {
                fresh.invite(patch);
            }

            const controller: EnrollController = new EnrollController(fresh as unknown as PrismaService, new RateLimitService());

            said.push(await refusalOf(controller));
        }

        expect(new Set(said).size).toBe(1);
    });

    it('SC-MB-122 — заведённый признак обращением не перезаводится', async () => {
        db.invite();
        db.clashes = true;

        await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(ConflictException);
        expect(db.invites[0].redeemedAt).toBeNull();
    });

    it('SC-MB-123 — имя берётся из приглашения, а не из обращения', async () => {
        db.invite({ name: 'Имя из приглашения', activeName: 'Имя из приглашения' });

        const granted: IEnrollGranted = await enroll.enroll({ code: CODE, tree: 'own-tree', name: 'Чужое имя' }, request(), NOW);

        expect(granted.name).toBe('Имя из приглашения');
        expect(db.trees[0].name).toBe('Имя из приглашения');
    });

    it('SC-MB-124 — обращения сверх предела с одного ключа отбиваются, и записей от них нет', async () => {
        for (let at: number = 0; at < ENROLL_LIMIT; at++) {
            await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(UnauthorizedException);
        }

        await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(BadRequestException);
        expect(db.trees).toHaveLength(0);
    });

    it('SC-MB-124 — предел считается по ключу клиента, и соседний ключ его не задевает', async () => {
        for (let at: number = 0; at < ENROLL_LIMIT; at++) {
            await expect(enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW)).rejects.toThrow(UnauthorizedException);
        }

        db.invite();

        const granted: IEnrollGranted = await enroll.enroll({ code: CODE, tree: 'own-tree' }, request('10.0.0.8'), NOW);

        expect(granted.token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('SC-MB-125 — ни код приглашения, ни токен в записи журнала не попадают', async () => {
        db.invite();
        const written: unknown[] = [];
        const saidLog: (...args: unknown[]) => void = Logger.prototype.log;
        const saidWarn: (...args: unknown[]) => void = Logger.prototype.warn;
        Logger.prototype.log = (...args: unknown[]): void => void written.push(...args);
        Logger.prototype.warn = (...args: unknown[]): void => void written.push(...args);

        try {
            const granted: IEnrollGranted = await enroll.enroll({ code: CODE, tree: 'own-tree' }, request(), NOW);
            const printed: string = JSON.stringify(written);

            expect(printed).toContain('enroll-granted');
            expect(printed).toContain('own-tree');
            expect(printed).not.toContain(CODE);
            expect(printed).not.toContain(granted.token);
        } finally {
            Logger.prototype.log = saidLog;
            Logger.prototype.warn = saidWarn;
        }
    });

    it('обращение без кода или без признака дерева до хранилища не доходит', async () => {
        db.invite();

        await expect(enroll.enroll({ tree: 'own-tree' }, request(), NOW)).rejects.toThrow(BadRequestException);
        await expect(enroll.enroll({ code: CODE }, request(), NOW)).rejects.toThrow(BadRequestException);
        expect(db.trees).toHaveLength(0);
    });
});
