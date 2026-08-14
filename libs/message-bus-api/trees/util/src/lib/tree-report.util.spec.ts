import { describe, expect, it } from 'vitest';

import { ITreeSummaryRow, tokenIssuedLines, treeListLines } from './tree-report.util';

/** Дерево списка: годный токен, признак и день последнего прогона. */
function row(patch: Partial<ITreeSummaryRow> = {}): ITreeSummaryRow {
    return { slug: 'own-tree', name: 'Своё дерево', tokenLive: true, ranAt: new Date('2026-08-14T21:30:00Z'), ...patch };
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
