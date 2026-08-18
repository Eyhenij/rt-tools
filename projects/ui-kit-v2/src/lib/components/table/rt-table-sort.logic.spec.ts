// Порядок сортировки приезжает из Angular-либы `@rt-tools/utils`, и её модуль на
// загрузке требует JIT-компилятор. Без этой строки спека падает на импорте, а не на
// утверждении.
import '@angular/compiler';

import { EListSortOrder, ISortModel } from '@rt-tools/utils';

import { ariaSortOf, isColumnSortable, nextSort, sortDirectionOf } from './rt-table-sort.logic';
import { IRtTable } from './rt-table.model';

function sort(overrides: Partial<ISortModel<string>> = {}): ISortModel<string> {
    return { propertyName: 'checkIn', sortDirection: EListSortOrder.ASC, ...overrides };
}

function column(overrides: Partial<IRtTable.ColumnConfig> = {}): IRtTable.ColumnConfig {
    return { key: 'checkIn', label: 'Заезд', ...overrides };
}

describe('nextSort', () => {
    it('несортированный заголовок включает порядок по возрастанию', () => {
        expect(nextSort(null, 'checkIn')).toEqual(sort());
    });

    it('заголовок по возрастанию переключается на убывание', () => {
        expect(nextSort(sort(), 'checkIn')).toEqual(sort({ sortDirection: EListSortOrder.DESC }));
    });

    it('заголовок по убыванию снимает сортировку', () => {
        expect(nextSort(sort({ sortDirection: EListSortOrder.DESC }), 'checkIn')).toBe(null);
    });

    it('соседний заголовок забирает сортировку себе и начинает с возрастания', () => {
        expect(nextSort(sort({ sortDirection: EListSortOrder.DESC }), 'guest')).toEqual(sort({ propertyName: 'guest' }));
    });
});

describe('sortDirectionOf', () => {
    it('направление показывает та колонка, по которой идёт сортировка', () => {
        expect(sortDirectionOf(sort(), 'checkIn')).toBe(EListSortOrder.ASC);
    });

    it('у прочих колонок направления нет', () => {
        expect(sortDirectionOf(sort(), 'guest')).toBe(null);
    });
});

describe('ariaSortOf', () => {
    it('порядок по возрастанию читается с колонки как ascending', () => {
        expect(ariaSortOf(sort(), 'checkIn')).toBe('ascending');
    });

    it('порядок по убыванию читается с колонки как descending', () => {
        expect(ariaSortOf(sort({ sortDirection: EListSortOrder.DESC }), 'checkIn')).toBe('descending');
    });

    it('колонка без сортировки читается как none', () => {
        expect(ariaSortOf(null, 'checkIn')).toBe('none');
    });
});

describe('isColumnSortable', () => {
    it('колонка сортируется, когда помечена в конфиге', () => {
        expect(isColumnSortable([column({ sortable: true })], 'checkIn')).toBe(true);
    });

    it('колонка без пометки не сортируется', () => {
        expect(isColumnSortable([column()], 'checkIn')).toBe(false);
    });

    it('колонка, которой в конфиге нет, сортируется по объявлению заголовка', () => {
        expect(isColumnSortable([column({ key: 'guest' })], 'checkIn')).toBe(true);
    });
});
