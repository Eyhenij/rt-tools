import { PAGE_SIZE_DEFAULT } from '@rt/message-bus-common';

import { IAdminListQuery, LIST_PAGE_SIZES, listQueryOf, listQueryParams, sameListQuery } from './list-query';

/** Поля порядка, какими их объявляет раздел разборов: первое — умолчание. */
const SORTABLE: readonly string[] = ['arrivedAt', 'updatedAt'];

describe('listQueryOf', () => {
    it('пустой адрес читается первой страницей умолчаний', () => {
        expect(listQueryOf({}, SORTABLE)).toEqual<IAdminListQuery>({
            page: 1,
            size: PAGE_SIZE_DEFAULT,
            sort: 'arrivedAt',
            dir: 'desc',
            tree: '',
        });
    });

    it('названные страница, размер, порядок и отбор читаются как есть', () => {
        expect(listQueryOf({ page: '3', size: '50', sort: 'updatedAt', dir: 'asc', tree: 'a1b2' }, SORTABLE)).toEqual<IAdminListQuery>({
            page: 3,
            size: 50,
            sort: 'updatedAt',
            dir: 'asc',
            tree: 'a1b2',
        });
    });

    it('номер страницы не числом заменяется первой страницей, а не роняет разбор', () => {
        expect(listQueryOf({ page: 'вторая' }, SORTABLE).page).toBe(1);
    });

    it('нулевая и отрицательная страница читаются первой', () => {
        expect(listQueryOf({ page: '0' }, SORTABLE).page).toBe(1);
        expect(listQueryOf({ page: '-2' }, SORTABLE).page).toBe(1);
    });

    it('размер страницы читается только из предложенных экраном', () => {
        for (const size of LIST_PAGE_SIZES) {
            expect(listQueryOf({ size: String(size) }, SORTABLE).size).toBe(size);
        }
    });

    it('размер, которого экран не предлагает, читается умолчанием', () => {
        // Переключатель страниц прячет себя при пяти записях на страницу, и человек остался бы
        // на второй странице без него.
        expect(listQueryOf({ size: '5' }, SORTABLE).size).toBe(PAGE_SIZE_DEFAULT);
        expect(listQueryOf({ size: '1000' }, SORTABLE).size).toBe(PAGE_SIZE_DEFAULT);
        expect(listQueryOf({ size: 'много' }, SORTABLE).size).toBe(PAGE_SIZE_DEFAULT);
    });

    it('поле порядка не из набора заменяется умолчанием раздела', () => {
        expect(listQueryOf({ sort: 'file' }, SORTABLE).sort).toBe('arrivedAt');
    });

    it('чужое направление порядка читается умолчанием', () => {
        expect(listQueryOf({ dir: 'вверх' }, SORTABLE).dir).toBe('desc');
    });

    it('повторённый параметр приходит массивом и читается как несказанное', () => {
        expect(listQueryOf({ tree: ['a1b2', 'c3d4'] }, SORTABLE).tree).toBe('');
    });

    it('раздел без сортируемых полей отдаёт пустое поле порядка', () => {
        expect(listQueryOf({ sort: 'arrivedAt' }, []).sort).toBe('');
    });
});

describe('listQueryParams', () => {
    it('выборка умолчаний снимает все параметры адреса', () => {
        const query: IAdminListQuery = listQueryOf({}, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toEqual({ page: null, size: null, sort: null, dir: null, tree: null });
    });

    it('в адрес уходит только то, что отличается от умолчания', () => {
        const query: IAdminListQuery = listQueryOf({ page: '2', tree: 'a1b2' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toEqual({ page: '2', size: null, sort: null, dir: null, tree: 'a1b2' });
    });

    it('разобранное и собранное сходятся: адрес переживает круг', () => {
        const asked: Record<string, string> = { page: '3', size: '50', sort: 'updatedAt', dir: 'asc', tree: 'a1b2' };
        const query: IAdminListQuery = listQueryOf(asked, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toEqual(asked);
    });
});

describe('sameListQuery', () => {
    it('две выборки одних значений — та же выборка', () => {
        expect(sameListQuery(listQueryOf({ page: '2' }, SORTABLE), listQueryOf({ page: '2' }, SORTABLE))).toBe(true);
    });

    it('разошедшийся отбор делает выборку другой', () => {
        expect(sameListQuery(listQueryOf({}, SORTABLE), listQueryOf({ tree: 'a1b2' }, SORTABLE))).toBe(false);
    });
});
