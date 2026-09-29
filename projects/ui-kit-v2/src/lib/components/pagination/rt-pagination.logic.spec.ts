import { IPageModel } from '@rt-tools/utils';

import { lastPageOf, pageItemsOf, pageSlotsOf, rangeFromOf, rangeToOf } from './rt-pagination.logic';

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

/** Номера полосы по семи местам на странице `pageNumber` из `lastPage`. */
function slotsAt(pageNumber: number, lastPage: number): ReadonlyArray<number | 'gap'> {
    return pageSlotsOf(page({ pageNumber, totalCount: lastPage * 20 }));
}

describe('pageSlotsOf', () => {
    it('SC-UKV-366 — одна страница — один номер', () => {
        expect(pageSlotsOf(page({ totalCount: 15 }))).toEqual([1]);
    });

    it('до шести страниц видны все номера', () => {
        expect(slotsAt(4, 6)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('SC-UKV-366 — у края по три номера с каждой стороны', () => {
        expect(slotsAt(1, 13)).toEqual([1, 2, 3, 'gap', 11, 12, 13]);
        expect(slotsAt(13, 13)).toEqual([1, 2, 3, 'gap', 11, 12, 13]);
    });

    it('в середине — первая, соседи открытой и последняя', () => {
        expect(slotsAt(7, 13)).toEqual([1, 'gap', 6, 7, 8, 'gap', 13]);
    });

    it('разрыв съезжает за открытую страницу у края', () => {
        expect(slotsAt(3, 13)).toEqual([1, 2, 3, 4, 'gap', 12, 13]);
        expect(slotsAt(4, 13)).toEqual([1, 2, 3, 4, 5, 'gap', 13]);
        expect(slotsAt(10, 13)).toEqual([1, 'gap', 9, 10, 11, 12, 13]);
        expect(slotsAt(11, 13)).toEqual([1, 2, 'gap', 10, 11, 12, 13]);
    });
});
