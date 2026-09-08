import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { inviteCodeHash, inviteExpiry } from '@rt/message-bus-api/trees/util';
import { ETreeInviteView, IPage, ITreeInviteIssued, ITreeInviteView } from '@rt/message-bus-common';

import { InvitesReadController } from './invites-read.controller';

interface IInviteRow {
    id: string;
    name: string;
    /** Хеш кода: сам код в хранилище не попадает никогда. */
    hash?: string;
    activeName: string | null;
    issuedAt: Date;
    expiresAt: Date;
    redeemedAt: Date | null;
    revokedAt: Date | null;
    tree: { slug: string } | null;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

/**
 * Момент, от которого считаются сроки строк образца и на который спрашивается список.
 *
 * Тем же моментом зовутся сами методы: просроченность считается на момент запроса, и приёмник,
 * читающий часы машины, сделал бы образец годным ровно двое суток. Так и вышло — прогон,
 * начавшийся через сорок восемь часов после этой даты, покраснел тремя сценариями сразу.
 */
const NOW: Date = new Date('2026-08-17T10:00:00.000Z');

/** Строка дерева у двойника: столько, сколько читает поиск дерева по имени. */
interface ITreeRow {
    id: string;
    slug: string;
    name: string;
}

/** Двойник хранилища: строки лежат открыто, отбор он делает сам. */
class PrismaDouble {
    #nextId: number = 1;

    public readonly invites: IInviteRow[] = [];
    public readonly trees: ITreeRow[] = [];

    /** Сделка двойника: вызовы к этому месту уже сделаны, ждать остаётся их обещаний. */
    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    public get tree(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;

                return this.trees.find((row: ITreeRow): boolean => row.name === where['name']) ?? null;
            },
        };
    }

    public get treeInvite(): Record<string, TQuery> {
        return {
            count: async (): Promise<unknown> => this.invites.length,
            findMany: async (args: Record<string, unknown>): Promise<unknown> => {
                const ordered: IInviteRow[] = [...this.invites].sort(
                    (left: IInviteRow, right: IInviteRow): number => right.issuedAt.getTime() - left.issuedAt.getTime()
                );
                const skip: number = (args['skip'] as number | undefined) ?? 0;
                const take: number = (args['take'] as number | undefined) ?? ordered.length;

                return ordered.slice(skip, skip + take);
            },
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;

                return (
                    this.invites.find((row: IInviteRow): boolean =>
                        Object.keys(where).every((key: string): boolean => Reflect.get(row, key) === where[key])
                    ) ?? null
                );
            },
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: Record<string, unknown> = (args['where'] ?? {}) as Record<string, unknown>;
                const data: Partial<IInviteRow> = args['data'] ?? {};
                const touched: IInviteRow[] = this.invites.filter(
                    (row: IInviteRow): boolean => row.activeName === where['activeName'] && row.expiresAt.getTime() <= NOW.getTime()
                );
                touched.forEach((row: IInviteRow): void => {
                    Object.assign(row, data);
                });

                return { count: touched.length };
            },
            create: async (args: Record<string, unknown>): Promise<unknown> => {
                const data: Record<string, unknown> = (args['data'] ?? {}) as Record<string, unknown>;

                return this.invite({
                    name: data['name'] as string,
                    activeName: data['activeName'] as string,
                    hash: data['hash'] as string,
                    expiresAt: data['expiresAt'] as Date,
                });
            },
            update: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { id: string } = args['where'] as { id: string };
                const data: Partial<IInviteRow> = args['data'] as Partial<IInviteRow>;
                const found: IInviteRow | undefined = this.invites.find((row: IInviteRow): boolean => row.id === where.id);

                return found ? Object.assign(found, data) : undefined;
            },
        };
    }

    /** Заведённое дерево: столько, сколько нужно, чтобы имя оказалось занятым. */
    public withTree(name: string): ITreeRow {
        const created: ITreeRow = { id: `tree-${this.#nextId++}`, slug: 'own-tree', name };
        this.trees.push(created);

        return created;
    }

    public invite(patch: Partial<IInviteRow> = {}): IInviteRow {
        const created: IInviteRow = {
            id: `invite-${this.#nextId++}`,
            name: 'Своё дерево',
            activeName: 'Своё дерево',
            issuedAt: NOW,
            expiresAt: inviteExpiry(NOW),
            redeemedAt: null,
            revokedAt: null,
            tree: null,
            ...patch,
        };
        this.invites.push(created);

        return created;
    }
}

