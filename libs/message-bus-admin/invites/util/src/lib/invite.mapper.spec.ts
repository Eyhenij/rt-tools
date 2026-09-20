import { ETreeInviteView } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { InviteShortMapper } from './invite.mapper';
import { IInvite } from './invite.model';

const MAPPER: InviteShortMapper = new InviteShortMapper();

function raw(patch: Partial<IInvite.Short.Api> = {}): IInvite.Short.Api {
    return {
        name: 'Своё дерево',
        state: ETreeInviteView.Waiting,
        issuedAt: '2026-08-17T10:00:00.000Z',
        expiresAt: '2026-08-19T10:00:00.000Z',
        treeSlug: null,
        ...patch,
    };
}

describe('InviteShortMapper', () => {
    it('SC-MB-128 — времена ответа становятся временем, а состояние — подписью', () => {
        const row: IInvite.Short.State = MAPPER.mapFrom(raw());

        expect(row.name).toBe('Своё дерево');
        expect(row.issuedAt.toISOString()).toBe('2026-08-17T10:00:00.000Z');
        expect(row.expiresAt.toISOString()).toBe('2026-08-19T10:00:00.000Z');
    });

    it('SC-MB-128 — непогашенное приглашение показывает пустое место, а не отсутствие поля', () => {
        expect(MAPPER.mapFrom(raw()).treeSlug).toBe('');
        expect(MAPPER.mapFrom(raw({ treeSlug: 'own-tree', state: ETreeInviteView.Redeemed })).treeSlug).toBe('own-tree');
    });

    it('SC-MB-120 — доступность отзыва приезжает полем строки, а не считается на экране', () => {
        expect(MAPPER.mapFrom(raw()).canRevoke).toBe(true);
        expect(MAPPER.mapFrom(raw({ state: ETreeInviteView.Redeemed })).canRevoke).toBe(false);
    });

    it('SC-MB-128 — состояние вне набора не роняет строку и читается как ждущее', () => {
        const row: IInvite.Short.State = MAPPER.mapFrom(raw({ state: 'выдумано' as ETreeInviteView }));

        expect(row.state).toBe(ETreeInviteView.Waiting);
    });
});
