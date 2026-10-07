import { rtTreeRows } from '../select/rt-select-tree';
import { IRtTree } from '../tree/rt-tree.model';
import {
    rtHybridTreeChoose,
    rtHybridTreeChosenCount,
    rtHybridTreeMark,
    rtHybridTreeSelectAll,
    rtHybridTreeSelectAllMark,
    rtHybridTreeSingleLeaves,
} from './rt-hybrid-tree.logic';
import { IRtHybridTree } from './rt-hybrid-tree.model';

type TNode = IRtHybridTree.Node<string>;

const REVENUE: TNode = { label: 'Revenue', value: 'ty-rev' };
const ROOMS: TNode = { label: 'Rooms', value: 'ty-rooms' };
const LOCKED: TNode = { label: 'ADR', value: 'ty-adr', disabled: true };
const THIS_YEAR: TNode = { label: 'This Year', value: 'ty', single: true, children: [LOCKED, REVENUE, ROOMS] };
const HOTEL: TNode = { label: 'Hotel', value: 'hotel' };
const SEGMENT: TNode = { label: 'Segment', value: 'segment' };
const GROUPING: TNode = { label: 'Grouping', value: 'grouping', children: [HOTEL, SEGMENT] };
const PACE: TNode = { label: 'Room Pace', value: 'pace', children: [GROUPING, THIS_YEAR] };
const TREE: ReadonlyArray<TNode> = [PACE];
const SINGLES: ReadonlySet<string> = rtHybridTreeSingleLeaves(TREE);

const MULTIPLE: IRtHybridTree.ChooseOptions = { mode: 'multiple', cascade: true, alone: false };
const ALONE: IRtHybridTree.ChooseOptions = { mode: 'multiple', cascade: true, alone: true };

function sorted(value: ReadonlyArray<string>): string[] {
    return [...value].sort();
}

function openRows(): ReadonlyArray<IRtTree.Row<string>> {
    return rtTreeRows<string>(TREE, new Set<string>(['pace', 'grouping', 'ty']), '');
}

describe('rt-hybrid-tree logic', (): void => {
    it('the single leaves are the direct leaves of a single group', (): void => {
        expect(sorted([...SINGLES])).toEqual(['ty-adr', 'ty-rev', 'ty-rooms']);
    });

    it('SC-UKV-691 — choosing a single leaf drops its neighbours and keeps the choice outside the group', (): void => {
        const next: ReadonlyArray<string> = rtHybridTreeChoose(TREE, ROOMS, ['hotel', 'ty-rev'], MULTIPLE);

        expect(sorted(next)).toEqual(['hotel', 'ty-rooms']);
    });

    it('SC-UKV-692 — a click on the chosen single leaf clears it', (): void => {
        expect(rtHybridTreeChoose(TREE, ROOMS, ['ty-rooms'], MULTIPLE)).toEqual([]);
    });

    it('SC-UKV-693 — the group radio chooses the first enabled leaf, and a second click clears the group', (): void => {
        const first: ReadonlyArray<string> = rtHybridTreeChoose(TREE, THIS_YEAR, ['hotel'], MULTIPLE);

        expect(sorted(first)).toEqual(['hotel', 'ty-rev']);
        expect(rtHybridTreeMark(THIS_YEAR, first, true, SINGLES)).toBe('all');
        expect(rtHybridTreeChoose(TREE, THIS_YEAR, first, MULTIPLE)).toEqual(['hotel']);
    });

    it('SC-UKV-694 — select-all fills the free leaves only, and unticking clears the single ones too', (): void => {
        const rows: ReadonlyArray<IRtTree.Row<string>> = openRows();
        const all: ReadonlyArray<string> = rtHybridTreeSelectAll(rows, [], SINGLES);

        expect(sorted(all)).toEqual(['hotel', 'segment']);
        expect(rtHybridTreeSelectAllMark(rows, all, SINGLES)).toBe('all');

        const withSingle: ReadonlyArray<string> = [...all, 'ty-rooms'];
        expect(rtHybridTreeSelectAll(rows, withSingle, SINGLES)).toEqual([]);
    });

    it('SC-UKV-695 — the cascade of a branch skips the single leaves and marks the branch by its free leaves', (): void => {
        const next: ReadonlyArray<string> = rtHybridTreeChoose(TREE, PACE, [], MULTIPLE);

        expect(sorted(next)).toEqual(['hotel', 'segment']);
        expect(rtHybridTreeMark(PACE, next, true, SINGLES)).toBe('all');
        expect(rtHybridTreeMark(PACE, ['ty-rev'], true, SINGLES)).toBe('some');
        expect(rtHybridTreeChoose(TREE, PACE, [...next, 'ty-rev'], MULTIPLE)).toEqual([]);
    });

    it('SC-UKV-696 — the exclusive click on a single leaf keeps the rest, on a free leaf keeps it alone', (): void => {
        expect(sorted(rtHybridTreeChoose(TREE, ROOMS, ['hotel'], ALONE))).toEqual(['hotel', 'ty-rooms']);
        expect(rtHybridTreeChoose(TREE, SEGMENT, ['hotel', 'ty-rooms'], ALONE)).toEqual(['segment']);
    });

    it('a disabled leaf and the other modes follow rt-tree', (): void => {
        expect(rtHybridTreeChoose(TREE, LOCKED, ['ty-rev'], MULTIPLE)).toEqual(['ty-rev']);
        expect(rtHybridTreeChoose(TREE, ROOMS, ['hotel'], { mode: 'single', cascade: true, alone: false })).toEqual(['ty-rooms']);
    });

    it('a group counts its chosen leaves, a leaf has no count', (): void => {
        expect(rtHybridTreeChosenCount(PACE, ['hotel', 'ty-rooms'])).toBe(2);
        expect(rtHybridTreeChosenCount(GROUPING, [])).toBe(0);
        expect(rtHybridTreeChosenCount(HOTEL, ['hotel'])).toBe(0);
    });

    it('the nodes stay as they were', (): void => {
        const before: string = JSON.stringify(TREE);
        rtHybridTreeChoose(TREE, THIS_YEAR, [], MULTIPLE);
        rtHybridTreeChoose(TREE, PACE, [], MULTIPLE);
        expect(JSON.stringify(TREE)).toBe(before);
    });
});
