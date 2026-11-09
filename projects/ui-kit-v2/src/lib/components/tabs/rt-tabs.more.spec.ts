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

    it('SC-UKV-1183 — half a pixel of a fractional width does not send a tab away', (): void => {
        expect(rtTabsFitRow({ slots: ABCD, selectedId: 'a', moreWidth: 84, available: 399.6 }).more).toEqual([]);
    });
});
