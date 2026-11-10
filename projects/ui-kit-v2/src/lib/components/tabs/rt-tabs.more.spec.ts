import { IRtTabs } from './rt-tabs.model';
import { rtTabsFitRow } from './rt-tabs.more';

function slot(id: string, width: number = 100, pinned: boolean = false): IRtTabs.MoreSlot {
    return { id, width, pinned };
}

const ABCD: ReadonlyArray<IRtTabs.MoreSlot> = [slot('a'), slot('b'), slot('c'), slot('d')];

describe('rtTabsFitRow', (): void => {
    it('SC-UKV-1183 — tabs that do not fit leave for the menu in their order', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 300 })).toEqual({
            row: ['a', 'b'],
            more: ['c', 'd'],
        });
    });

    it('SC-UKV-1184 — everything fits and the menu stays empty', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 400 })).toEqual({
            row: ['a', 'b', 'c', 'd'],
            more: [],
        });
    });

    it('SC-UKV-1185 — the selected tab from the menu stands last and pushes its neighbour out', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'd', moreWidth: 84, available: 300 })).toEqual({
            row: ['a', 'd'],
            more: ['b', 'c'],
        });
    });

    it('SC-UKV-1185 — the selected tab wider than the room stands alone', (): void => {
        const slots: ReadonlyArray<IRtTabs.MoreSlot> = [slot('a'), slot('b', 500)];

        expect(rtTabsFitRow({ slots, selectedId: 'b', moreWidth: 84, available: 300 })).toEqual({ row: ['b'], more: ['a'] });
    });

    it('SC-UKV-1186 — a pinned tab stands first and never leaves the row', (): void => {
        const slots: ReadonlyArray<IRtTabs.MoreSlot> = [slot('a'), slot('b'), slot('p', 100, true)];

        expect(rtTabsFitRow({ slots, selectedId: 'a', moreWidth: 84, available: 120 })).toEqual({
            row: ['p', 'a'],
            more: ['b'],
        });
    });

    it('SC-UKV-1208 — the row holds no more tabs than its limit even when there is room', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 1000, limit: 2 })).toEqual({
            row: ['a', 'b'],
            more: ['c', 'd'],
        });
    });

    it('SC-UKV-1208 — a tab picked in the menu takes the last place and the last one goes to the menu', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'd', moreWidth: 84, available: 1000, limit: 3 })).toEqual({
            row: ['a', 'b', 'd'],
            more: ['c'],
        });
    });

    it('SC-UKV-1208 — pinned tabs count toward the limit', (): void => {
        const slots: ReadonlyArray<IRtTabs.MoreSlot> = [slot('p', 100, true), ...ABCD];

        expect(rtTabsFitRow({ slots, selectedId: 'a', moreWidth: 84, available: 1000, limit: 3 })).toEqual({
            row: ['p', 'a', 'b'],
            more: ['c', 'd'],
        });
    });

    it('SC-UKV-1208 — a count within the limit leaves the menu empty', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 1000, limit: 4 }).more).toEqual([]);
    });

    it('SC-UKV-1183 — half a pixel of a fractional width does not send a tab away', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 399.6 }).more).toEqual([]);
    });
});
