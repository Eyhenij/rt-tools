import { describe, expect, it } from 'vitest';

import { ETreeInviteView } from '@rt/message-bus-common';

import { inviteIssuedLines, inviteListLines, ITreeInviteRow, ITreeSummaryRow, tokenIssuedLines, treeListLines } from './tree-report.util';

/** Дерево списка: годный токен, признак и день последнего прогона. */
function row(patch: Partial<ITreeSummaryRow> = {}): ITreeSummaryRow {
    return { slug: 'own-tree', name: 'Своё дерево', tokenLive: true, ranAt: new Date('2026-08-14T21:30:00Z'), ...patch };
}

/** До какого дня годно приглашение образца: сроки в выводе показываются днём, без часов. */
const UNTIL: Date = new Date('2026-08-19T10:00:00.000Z');

/** Приглашение списка: имя будущего дерева, состояние и сроки. Кода здесь нет и быть не может. */
function inviteRow(patch: Partial<ITreeInviteRow> = {}): ITreeInviteRow {
    return {
        name: 'Своё дерево',
        state: ETreeInviteView.Waiting,
        issuedAt: new Date('2026-08-17T10:00:00.000Z'),
        expiresAt: UNTIL,
        treeSlug: null,
        ...patch,
    };
}

describe('tokenIssuedLines', () => {
    it('SC-MB-19 — токен стоит в выводе один раз', () => {
        const printed: string = tokenIssuedLines('дерево заведено', 'токен-своего-дерева').join('\n');

        expect(printed).toContain('токен-своего-дерева');
        expect(printed.split('токен-своего-дерева')).toHaveLength(2);
    });
});

describe('treeListLines', () => {
    it('SC-MB-6 — дерево названо вместе с днём последнего прогона', () => {
        const printed: string = treeListLines([row()]).join('\n');

        expect(printed).toContain('Своё дерево (own-tree)');
        expect(printed).toContain('последний прогон 2026-08-14');
    });

    it('SC-MB-6 — дерево с отозванным токеном из списка не выпадает', () => {
        const printed: string = treeListLines([row({ tokenLive: false })]).join('\n');

        expect(printed).toContain('Своё дерево (own-tree)');
        expect(printed).toContain('токен отозван');
    });

    it('SC-MB-6 — дерево, не отчитывавшееся ни разу, названо без дня прогона', () => {
        expect(treeListLines([row({ ranAt: null })]).join('\n')).toContain('прогонов не было');
    });

    it('SC-MB-6 — пустой список говорит, что деревьев нет', () => {
        expect(treeListLines([])).toEqual(['деревьев не заведено ни одного']);
    });
});

describe('inviteIssuedLines', () => {
    it('SC-MB-128 — код стоит в выводе один раз, и рядом сказано, чем им воспользоваться', () => {
        const printed: string = inviteIssuedLines('приглашение выдано', 'код-приглашения', UNTIL).join('\n');

        expect(printed).toContain('код-приглашения');
        expect(printed).toContain('agent-kit enroll');
        expect(printed).toContain('годно до 2026-08-19');
    });
});

describe('inviteListLines', () => {
    it('SC-MB-128 — приглашение названо именем, состоянием и сроками, а кода в списке нет', () => {
        const printed: string = inviteListLines([inviteRow()]).join('\n');

        expect(printed).toContain('Своё дерево');
        expect(printed).toContain('ждёт');
        expect(printed).toContain('выдано 2026-08-17');
        expect(printed).toContain('годно до 2026-08-19');
        expect(printed).not.toContain('код');
    });

    it('SC-MB-128 — погашенное приглашение из списка не выпадает и называет своё дерево', () => {
        const printed: string = inviteListLines([inviteRow({ state: ETreeInviteView.Redeemed, treeSlug: 'own-tree' })]).join('\n');

        expect(printed).toContain('погашено');
        expect(printed).toContain('дерево own-tree');
    });

    it('SC-MB-128 — просроченное и отозванное названы своими словами', () => {
        expect(inviteListLines([inviteRow({ state: ETreeInviteView.Expired })]).join('\n')).toContain('просрочено');
        expect(inviteListLines([inviteRow({ state: ETreeInviteView.Revoked })]).join('\n')).toContain('отозвано');
    });

    it('SC-MB-128 — пустой список говорит, что приглашений нет, и называет команду выдачи', () => {
        expect(inviteListLines([]).join('\n')).toContain('tree:invite');
    });
});
