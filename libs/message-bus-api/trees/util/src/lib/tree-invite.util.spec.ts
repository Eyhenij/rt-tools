import { describe, expect, it } from 'vitest';

import { ETreeInviteView } from '@rt/message-bus-common';

import {
    INVITE_HOURS,
    inviteCodeHash,
    inviteExpiry,
    inviteState,
    inviteUsable,
    issueInviteCode,
    ITreeInviteRecord,
} from './tree-invite.util';

/** Момент, от которого считаются сроки: он приходит доводом, а не читается часами машины. */
const NOW: Date = new Date('2026-08-17T10:00:00.000Z');

function invite(overrides: Partial<ITreeInviteRecord> = {}): ITreeInviteRecord {
    return {
        name: 'Своё дерево',
        issuedAt: NOW,
        expiresAt: inviteExpiry(NOW),
        redeemedAt: null,
        revokedAt: null,
        treeSlug: null,
        ...overrides,
    };
}

describe('issueInviteCode', () => {
    it('код длиной в тридцать два байта: подбирать его не дешевле, чем токен', () => {
        expect(issueInviteCode()).toMatch(/^[0-9a-f]{64}$/);
    });

    it('два выпуска подряд дают разные коды', () => {
        expect(issueInviteCode()).not.toBe(issueInviteCode());
    });
});

describe('inviteCodeHash', () => {
    it('хеш один и тот же у одного кода и разный у разных', () => {
        expect(inviteCodeHash('код')).toBe(inviteCodeHash('код'));
        expect(inviteCodeHash('код')).not.toBe(inviteCodeHash('другой код'));
    });

    it('сам код в хеше не читается', () => {
        expect(inviteCodeHash('код')).not.toContain('код');
    });
});

describe('inviteExpiry', () => {
    it('срок годности отсчитывается от момента выдачи', () => {
        expect(inviteExpiry(NOW, 2).toISOString()).toBe('2026-08-17T12:00:00.000Z');
    });

    it('по умолчанию приглашение годно двое суток', () => {
        expect(inviteExpiry(NOW).getTime() - NOW.getTime()).toBe(INVITE_HOURS * 60 * 60 * 1000);
    });
});

describe('inviteState', () => {
    it('свежее приглашение ждёт', () => {
        expect(inviteState(invite(), NOW)).toBe(ETreeInviteView.Waiting);
    });

    it('приглашение, которым воспользовались, погашено', () => {
        expect(inviteState(invite({ redeemedAt: NOW, treeSlug: 'own-tree' }), NOW)).toBe(ETreeInviteView.Redeemed);
    });

    it('снятое владельцем приглашение отозвано', () => {
        expect(inviteState(invite({ revokedAt: NOW }), NOW)).toBe(ETreeInviteView.Revoked);
    });

    it('приглашение просрочено в тот же миг, когда срок вышел', () => {
        const at: Date = inviteExpiry(NOW);

        expect(inviteState(invite(), at)).toBe(ETreeInviteView.Expired);
    });

    it('погашенное остаётся погашенным и после того, как срок вышел', () => {
        const at: Date = inviteExpiry(NOW, INVITE_HOURS * 2);

        expect(inviteState(invite({ redeemedAt: NOW, treeSlug: 'own-tree' }), at)).toBe(ETreeInviteView.Redeemed);
    });

    it('отозванное остаётся отозванным и после того, как срок вышел', () => {
        const at: Date = inviteExpiry(NOW, INVITE_HOURS * 2);

        expect(inviteState(invite({ revokedAt: NOW }), at)).toBe(ETreeInviteView.Revoked);
    });
});

describe('inviteUsable', () => {
    it('годно только ждущее приглашение', () => {
        expect(inviteUsable(invite(), NOW)).toBe(true);
    });

    it('погашенное, отозванное и просроченное негодны одинаково', () => {
        const expired: Date = inviteExpiry(NOW);

        expect(inviteUsable(invite({ redeemedAt: NOW }), NOW)).toBe(false);
        expect(inviteUsable(invite({ revokedAt: NOW }), NOW)).toBe(false);
        expect(inviteUsable(invite(), expired)).toBe(false);
    });
});
