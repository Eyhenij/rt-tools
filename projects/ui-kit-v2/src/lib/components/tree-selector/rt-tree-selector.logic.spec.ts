import { IRtTree } from '../tree/rt-tree.model';
import { rtTreeSelectorCanApply, rtTreeSelectorClear, rtTreeSelectorFilter, rtTreeSelectorSame } from './rt-tree-selector.logic';

const NODES: ReadonlyArray<IRtTree.Node<string>> = [
    {
        label: 'France',
        value: 'fr',
        children: [
            { label: 'Paris Hilton', value: 'ph' },
            { label: 'Paris Ritz', value: 'pr', badges: [{ text: 'Luxury' }] },
        ],
    },
    {
        label: 'Germany',
        value: 'de',
        children: [
            { label: 'Berlin Hilton', value: 'bh', description: 'Mitte' },
            { label: 'Berlin Adlon', value: 'ba', disabled: true },
        ],
    },
];

function values(nodes: ReadonlyArray<IRtTree.Node<string>>): string[] {
    return nodes.flatMap((node: IRtTree.Node<string>): string[] => [node.value, ...values(node.children ?? [])]);
}

describe('rt-tree-selector logic', (): void => {
    it('SC-UKV-677: keeps the nodes holding every word and their paths', (): void => {
        expect(values(rtTreeSelectorFilter(NODES, 'hilton  PARIS'))).toEqual(['fr', 'ph']);
    });

    it('SC-UKV-677: looks for a word in the description and the badges too', (): void => {
        expect(values(rtTreeSelectorFilter(NODES, 'mitte'))).toEqual(['de', 'bh']);
        expect(values(rtTreeSelectorFilter(NODES, 'luxury'))).toEqual(['fr', 'pr']);
    });

    it('SC-UKV-678: a branch that matches keeps its whole subtree', (): void => {
        expect(values(rtTreeSelectorFilter(NODES, 'germany'))).toEqual(['de', 'bh', 'ba']);
    });

    it('leaves the nodes unchanged and returns them as they are for an empty term', (): void => {
        expect(rtTreeSelectorFilter(NODES, '  ')).toBe(NODES);
        rtTreeSelectorFilter(NODES, 'paris');
        expect(NODES[0].children?.length).toBe(2);
    });

    it('SC-UKV-683: clear keeps the disabled chosen nodes', (): void => {
        expect(rtTreeSelectorClear(NODES, ['ph', 'ba'])).toEqual(['ba']);
    });

    it('compares choices without the order', (): void => {
        expect(rtTreeSelectorSame(['a', 'b'], ['b', 'a'])).toBe(true);
        expect(rtTreeSelectorSame(['a'], ['a', 'b'])).toBe(false);
    });

    it('SC-UKV-682: apply is off while nothing changed and while an empty draft is not allowed', (): void => {
        expect(rtTreeSelectorCanApply(['a'], ['a'], false)).toBe(false);
        expect(rtTreeSelectorCanApply([], ['a'], false)).toBe(false);
        expect(rtTreeSelectorCanApply([], ['a'], true)).toBe(true);
        expect(rtTreeSelectorCanApply(['b'], ['a'], false)).toBe(true);
    });
});