describe('InvitesReadController', () => {
    let db: PrismaDouble;
    let invites: InvitesReadController;

    beforeEach((): void => {
        db = new PrismaDouble();
        invites = new InvitesReadController(db as unknown as PrismaService);
    });

    it('SC-MB-128 — список называет имя, состояние и сроки, а кода в нём нет', async () => {
        db.invite();

        const page: IPage<ITreeInviteView> = await invites.page({}, NOW);

        expect(page.rows).toHaveLength(1);
        expect(page.rows[0].name).toBe('Своё дерево');
        expect(page.rows[0].state).toBe(ETreeInviteView.Waiting);
        expect(page.rows[0].issuedAt).toBe(NOW.toISOString());
        expect(JSON.stringify(page.rows)).toContain('Своё дерево');
        expect(JSON.stringify(page.rows)).not.toContain('hash');
    });

    it('SC-MB-128 — погашенное приглашение из списка не выпадает и называет своё дерево', async () => {
        db.invite({ redeemedAt: NOW, activeName: null, tree: { slug: 'own-tree' } });

        const page: IPage<ITreeInviteView> = await invites.page({}, NOW);

        expect(page.rows[0].state).toBe(ETreeInviteView.Redeemed);
        expect(page.rows[0].treeSlug).toBe('own-tree');
    });

    it('SC-MB-128 — просроченность считается на момент запроса, а не хранится колонкой', async () => {
        db.invite({ expiresAt: new Date(NOW.getTime() - 1000) });

        expect((await invites.page({}, NOW)).rows[0].state).toBe(ETreeInviteView.Expired);
    });

    it('SC-MB-128 — список приезжает страницей: строки режутся размером, а общее число называет все', async () => {
        db.invite({ issuedAt: new Date('2026-08-17T12:00:00.000Z') });
        db.invite({ issuedAt: new Date('2026-08-17T11:00:00.000Z'), activeName: 'Второе дерево', name: 'Второе дерево' });
        db.invite({ issuedAt: new Date('2026-08-17T10:00:00.000Z'), activeName: 'Третье дерево', name: 'Третье дерево' });

        const second: IPage<ITreeInviteView> = await invites.page({ page: '2', size: '2' }, NOW);

        expect(second.total).toBe(3);
        expect(second.page).toBe(2);
        expect(second.size).toBe(2);
        expect(second.rows).toHaveLength(1);
        expect(second.rows[0].name).toBe('Третье дерево');
    });

    it('SC-MB-128 — выборка, которая не разобралась, отбивается с именем параметра', async () => {
        await expect(invites.page({ sort: 'state' }, NOW)).rejects.toThrow(BadRequestException);
        await expect(invites.page({ page: 'вторая' }, NOW)).rejects.toThrow(BadRequestException);
    });

    it('SC-MB-120 — отзыв снимает приглашение, а запись о нём остаётся', async () => {
        db.invite();

        const revoked: ITreeInviteView = await invites.revoke('Своё дерево', NOW);

        expect(revoked.state).toBe(ETreeInviteView.Revoked);
        expect(db.invites).toHaveLength(1);
        expect(db.invites[0].revokedAt).not.toBeNull();
        expect(db.invites[0].activeName).toBeNull();
    });

    it('SC-MB-120 — отзыв погашенного и несуществующего отвечает одинаково', async () => {
        db.invite({ redeemedAt: NOW, activeName: null });

        await expect(invites.revoke('Своё дерево', NOW)).rejects.toThrow(NotFoundException);
        await expect(invites.revoke('Чужое дерево', NOW)).rejects.toThrow(NotFoundException);
    });

    it('SC-MB-156 — выдача отдаёт код один раз, а в хранилище кладёт только его хеш', async () => {
        const issued: ITreeInviteIssued = await invites.issue({ name: 'Своё дерево' }, NOW);

        expect(issued.name).toBe('Своё дерево');
        expect(issued.code).toHaveLength(64);
        expect(issued.issuedAt).toBe(NOW.toISOString());
        expect(issued.expiresAt).toBe(inviteExpiry(NOW).toISOString());

        expect(db.invites).toHaveLength(1);
        expect(db.invites[0].hash).toBe(inviteCodeHash(issued.code));
        expect(JSON.stringify(db.invites)).not.toContain(issued.code);
    });

    it('SC-MB-157 — выданное приглашение сразу стоит в списке ждущим', async () => {
        const issued: ITreeInviteIssued = await invites.issue({ name: 'Своё дерево' }, NOW);
        const page: IPage<ITreeInviteView> = await invites.page({}, NOW);

        expect(page.rows).toHaveLength(1);
        expect(page.rows[0].name).toBe(issued.name);
        expect(page.rows[0].state).toBe(ETreeInviteView.Waiting);
    });

    it('SC-MB-158 — кода выданного приглашения нет ни в одной строке списка', async () => {
        const issued: ITreeInviteIssued = await invites.issue({ name: 'Своё дерево' }, NOW);
        const page: IPage<ITreeInviteView> = await invites.page({}, NOW);

        expect(page.rows[0].name).toBe('Своё дерево');
        expect(JSON.stringify(page.rows)).not.toContain(issued.code);
    });

    it('SC-MB-159 — годное приглашение на то же имя отбивает выдачу', async () => {
        db.invite();

        await expect(invites.issue({ name: 'Своё дерево' }, NOW)).rejects.toThrow(ConflictException);
        expect(db.invites).toHaveLength(1);
    });

    it('SC-MB-159 — негодное приглашение выдаче не мешает: просроченное имя держать перестаёт', async () => {
        db.invite({ expiresAt: new Date('2026-08-17T09:00:00.000Z') });

        const issued: ITreeInviteIssued = await invites.issue({ name: 'Своё дерево' }, NOW);

        expect(issued.code).toHaveLength(64);
        expect(db.invites).toHaveLength(2);
    });

    it('SC-MB-160 — имя заведённого дерева отбивает выдачу', async () => {
        db.withTree('Своё дерево');

        await expect(invites.issue({ name: 'Своё дерево' }, NOW)).rejects.toThrow(ConflictException);
        expect(db.invites).toEqual([]);
    });

    it('SC-MB-156 — выдача без имени отбивается и ничего не заводит', async () => {
        await expect(invites.issue({}, NOW)).rejects.toThrow(BadRequestException);
        await expect(invites.issue({ name: '   ' }, NOW)).rejects.toThrow(BadRequestException);
        expect(db.invites).toEqual([]);
    });

    it('SC-MB-161 — выдача объявлена закрытой правом, а не токеном дерева', () => {
        const access: unknown = Reflect.getMetadata(OPERATION_ACCESS, InvitesReadController.prototype.issue);
        const right: unknown = Reflect.getMetadata(OPERATION_RIGHT, InvitesReadController.prototype.issue);

        expect(access).toBe('permission');
        expect(right).toBe('invites:manage');
    });

    it('SC-MB-304 — список приглашений закрыт правом чтения своего раздела', () => {
        const access: unknown = Reflect.getMetadata(OPERATION_ACCESS, InvitesReadController.prototype.page);
        const right: unknown = Reflect.getMetadata(OPERATION_RIGHT, InvitesReadController.prototype.page);

        expect(access).toBe('permission');
        expect(right).toBe('invites:read');
    });

    it('пустой список приглашений — это пустая страница, а не отказ', async () => {
        const page: IPage<ITreeInviteView> = await invites.page({}, NOW);

        expect(page.rows).toEqual([]);
        expect(page.total).toBe(0);
    });
});
