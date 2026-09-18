import { ETreeInviteView } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { inviteCanRevoke, inviteRowHasActions, inviteStateKey } from './invite.logic';
import { IInvite } from './invite.model';

function row(patch: Partial<IInvite.Short.State> = {}): IInvite.Short.State {
    return {
        name: 'Своё дерево',
        state: ETreeInviteView.Waiting,
        issuedAt: new Date('2026-08-17T10:00:00.000Z'),
        expiresAt: new Date('2026-08-19T10:00:00.000Z'),
        treeSlug: '',
        canRevoke: true,
        ...patch,
    };
}

describe('inviteStateKey', () => {
    it('SC-MB-128 — у каждого состояния свой ключ словаря, а не машинная строка', () => {
        expect(inviteStateKey(ETreeInviteView.Waiting)).toBe('inviteStateWaiting');
        expect(inviteStateKey(ETreeInviteView.Redeemed)).toBe('inviteStateRedeemed');
        expect(inviteStateKey(ETreeInviteView.Expired)).toBe('inviteStateExpired');
        expect(inviteStateKey(ETreeInviteView.Revoked)).toBe('inviteStateRevoked');
    });
});

describe('inviteCanRevoke', () => {
    it('SC-MB-120 — отзывается только ждущее приглашение', () => {
        expect(inviteCanRevoke(ETreeInviteView.Waiting)).toBe(true);
    });

    it('SC-MB-120 — погашенное, просроченное и отозванное отзывать нечего', () => {
        expect(inviteCanRevoke(ETreeInviteView.Redeemed)).toBe(false);
        expect(inviteCanRevoke(ETreeInviteView.Expired)).toBe(false);
        expect(inviteCanRevoke(ETreeInviteView.Revoked)).toBe(false);
    });
});

describe('inviteRowHasActions', () => {
    it('SC-MB-120 — у строки без доступного отзыва действий не остаётся', () => {
        expect(inviteRowHasActions(row())).toBe(true);
        expect(inviteRowHasActions(row({ canRevoke: false }))).toBe(false);
    });
});
