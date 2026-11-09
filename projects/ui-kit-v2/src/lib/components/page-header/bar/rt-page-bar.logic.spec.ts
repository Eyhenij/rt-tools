import { actionsWidthOf, pageBarFit, IRtPageBarFit } from './rt-page-bar.logic';

const ACTIONS: number = actionsWidthOf(3);

function fit(width: number, titleWidth: number, filterCount: number): IRtPageBarFit.Result {
    return pageBarFit({ width, titleWidth, actionsWidth: ACTIONS, filterCount, hasSearch: true });
}

describe('pageBarFit', (): void => {
    it('SC-UKV-1195 — a short title and three filters stay on one row at 1390', (): void => {
        expect(fit(1390, 113, 3)).toEqual({ mode: 'one', rowFilters: 3 });
    });

    it('SC-UKV-1195 — a long title moves search and filters to the second row', (): void => {
        expect(fit(1390, 410, 5)).toEqual({ mode: 'two', rowFilters: 5 });
    });

    it('SC-UKV-1195 — filters that do not fit the second row go under the button, and no third row exists', (): void => {
        expect(fit(1390, 410, 8)).toEqual({ mode: 'two', rowFilters: 4 });
    });

    it('SC-UKV-1194 — the bar follows its own width: a page narrowed by the assistant takes two rows', (): void => {
        expect(fit(970, 113, 3)).toEqual({ mode: 'two', rowFilters: 3 });
    });

    it('SC-UKV-1194 — at 768 and narrower filters and actions go into buttons', (): void => {
        expect(fit(769, 113, 3).mode).toBe('two');
        expect(fit(768, 113, 3)).toEqual({ mode: 'narrow', rowFilters: 0 });
    });

    it('SC-UKV-1195 — a bar without a measured width stays on one row', (): void => {
        expect(fit(0, 0, 3)).toEqual({ mode: 'one', rowFilters: 3 });
    });

    it('actions take 40 each with a gap of 8, and no actions take no room', (): void => {
        expect(actionsWidthOf(3)).toBe(136);
        expect(actionsWidthOf(0)).toBe(0);
    });
});
