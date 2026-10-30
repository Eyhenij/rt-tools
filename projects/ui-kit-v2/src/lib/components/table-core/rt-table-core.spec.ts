import { EFilterOperatorType, EListSortOrder, IFilterModel, ISortModel } from '@rt-tools/utils';

import { rtFiltersWithOperator, rtFiltersWithValue, rtIsEmptyFilterValue } from './rt-table-filter.core';
import { rtAriaSortOf, rtNextSort, rtSortDirectionOf } from './rt-table-sort.core';

const STATUS: IFilterModel<string> = { propertyName: 'status', operatorType: EFilterOperatorType.EQUALS, value: 'paid' };
const CITY: IFilterModel<string> = { propertyName: 'city', operatorType: EFilterOperatorType.CONTAINS, value: 'Мин' };

describe('ядро фильтра таблиц', () => {
    it('SC-UKV-1104 — пустая строка снимает условие в обоих режимах', () => {
        expect(rtFiltersWithValue([STATUS, CITY], 'status', EFilterOperatorType.EQUALS, '', 'empty-string')).toEqual([CITY]);
        expect(rtFiltersWithValue([STATUS, CITY], 'status', EFilterOperatorType.EQUALS, '', 'falsy')).toEqual([CITY]);
    });

    it('SC-UKV-1104 — в режиме rt-table ноль и false уходят значением', () => {
        expect(rtFiltersWithValue([CITY], 'stock', EFilterOperatorType.EQUALS, 0, 'empty-string')).toEqual([
            CITY,
            { propertyName: 'stock', operatorType: EFilterOperatorType.EQUALS, value: 0 },
        ]);
        expect(rtFiltersWithValue([STATUS], 'status', EFilterOperatorType.EQUALS, false, 'empty-string')).toEqual([
            { ...STATUS, value: false },
        ]);
    });

    it('SC-UKV-1104 — в режиме rt-data-table ноль и false снимают условие, как в первом ките', () => {
        expect(rtFiltersWithValue([STATUS, CITY], 'status', EFilterOperatorType.EQUALS, false, 'falsy')).toEqual([CITY]);
        expect(rtFiltersWithValue([STATUS, CITY], 'status', EFilterOperatorType.EQUALS, 0, 'falsy')).toEqual([CITY]);
        expect(rtIsEmptyFilterValue(0, 'falsy')).toBe(true);
        expect(rtIsEmptyFilterValue(0, 'empty-string')).toBe(false);
    });

    it('SC-UKV-1104 — пустое значение на колонке без условия отдаёт тот же набор', () => {
        const filters: IFilterModel<string>[] = [CITY];

        expect(rtFiltersWithValue(filters, 'status', EFilterOperatorType.EQUALS, '', 'empty-string')).toBe(filters);
        expect(rtFiltersWithValue(filters, 'status', EFilterOperatorType.EQUALS, false, 'falsy')).toBe(filters);
    });

    it('SC-UKV-1104 — новое значение меняет условие, не трогая соседние', () => {
        expect(rtFiltersWithValue([STATUS, CITY], 'status', EFilterOperatorType.EQUALS, 'new', 'falsy')).toEqual([
            { ...STATUS, value: 'new' },
            CITY,
        ]);
    });

    it('SC-UKV-1105 — смена сравнения на колонке со значением добавляет её условие', () => {
        expect(rtFiltersWithOperator([CITY], 'status', EFilterOperatorType.NOT_EQUALS, 'paid', 'falsy')).toEqual([
            CITY,
            { propertyName: 'status', operatorType: EFilterOperatorType.NOT_EQUALS, value: 'paid' },
        ]);
        expect(rtFiltersWithOperator([], 'stock', EFilterOperatorType.GREATER_THAN, 0, 'empty-string')).toEqual([
            { propertyName: 'stock', operatorType: EFilterOperatorType.GREATER_THAN, value: 0 },
        ]);
    });

    it('SC-UKV-1105 — колонка без значения по режиму своей таблицы ничего не просит', () => {
        const filters: IFilterModel<string>[] = [CITY];

        expect(rtFiltersWithOperator(filters, 'status', EFilterOperatorType.NOT_EQUALS, '', 'empty-string')).toBe(filters);
        expect(rtFiltersWithOperator(filters, 'stock', EFilterOperatorType.GREATER_THAN, 0, 'falsy')).toBe(filters);
    });

    it('SC-UKV-1105 — смена сравнения у колонки с условием меняет только его', () => {
        expect(rtFiltersWithOperator([STATUS, CITY], 'status', EFilterOperatorType.NOT_EQUALS, '', 'empty-string')).toEqual([
            { ...STATUS, operatorType: EFilterOperatorType.NOT_EQUALS },
            CITY,
        ]);
    });

    it('SC-UKV-1106 — то же значение и то же сравнение отдают тот же набор', () => {
        const filters: IFilterModel<string>[] = [STATUS, CITY];

        expect(rtFiltersWithValue(filters, 'status', EFilterOperatorType.EQUALS, 'paid', 'empty-string')).toBe(filters);
        expect(rtFiltersWithValue(filters, 'status', EFilterOperatorType.EQUALS, 'paid', 'falsy')).toBe(filters);
        expect(rtFiltersWithOperator(filters, 'status', EFilterOperatorType.EQUALS, 'paid', 'falsy')).toBe(filters);
    });
});

describe('ядро сортировки таблиц', () => {
    const asc: ISortModel<string> = { propertyName: 'name', sortDirection: EListSortOrder.ASC };
    const desc: ISortModel<string> = { propertyName: 'name', sortDirection: EListSortOrder.DESC };

    it('SC-UKV-1107 — круг rt-table: по возрастанию, по убыванию, без порядка', () => {
        expect(rtNextSort(null, 'name', 'clears')).toEqual(asc);
        expect(rtNextSort(asc, 'name', 'clears')).toEqual(desc);
        expect(rtNextSort(desc, 'name', 'clears')).toBeNull();
        expect(rtNextSort(desc, 'city', 'clears')).toEqual({ propertyName: 'city', sortDirection: EListSortOrder.ASC });
    });

    it('SC-UKV-1107 — круг rt-data-table: после убывания снова возрастание', () => {
        expect(rtNextSort(null, 'name', 'repeats')).toEqual(asc);
        expect(rtNextSort(asc, 'name', 'repeats')).toEqual(desc);
        expect(rtNextSort(desc, 'name', 'repeats')).toEqual(asc);
    });

    it('SC-UKV-1113 — другая колонка после возрастания встаёт по возрастанию в обоих кругах', () => {
        const city: ISortModel<string> = { propertyName: 'city', sortDirection: EListSortOrder.ASC };

        expect(rtNextSort(asc, 'city', 'repeats')).toEqual(city);
        expect(rtNextSort(desc, 'city', 'repeats')).toEqual(city);
        expect(rtNextSort(asc, 'city', 'clears')).toEqual(city);
    });

    it('SC-UKV-1107 — aria-sort одинаков для обеих таблиц', () => {
        expect(rtAriaSortOf(asc, 'name')).toBe('ascending');
        expect(rtAriaSortOf(desc, 'name')).toBe('descending');
        expect(rtAriaSortOf(asc, 'city')).toBe('none');
        expect(rtAriaSortOf(null, 'name')).toBe('none');
        expect(rtSortDirectionOf(desc, 'name')).toBe(EListSortOrder.DESC);
        expect(rtSortDirectionOf(desc, 'city')).toBeNull();
    });
});
