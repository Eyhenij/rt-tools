import { join } from 'node:path';

import * as sass from 'sass';

import { actionsWidthOf, pageBarFit, IRtPageBarFit, RT_PAGE_BAR_SIZES } from './rt-page-bar.logic';

/** Тело правила собранных стилей шапки по началу селектора. */
function barRule(selector: string): string {
    const css: string = sass.compile(join(__dirname, 'rt-page-bar.component.scss')).css.replace(/\s+/g, ' ');
    const at: number = css.indexOf(selector);
    return at < 0 ? '' : css.slice(at + selector.length, css.indexOf('}', at));
}

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

    it('SC-UKV-1220 — a long title without search and filters keeps one row', (): void => {
        expect(pageBarFit({ width: 1390, titleWidth: 1400, actionsWidth: ACTIONS, filterCount: 0, hasSearch: false })).toEqual({
            mode: 'one',
            rowFilters: 0,
        });
        expect(pageBarFit({ width: 1390, titleWidth: 1400, actionsWidth: ACTIONS, filterCount: 0, hasSearch: true }).mode).toBe('two');
    });

    it('SC-UKV-1195 — at 1280 a short title, three filters and three actions stay on one row', (): void => {
        expect(fit(1230, 113, 3)).toEqual({ mode: 'one', rowFilters: 3 });
    });

    it('SC-UKV-1195 — the widths the fit counts by are the widths the styles draw', (): void => {
        expect(barRule('.rt-page-bar__filter {')).toContain(`width: ${RT_PAGE_BAR_SIZES.filterTwoRows}px`);
        expect(barRule('.rt-page-bar__filter--wide {')).toContain(`width: ${RT_PAGE_BAR_SIZES.filterOneRow}px`);
        expect(barRule('.rt-page-bar__more {')).toContain(`width: ${RT_PAGE_BAR_SIZES.more}px`);
    });

    it('actions take 32 each with a gap of 8, and no actions take no room', (): void => {
        expect(actionsWidthOf(3)).toBe(112);
        expect(actionsWidthOf(0)).toBe(0);
    });
});
