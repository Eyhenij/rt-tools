import { ETreeInviteView } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { inviteCanRevoke, inviteRevokeQuestion, inviteRowHasActions, inviteStateLabel } from './invite.logic';
import { IInvite } from './invite.model';

function row(patch: Partial<IInvite.Short.State> = {}): IInvite.Short.State {
    return {
        name: 'Своё дерево',
        state: ETreeInviteView.Waiting,
        stateLabel: inviteStateLabel(ETreeInviteView.Waiting),
        issuedAt: new Date('2026-08-17T10:00:00.000Z'),
        expiresAt: new Date('2026-08-19T10:00:00.000Z'),
        treeSlug: '',
        canRevoke: true,
        revokeQuestion: inviteRevokeQuestion('Своё дерево'),
        ...patch,
    };
}

describe('inviteStateLabel', () => {
    it('SC-MB-128 — каждое состояние названо по-русски, а не машинной строкой', () => {
        expect(inviteStateLabel(ETreeInviteView.Waiting)).toBe('Ждёт');
        expect(inviteStateLabel(ETreeInviteView.Redeemed)).toBe('Погашено');
        expect(inviteStateLabel(ETreeInviteView.Expired)).toBe('Просрочено');
        expect(inviteStateLabel(ETreeInviteView.Revoked)).toBe('Отозвано');
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

describe('inviteRevokeQuestion', () => {
    it('SC-MB-120 — вопрос называет дерево и последствие, а не спрашивает «вы уверены»', () => {
        const question: string = inviteRevokeQuestion('Своё дерево');

        expect(question).toContain('Своё дерево');
        expect(question).toContain('Вернуть его нельзя');
    });
});

describe('inviteRowHasActions', () => {
    it('SC-MB-120 — у строки без доступного отзыва действий не остаётся', () => {
        expect(inviteRowHasActions(row())).toBe(true);
        expect(inviteRowHasActions(row({ canRevoke: false }))).toBe(false);
    });
});
