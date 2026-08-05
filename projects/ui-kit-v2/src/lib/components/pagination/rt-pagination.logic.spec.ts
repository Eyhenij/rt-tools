import { IPageModel } from '@rt-tools/utils';

import { lastPageOf, pageItemsOf, rangeFromOf, rangeToOf } from './rt-pagination.logic';

function page(overrides: Partial<IPageModel> = {}): IPageModel {
    return { pageNumber: 1, pageSize: 20, totalCount: 100, ...overrides };
}

describe('lastPageOf', () => {
    it('последняя страница считается по размеру страницы и общему числу записей', () => {
        expect(lastPageOf(page({ totalCount: 95 }))).toBe(5);
    });

    it('пустой список — одна страница', () => {
        expect(lastPageOf(page({ totalCount: 0 }))).toBe(1);
    });

    it('нулевой размер страницы не делит на ноль', () => {
        expect(lastPageOf(page({ pageSize: 0 }))).toBe(1);
    });
});

describe('rangeFromOf', () => {
    it('вторая страница начинается со следующей за первой записи', () => {
        expect(rangeFromOf(page({ pageNumber: 2 }))).toBe(21);
    });
});

describe('rangeToOf', () => {
    it('последняя страница заканчивается на последней записи, а не на границе размера', () => {
        expect(rangeToOf(page({ pageNumber: 5, totalCount: 95 }))).toBe(95);
    });

    it('полная страница заканчивается на границе размера', () => {
        expect(rangeToOf(page({ pageNumber: 2 }))).toBe(40);
    });
});

describe('pageItemsOf', () => {
    it('единственная страница полосы номеров не даёт', () => {
        expect(pageItemsOf(page({ totalCount: 10 }), 1)).toEqual([]);
    });

    it('полоса несёт первую, последнюю и соседей открытой страницы', () => {
        expect(pageItemsOf(page({ pageNumber: 5, totalCount: 200 }), 1)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    });

    it('соседние номера идут без разрыва', () => {
        expect(pageItemsOf(page({ pageNumber: 2, totalCount: 80 }), 1)).toEqual([1, 2, 3, 4]);
    });
});
