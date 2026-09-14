import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EReadFault, IAdminListQuery, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { IPage } from '@rt/message-bus-common';

import { AdminListStoreBase } from './admin-list-store.base';

/** Строка списка в этой спеке: основе всё равно, что в ней, — она знает только страницу. */
interface IRow {
    id: string;
}

const PATH: string = '/api/postmortems';
const SORTABLE: readonly string[] = ['arrivedAt', 'updatedAt'];

/** Наследник основы: раздел добавляет к ней ровно адрес операции. */
@Injectable()
class TestListStore extends AdminListStoreBase<IRow> {
    protected readonly path: string = PATH;

    constructor() {
        super();
    }

    /** Разделу этой спеки переводить нечего: строка ответа и есть строка экрана. */
    protected rowOf(raw: IRow): IRow {
        return raw;
    }
}

function pageOf(rows: readonly IRow[], total: number): IPage<IRow> {
    return { rows, total, page: 1, size: 20 };
}

/** Запрос к операции раздела: адрес сверяется без параметров — их проверяют отдельные спеки. */
function onPath(candidate: { url: string }): boolean {
    return candidate.url === PATH;
}

describe('AdminListStoreBase', () => {
    let store: TestListStore;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), TestListStore],
        });

        store = TestBed.inject(TestListStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('чтение уходит на адрес раздела с выборкой в параметрах', () => {
        store.read(listQueryOf({ page: '2', size: '50', sort: 'updatedAt', dir: 'asc' }, SORTABLE));

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === PATH && candidate.params.get('page') === '2');

        expect(request.request.params.get('size')).toBe('50');
        expect(request.request.params.get('sort')).toBe('updatedAt');
        expect(request.request.params.get('dir')).toBe('asc');
        expect(request.request.withCredentials).toBe(true);
        request.flush(pageOf([], 0));
    });

    it('пустой отбор в запрос не уходит вовсе: приёмник читает его как «все деревья»', () => {
        store.read(listQueryOf({}, SORTABLE));

        const request: TestRequest = http.expectOne(onPath);

        expect(request.request.params.has('tree')).toBe(false);
        expect(request.request.params.has('from')).toBe(false);
        expect(request.request.params.has('to')).toBe(false);
        request.flush(pageOf([], 0));
    });

    it('SC-MB-349 — названный период уходит в запрос двумя днями', () => {
        store.read(listQueryOf({ from: '2026-08-01', to: '2026-08-31' }, SORTABLE));

        const request: TestRequest = http.expectOne(onPath);

        expect(request.request.params.get('from')).toBe('2026-08-01');
        expect(request.request.params.get('to')).toBe('2026-08-31');
        request.flush(pageOf([], 0));
    });

    it('прочитанная страница ложится строками и общим числом', () => {
        store.read(listQueryOf({}, SORTABLE));
        http.expectOne(onPath).flush(pageOf([{ id: 'one' }, { id: 'two' }], 137));

        expect(store.rows()).toEqual([{ id: 'one' }, { id: 'two' }]);
        expect(store.total()).toBe(137);
        expect(store.pending()).toBe(false);
        expect(store.fault()).toBeNull();
    });

    it('отказ приёмника снимает строки и приносит род отказа с номером обращения', () => {
        store.read(listQueryOf({}, SORTABLE));
        http.expectOne(onPath).flush(pageOf([{ id: 'one' }], 1));
        store.read(listQueryOf({ page: '2' }, SORTABLE));
        http.expectOne((candidate): boolean => candidate.params.get('page') === '2').flush(
            { message: 'прочитать не удалось, обращение ab12cd' },
            { status: 503, statusText: 'Service Unavailable' }
        );

        expect(store.rows()).toEqual([]);
        expect(store.total()).toBe(0);
        expect(store.fault()).toEqual({ kind: EReadFault.Service, incident: 'ab12cd' });
    });

    it('вышедший вход приходит своим родом, а не отказом службы', () => {
        store.read(listQueryOf({}, SORTABLE));
        http.expectOne(onPath).flush({}, { status: 401, statusText: 'Unauthorized' });

        expect(store.fault()?.kind).toBe(EReadFault.Session);
    });

    it('ответ, догнавший свой список позже, до состояния не доходит', () => {
        store.read(listQueryOf({ tree: 'a1b2' }, SORTABLE));
        store.read(listQueryOf({ tree: 'c3d4' }, SORTABLE));

        const requests: TestRequest[] = http.match(onPath);

        expect(requests[0].cancelled).toBe(true);
        requests[1].flush(pageOf([{ id: 'second' }], 1));

        expect(store.rows()).toEqual([{ id: 'second' }]);
        expect(store.query()?.tree).toBe('c3d4');
    });

    it('повтор читает ту же выборку, которой читали в прошлый раз', () => {
        const asked: IAdminListQuery = listQueryOf({ page: '2', tree: 'a1b2' }, SORTABLE);

        store.read(asked);
        http.expectOne((candidate): boolean => candidate.params.get('page') === '2').flush({}, { status: 503, statusText: 'oops' });
        store.retry();

        const repeated: TestRequest = http.expectOne((candidate): boolean => candidate.params.get('page') === '2');

        expect(repeated.request.params.get('tree')).toBe('a1b2');
        repeated.flush(pageOf([], 0));
        expect(store.fault()).toBeNull();
    });

    it('нечитавшийся стор на повтор молчит: выдуманная выборка показала бы не то', () => {
        store.retry();

        http.expectNone((): boolean => true);
    });
});
