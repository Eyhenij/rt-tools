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
            state: '',
            version: '',
        });
    });

    it('названные страница, размер, порядок и все три отбора читаются как есть', () => {
        const asked: Record<string, string> = {
            page: '3',
            size: '50',
            sort: 'updatedAt',
            dir: 'asc',
            tree: 'a1b2',
            state: 'in_work',
            version: '0.10.0',
        };

        expect(listQueryOf(asked, SORTABLE)).toEqual<IAdminListQuery>({
            page: 3,
            size: 50,
            sort: 'updatedAt',
            dir: 'asc',
            tree: 'a1b2',
            state: 'in_work',
            version: '0.10.0',
        });
    });

    it('SC-MB-247 — версия читается как есть: набора версий заранее не существует', () => {
        expect(listQueryOf({ version: '9.9.9' }, SORTABLE).version).toBe('9.9.9');
        expect(listQueryOf({ version: 'hotfix-3' }, SORTABLE).version).toBe('hotfix-3');
    });

    it('SC-MB-243 — «без версии» читается тем же словом, каким его читает приёмник', () => {
        expect(listQueryOf({ version: 'none' }, SORTABLE).version).toBe('none');
    });

    it('SC-MB-242 — повторённый параметр версии приходит массивом и читается как несказанный', () => {
        expect(listQueryOf({ version: ['0.9.0', '0.10.0'] }, SORTABLE).version).toBe('');
    });

    it('SC-MB-233 — состояние вне набора читается как несказанное: список не сужен', () => {
        expect(listQueryOf({ state: 'починен-наверное' }, SORTABLE).state).toBe('');
        expect(listQueryOf({ state: ['new', 'fixed'] }, SORTABLE).state).toBe('');
    });

    it('SC-MB-233 — состояние из набора читается тем словом, каким стоит в адресе', () => {
        for (const state of ['new', 'in_work', 'fixed', 'released']) {
            expect(listQueryOf({ state }, SORTABLE).state).toBe(state);
        }
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

        expect(listQueryParams(query, SORTABLE)).toEqual({
            page: null,
            size: null,
            sort: null,
            dir: null,
            tree: null,
            state: null,
            version: null,
        });
    });

    it('в адрес уходит только то, что отличается от умолчания', () => {
        const query: IAdminListQuery = listQueryOf({ page: '2', tree: 'a1b2' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toEqual({
            page: '2',
            size: null,
            sort: null,
            dir: null,
            tree: 'a1b2',
            state: null,
            version: null,
        });
    });

    it('SC-MB-224 — снятый отбор по состоянию уходит из адреса пустотой', () => {
        const query: IAdminListQuery = listQueryOf({ state: 'fixed' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE).state).toBe('fixed');
        expect(listQueryParams({ ...query, state: '' }, SORTABLE).state).toBeNull();
    });

    it('SC-MB-225 — оба отбора стоят в адресе рядом, а не вместо друг друга', () => {
        const query: IAdminListQuery = listQueryOf({ tree: 'a1b2', state: 'released' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toMatchObject({ tree: 'a1b2', state: 'released' });
    });

    it('SC-MB-244 — три отбора стоят в адресе рядом, а не вместо друг друга', () => {
        const query: IAdminListQuery = listQueryOf({ tree: 'a1b2', state: 'released', version: '0.10.0' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE)).toMatchObject({ tree: 'a1b2', state: 'released', version: '0.10.0' });
    });

    it('SC-MB-242 — снятый отбор по версии уходит из адреса пустотой', () => {
        const query: IAdminListQuery = listQueryOf({ version: '0.9.0' }, SORTABLE);

        expect(listQueryParams(query, SORTABLE).version).toBe('0.9.0');
        expect(listQueryParams({ ...query, version: '' }, SORTABLE).version).toBeNull();
    });

    it('разобранное и собранное сходятся: адрес переживает круг', () => {
        const asked: Record<string, string> = {
            page: '3',
            size: '50',
            sort: 'updatedAt',
            dir: 'asc',
            tree: 'a1b2',
            state: 'new',
            version: '0.10.0',
        };
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
        expect(sameListQuery(listQueryOf({}, SORTABLE), listQueryOf({ state: 'fixed' }, SORTABLE))).toBe(false);
        expect(sameListQuery(listQueryOf({}, SORTABLE), listQueryOf({ version: '0.9.0' }, SORTABLE))).toBe(false);
    });
});
