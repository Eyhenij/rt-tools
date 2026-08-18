import { EListSortOrder } from '@rt-tools/utils';

import { IAdminListQuery, listQueryOf } from './list-query';
import { pageModelOf, sortAskedOf, sortModelOf } from './list-view';

const SORTABLE: readonly string[] = ['arrivedAt', 'updatedAt'];

describe('pageModelOf', () => {
    it('страница собирается из выборки и общего числа записей', () => {
        const query: IAdminListQuery = listQueryOf({ page: '2', size: '50' }, SORTABLE);

        expect(pageModelOf(query, 137)).toEqual({ pageNumber: 2, pageSize: 50, totalCount: 137 });
    });
});

describe('sortModelOf', () => {
    it('порядок выборки читается таблицей до первого нажатия', () => {
        expect(sortModelOf(listQueryOf({}, SORTABLE))).toEqual({
            propertyName: 'arrivedAt',
            sortDirection: EListSortOrder.DESC,
        });
    });

    it('порядок по возрастанию доезжает до таблицы своим направлением', () => {
        expect(sortModelOf(listQueryOf({ sort: 'updatedAt', dir: 'asc' }, SORTABLE))).toEqual({
            propertyName: 'updatedAt',
            sortDirection: EListSortOrder.ASC,
        });
    });
});

describe('sortAskedOf', () => {
    it('названный заголовком порядок уходит в выборку', () => {
        expect(sortAskedOf({ propertyName: 'updatedAt', sortDirection: EListSortOrder.ASC }, SORTABLE)).toEqual({
            sort: 'updatedAt',
            dir: 'asc',
        });
    });

    it('снятый порядок заменяется умолчанием раздела, а не пустотой', () => {
        expect(sortAskedOf(null, SORTABLE)).toEqual({ sort: 'arrivedAt', dir: 'desc' });
    });

    it('поле не из набора сортируемых до приёмника не доезжает', () => {
        expect(sortAskedOf({ propertyName: 'file', sortDirection: EListSortOrder.ASC }, SORTABLE)).toEqual({
            sort: 'arrivedAt',
            dir: 'desc',
        });
    });

    it('раздел без сортируемых полей отдаёт пустое поле порядка', () => {
        expect(sortAskedOf(null, []).sort).toBe('');
    });
});
