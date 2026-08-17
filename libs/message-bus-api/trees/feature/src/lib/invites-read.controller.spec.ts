import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { inviteExpiry } from '@rt/message-bus-api/trees/util';
import { ETreeInviteView, IPage, ITreeInviteView } from '@rt/message-bus-common';

import { InvitesReadController } from './invites-read.controller';

interface IInviteRow {
    id: string;
    name: string;
    activeName: string | null;
    issuedAt: Date;
    expiresAt: Date;
    redeemedAt: Date | null;
    revokedAt: Date | null;
    tree: { slug: string } | null;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

/** Момент, от которого считаются сроки строк образца. */
const NOW: Date = new Date('2026-08-17T10:00:00.000Z');

/** Двойник хранилища: строки лежат открыто, отбор он делает сам. */
class PrismaDouble {
    #nextId: number = 1;

    public readonly invites: IInviteRow[] = [];

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
            update: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { id: string } = args['where'] as { id: string };
                const data: Partial<IInviteRow> = args['data'] as Partial<IInviteRow>;
                const found: IInviteRow | undefined = this.invites.find((row: IInviteRow): boolean => row.id === where.id);

                return found ? Object.assign(found, data) : undefined;
            },
        };
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

        const page: IPage<ITreeInviteView> = await invites.page({});

        expect(page.rows).toHaveLength(1);
        expect(page.rows[0].name).toBe('Своё дерево');
        expect(page.rows[0].state).toBe(ETreeInviteView.Waiting);
        expect(page.rows[0].issuedAt).toBe(NOW.toISOString());
        expect(JSON.stringify(page.rows)).toContain('Своё дерево');
        expect(JSON.stringify(page.rows)).not.toContain('hash');
    });

    it('SC-MB-128 — погашенное приглашение из списка не выпадает и называет своё дерево', async () => {
        db.invite({ redeemedAt: NOW, activeName: null, tree: { slug: 'own-tree' } });

        const page: IPage<ITreeInviteView> = await invites.page({});

        expect(page.rows[0].state).toBe(ETreeInviteView.Redeemed);
        expect(page.rows[0].treeSlug).toBe('own-tree');
    });

    it('SC-MB-128 — просроченность считается на момент запроса, а не хранится колонкой', async () => {
        db.invite({ expiresAt: new Date(Date.now() - 1000) });

        expect((await invites.page({})).rows[0].state).toBe(ETreeInviteView.Expired);
    });

    it('SC-MB-128 — список приезжает страницей: строки режутся размером, а общее число называет все', async () => {
        db.invite({ issuedAt: new Date('2026-08-17T12:00:00.000Z') });
        db.invite({ issuedAt: new Date('2026-08-17T11:00:00.000Z'), activeName: 'Второе дерево', name: 'Второе дерево' });
        db.invite({ issuedAt: new Date('2026-08-17T10:00:00.000Z'), activeName: 'Третье дерево', name: 'Третье дерево' });

        const second: IPage<ITreeInviteView> = await invites.page({ page: '2', size: '2' });

        expect(second.total).toBe(3);
        expect(second.page).toBe(2);
        expect(second.size).toBe(2);
        expect(second.rows).toHaveLength(1);
        expect(second.rows[0].name).toBe('Третье дерево');
    });

    it('SC-MB-128 — выборка, которая не разобралась, отбивается с именем параметра', async () => {
        await expect(invites.page({ sort: 'state' })).rejects.toThrow(BadRequestException);
        await expect(invites.page({ page: 'вторая' })).rejects.toThrow(BadRequestException);
    });

    it('SC-MB-120 — отзыв снимает приглашение, а запись о нём остаётся', async () => {
        db.invite();

        const revoked: ITreeInviteView = await invites.revoke('Своё дерево');

        expect(revoked.state).toBe(ETreeInviteView.Revoked);
        expect(db.invites).toHaveLength(1);
        expect(db.invites[0].revokedAt).not.toBeNull();
        expect(db.invites[0].activeName).toBeNull();
    });

    it('SC-MB-120 — отзыв погашенного и несуществующего отвечает одинаково', async () => {
        db.invite({ redeemedAt: NOW, activeName: null });

        await expect(invites.revoke('Своё дерево')).rejects.toThrow(NotFoundException);
        await expect(invites.revoke('Чужое дерево')).rejects.toThrow(NotFoundException);
    });

    it('пустой список приглашений — это пустая страница, а не отказ', async () => {
        const page: IPage<ITreeInviteView> = await invites.page({});

        expect(page.rows).toEqual([]);
        expect(page.total).toBe(0);
    });
});
