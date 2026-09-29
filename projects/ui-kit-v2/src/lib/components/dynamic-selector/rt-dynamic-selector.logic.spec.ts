import {
    addDynamicText,
    clearDynamicKeys,
    dynamicSelectAllState,
    dynamicSelectorMatches,
    moveDynamicKey,
    renameDynamicText,
    sameDynamicKeys,
    sameDynamicKeySet,
    selectAllDynamicKeys,
    selectableDynamicItems,
    toggleDynamicKey,
} from './rt-dynamic-selector.logic';

interface IItem {
    readonly id: number;
    readonly name: unknown;
}

const ITEMS: readonly IItem[] = [
    { id: 1, name: 'Склад на Лесной' },
    { id: 2, name: 'Отчёт за март' },
    { id: 3, name: 'Март, отчёт по складу' },
    { id: 4, name: { nested: true } },
    { id: 5, name: 42 },
];
const keyOf: (item: IItem) => number = (item: IItem): number => item.id;
const labelOf: (item: IItem) => unknown = (item: IItem): unknown => item.name;

describe('rt-dynamic-selector.logic', (): void => {
    it('SC-UKV-442 — every word of the query has to occur in the label, case-insensitive', (): void => {
        expect(dynamicSelectorMatches('Март, отчёт по складу', 'отчёт МАРТ')).toBe(true);
        expect(dynamicSelectorMatches('Отчёт за апрель', 'отчёт март')).toBe(false);
        expect(dynamicSelectorMatches('Любая подпись', '   ')).toBe(true);
    });

    it('SC-UKV-441 — chosen items and items without a label are not offered, the rest go by the alphabet', (): void => {
        const offered: number[] = selectableDynamicItems(ITEMS, [1], keyOf, labelOf, '').map(keyOf);

        expect(offered).toEqual([5, 3, 2]);
    });

    it('SC-UKV-441 — the app sort function replaces the alphabet', (): void => {
        const offered: number[] = selectableDynamicItems(
            ITEMS,
            [],
            keyOf,
            labelOf,
            'март',
            (a: IItem, b: IItem): number => b.id - a.id
        ).map(keyOf);

        expect(offered).toEqual([3, 2]);
    });

    it('SC-UKV-436 — a key is added once and removed wholly', (): void => {
        expect(toggleDynamicKey([1, 2], 2, true)).toEqual([1, 2]);
        expect(toggleDynamicKey([1, 2], 3, true)).toEqual([1, 2, 3]);
        expect(toggleDynamicKey([1, 2, 3], 2, false)).toEqual([1, 3]);
    });

    it('SC-UKV-445 — select all reads none, some and all by the visible keys', (): void => {
        expect(dynamicSelectAllState([1, 2], [7])).toBe('none');
        expect(dynamicSelectAllState([1, 2], [1, 7])).toBe('some');
        expect(dynamicSelectAllState([1, 2], [2, 1])).toBe('all');
    });

    it('SC-UKV-444 — select all adds the visible keys and unchecking keeps picks outside the query', (): void => {
        expect(selectAllDynamicKeys([1, 2], [7, 1], true)).toEqual([7, 1, 2]);
        expect(selectAllDynamicKeys([1, 2], [7, 1, 2], false)).toEqual([7]);
    });

    it('SC-UKV-438 — clear keeps only read-only keys in their order', (): void => {
        expect(clearDynamicKeys([3, 1, 2], [2, 3])).toEqual([3, 2]);
    });

    it('SC-UKV-437 — reset and clear know when there is nothing to do', (): void => {
        expect(sameDynamicKeys([1, 2], [1, 2])).toBe(true);
        expect(sameDynamicKeys([1, 2], [2, 1])).toBe(false);
        expect(sameDynamicKeySet([2, 1], [1, 2])).toBe(true);
        expect(sameDynamicKeySet([1], [1, 2])).toBe(false);
    });

    it('SC-UKV-440 — a dragged key lands on its new place, an index outside the list is clamped', (): void => {
        expect(moveDynamicKey([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
        expect(moveDynamicKey([1, 2, 3], 2, -5)).toEqual([3, 1, 2]);
        expect(moveDynamicKey([1, 2, 3], 9, 0)).toEqual([1, 2, 3]);
    });

    it('SC-UKV-453 — typed text is trimmed before it is added', (): void => {
        expect(addDynamicText(['a'], '  b ')).toEqual(['a', 'b']);
    });

    it('SC-UKV-454 — a blank or repeated string is not added', (): void => {
        expect(addDynamicText(['a'], ' a ')).toEqual(['a']);
        expect(addDynamicText(['a'], '   ')).toEqual(['a']);
        expect(addDynamicText(['a'], null)).toEqual(['a']);
    });

    it('SC-UKV-456 — an edit replaces the row in place unless it is blank or repeats another row', (): void => {
        expect(renameDynamicText(['a', 'b'], 'a', ' c ')).toEqual(['c', 'b']);
        expect(renameDynamicText(['a', 'b'], 'a', 'b')).toEqual(['a', 'b']);
        expect(renameDynamicText(['a', 'b'], 'a', '  ')).toEqual(['a', 'b']);
    });
});
