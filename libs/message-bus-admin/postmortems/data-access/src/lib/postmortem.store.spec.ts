import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EReadFault, IAdminListQuery, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { IPostmortem, POSTMORTEMS_PATH } from '@rt/message-bus-admin/postmortems/util';

import { PostmortemStore } from './postmortem.store';
import { PostmortemsStore } from './postmortems.store';
import { POSTMORTEM_SORTABLE } from '@rt/message-bus-common';

/** Ответ приёмника на одну запись: времена в нём строки, текст приезжает только здесь. */
function apiOne(patch: Partial<IPostmortem.Api> = {}): IPostmortem.Api {
    return {
        id: 'p1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        file: '2026-08-14-incident.md',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        updatedAt: '2026-08-15T06:00:00.000Z',
        text: '# Разбор',
        ...patch,
    };
}

describe('PostmortemsStore', () => {
    let store: PostmortemsStore;
    let http: HttpTestingController;

    const QUERY: IAdminListQuery = listQueryOf({}, POSTMORTEM_SORTABLE);

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(PostmortemsStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('список читается адресом разборов', () => {
        store.read(QUERY);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === POSTMORTEMS_PATH);

        expect(request.request.method).toBe('GET');
        request.flush({ rows: [], total: 0, page: 1, size: 20 });
    });

    it('строка ложится в состояние переведённой: время временем, а не строкой', () => {
        store.read(QUERY);
        http.expectOne((candidate): boolean => candidate.url === POSTMORTEMS_PATH).flush({
            rows: [
                {
                    id: 'p1',
                    tree: { slug: 'a1b2', name: 'Приёмник' },
                    file: 'one.md',
                    arrivedAt: '2026-08-14T21:30:00.000Z',
                    updatedAt: '2026-08-15T06:00:00.000Z',
                },
            ],
            total: 1,
            page: 1,
            size: 20,
        });

        const row: IPostmortem.Short.State = store.rows()[0];

        expect(row.arrivedAt).toBeInstanceOf(Date);
        expect(row.arrivedAt.toISOString()).toBe('2026-08-14T21:30:00.000Z');
        expect(row.tree.name).toBe('Приёмник');
    });
});

describe('PostmortemStore', () => {
    let store: PostmortemStore;
    let http: HttpTestingController;

    /** Запрос одной записи: адрес раздела с признаком записи хвостом. */
    function askedOne(id: string): TestRequest {
        return http.expectOne((candidate): boolean => candidate.url === `${POSTMORTEMS_PATH}/${id}`);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(PostmortemStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('прочитанная запись несёт текст разбора целиком', () => {
        store.read('p1');
        askedOne('p1').flush(apiOne({ text: '# Разбор\nупало ночью' }));

        expect(store.entity()?.text).toBe('# Разбор\nупало ночью');
        expect(store.entity()?.arrivedAt).toBeInstanceOf(Date);
        expect(store.fault()).toBeNull();
        expect(store.pending()).toBe(false);
    });

    it('признак записи уходит в адрес закодированным', () => {
        store.read('a b/c');
        askedOne(encodeURIComponent('a b/c')).flush(apiOne());

        expect(store.entity()?.id).toBe('p1');
    });

    it('записи, которой нет, отвечает своим родом отказа, а не поломкой чтения', () => {
        store.read('gone');
        askedOne('gone').flush('нет записи', { status: 404, statusText: 'Not Found' });

        expect(store.fault()?.kind).toBe(EReadFault.Missing);
        expect(store.entity()).toBeNull();
    });

    it('отказ службы называет номер обращения', () => {
        store.read('p1');
        askedOne('p1').flush({ message: 'обращение ab12cd' }, { status: 500, statusText: 'Server Error' });

        expect(store.fault()).toEqual({ kind: EReadFault.Service, incident: 'ab12cd' });
    });

    it('кончившийся вход отличается от поломки чтения', () => {
        store.read('p1');
        askedOne('p1').flush('', { status: 401, statusText: 'Unauthorized' });

        expect(store.fault()?.kind).toBe(EReadFault.Session);
    });

    it('соседняя запись, открытая до ответа, показывается вместо первой', () => {
        store.read('first');

        const first: TestRequest = askedOne('first');

        store.read('second');
        askedOne('second').flush(apiOne({ id: 'second', file: 'second.md' }));

        expect(first.cancelled).toBe(true);
        expect(store.entity()?.id).toBe('second');
    });

    it('новое чтение снимает прежний отказ, а не показывает его поверх записи', () => {
        store.read('gone');
        askedOne('gone').flush('', { status: 404, statusText: 'Not Found' });
        store.read('p1');

        expect(store.fault()).toBeNull();

        askedOne('p1').flush(apiOne());

        expect(store.entity()?.id).toBe('p1');
        expect(store.fault()).toBeNull();
    });
});
