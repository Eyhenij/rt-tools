import { describe, expect, it } from 'vitest';

import { IPageAsked, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, pageAsked, pageFault, pageSkip } from './page';

/** Поля порядка одного из списков: первое — умолчание домена. */
const SORTABLE: readonly string[] = ['arrivedAt', 'file', 'tree'];

describe('pageAsked', () => {
    it('SC-MB-62 — страница без размера берёт умолчание', () => {
        expect(pageAsked({}, SORTABLE).size).toBe(PAGE_SIZE_DEFAULT);
    });

    it('SC-MB-62 — размер выше предела прижимается к пределу, а не отбивается', () => {
        expect(pageAsked({ size: '100000' }, SORTABLE).size).toBe(PAGE_SIZE_MAX);
    });

    it('SC-MB-62 — названный размер в границах берётся как названо', () => {
        expect(pageAsked({ size: '5' }, SORTABLE).size).toBe(5);
    });

    it('SC-MB-62 — выборка без доводов читается первой страницей, свежие сверху', () => {
        const asked: IPageAsked = pageAsked({}, SORTABLE);

        expect(asked).toEqual({ page: 1, size: PAGE_SIZE_DEFAULT, sort: 'arrivedAt', dir: 'desc', tree: null });
    });

    it('SC-MB-63 — страница за пределом списка разбирается, а не отбивается', () => {
        expect(pageSkip(pageAsked({ page: '50', size: '10' }, SORTABLE))).toBe(490);
    });

    it('SC-MB-68 — отбор по дереву читается признаком, а пустой отбор — его отсутствием', () => {
        expect(pageAsked({ tree: 'own-tree' }, SORTABLE).tree).toBe('own-tree');
        expect(pageAsked({ tree: '' }, SORTABLE).tree).toBeNull();
    });

    it('SC-MB-66 — названное поле порядка и направление берутся из запроса', () => {
        expect(pageAsked({ sort: 'file', dir: 'asc' }, SORTABLE)).toMatchObject({ sort: 'file', dir: 'asc' });
    });
});

describe('pageFault', () => {
    it('SC-MB-64 — неразобранный номер страницы отбивается, и отказ называет параметр с границами', () => {
        expect(pageFault({ page: 'вторая' }, SORTABLE)).toBe('параметр page ожидается целым числом от 1');
    });

    it('SC-MB-64 — нулевой и отрицательный номер страницы номером не считаются', () => {
        expect(pageFault({ page: '0' }, SORTABLE)).toBe('параметр page ожидается целым числом от 1');
        expect(pageFault({ page: '-3' }, SORTABLE)).toBe('параметр page ожидается целым числом от 1');
    });

    it('SC-MB-64 — неразобранный размер страницы называет обе свои границы', () => {
        expect(pageFault({ size: 'много' }, SORTABLE)).toBe(`параметр size ожидается целым числом от 1 до ${PAGE_SIZE_MAX}`);
    });

    it('SC-MB-64 — дважды названный номер страницы номером не считается', () => {
        expect(pageFault({ page: ['1', '2'] }, SORTABLE)).toBe('параметр page ожидается целым числом от 1');
    });

    it('SC-MB-64 — незнакомое поле порядка отбивается перечислением знакомых', () => {
        expect(pageFault({ sort: 'вес' }, SORTABLE)).toBe('параметр sort ожидается одним из: arrivedAt, file, tree');
    });

    it('SC-MB-64 — незнакомое направление порядка отбивается перечислением знакомых', () => {
        expect(pageFault({ dir: 'вниз' }, SORTABLE)).toBe('параметр dir ожидается одним из: asc, desc');
    });

    it('SC-MB-62 — размер выше предела отказом не считается', () => {
        expect(pageFault({ size: '100000' }, SORTABLE)).toBeNull();
    });

    it('SC-MB-63 — страница за пределом списка отказом не считается', () => {
        expect(pageFault({ page: '50' }, SORTABLE)).toBeNull();
    });

    it('SC-MB-62 — выборка, названная целиком и в границах, проходит', () => {
        expect(pageFault({ page: '2', size: '10', sort: 'file', dir: 'asc', tree: 'own-tree' }, SORTABLE)).toBeNull();
    });
});
