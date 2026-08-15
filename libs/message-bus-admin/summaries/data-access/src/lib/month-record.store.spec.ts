import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EReadFault, IAdminListQuery, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { IMonthRecord, SUMMARIES_PATH, SUMMARIES_SORTABLE } from '@rt/message-bus-admin/summaries/util';

import { MonthRecordStore } from './month-record.store';
import { MonthRecordsStore } from './month-records.store';

/** Ответ приёмника на одну запись: время в нём строка, сводка приезжает только здесь. */
function apiOne(patch: Partial<IMonthRecord.Api> = {}): IMonthRecord.Api {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        schema: '1',
        ranAt: '2026-08-15T09:20:05.257Z',
        summary: { days: 3, tree: 'a1b2' },
        ...patch,
    };
}

describe('MonthRecordsStore', () => {
    let store: MonthRecordsStore;
    let http: HttpTestingController;

    const QUERY: IAdminListQuery = listQueryOf({}, SUMMARIES_SORTABLE);

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(MonthRecordsStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('список читается адресом сводок', () => {
        store.read(QUERY);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === SUMMARIES_PATH);

        expect(request.request.method).toBe('GET');
        request.flush({ rows: [], total: 0, page: 1, size: 20 });
    });

    it('умолчание порядка — свежие прогоны сверху', () => {
        store.read(QUERY);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === SUMMARIES_PATH);

        expect(request.request.params.get('sort')).toBe('ranAt');
        request.flush({ rows: [], total: 0, page: 1, size: 20 });
    });

    it('строка ложится в состояние переведённой: время временем, а не строкой', () => {
        store.read(QUERY);
        http.expectOne((candidate): boolean => candidate.url === SUMMARIES_PATH).flush({
            rows: [
                {
                    id: 'm1',
                    tree: { slug: 'a1b2', name: 'Приёмник' },
                    month: '2026-08',
                    sessions: 19,
                    schema: '1',
                    ranAt: '2026-08-15T09:20:05.257Z',
                },
            ],
            total: 1,
            page: 1,
            size: 20,
        });

        const row: IMonthRecord.Short.State = store.rows()[0];

        expect(row.ranAt).toBeInstanceOf(Date);
        expect(row.month).toBe('2026-08');
        expect(row.sessions).toBe(19);
        expect(row.tree.name).toBe('Приёмник');
    });
});

describe('MonthRecordStore', () => {
    let store: MonthRecordStore;
    let http: HttpTestingController;

    /** Запрос одной записи: адрес раздела с признаком записи хвостом. */
    function askedOne(id: string): TestRequest {
        return http.expectOne((candidate): boolean => candidate.url === `${SUMMARIES_PATH}/${id}`);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(MonthRecordStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('прочитанная запись несёт сводку текстом', () => {
        store.read('m1');
        askedOne('m1').flush(apiOne({ summary: { days: 3 } }));

        expect(store.entity()?.summary).toContain('"days": 3');
        expect(store.entity()?.ranAt).toBeInstanceOf(Date);
        expect(store.fault()).toBeNull();
        expect(store.pending()).toBe(false);
    });

    it('месяц без сводки читается пустым текстом и нулём заходов', () => {
        store.read('m1');
        askedOne('m1').flush(apiOne({ summary: null, sessions: null }));

        expect(store.entity()?.summary).toBe('');
        expect(store.entity()?.sessions).toBe(0);
        expect(store.fault()).toBeNull();
    });

    it('признак записи уходит в адрес закодированным', () => {
        store.read('a b/c');
        askedOne(encodeURIComponent('a b/c')).flush(apiOne());

        expect(store.entity()?.id).toBe('m1');
    });

    it('записи, которой нет, отвечает своим родом отказа, а не поломкой чтения', () => {
        store.read('gone');
        askedOne('gone').flush('нет записи', { status: 404, statusText: 'Not Found' });

        expect(store.fault()?.kind).toBe(EReadFault.Missing);
        expect(store.entity()).toBeNull();
    });

    it('отказ службы называет номер обращения', () => {
        store.read('m1');
        askedOne('m1').flush({ message: 'обращение ab12cd' }, { status: 500, statusText: 'Server Error' });

        expect(store.fault()).toEqual({ kind: EReadFault.Service, incident: 'ab12cd' });
    });

    it('кончившийся вход отличается от поломки чтения', () => {
        store.read('m1');
        askedOne('m1').flush('', { status: 401, statusText: 'Unauthorized' });

        expect(store.fault()?.kind).toBe(EReadFault.Session);
    });

    it('соседняя запись, открытая до ответа, показывается вместо первой', () => {
        store.read('first');

        const first: TestRequest = askedOne('first');

        store.read('second');
        askedOne('second').flush(apiOne({ id: 'second', month: '2026-07' }));

        expect(first.cancelled).toBe(true);
        expect(store.entity()?.id).toBe('second');
        expect(store.entity()?.month).toBe('2026-07');
    });

    it('новое чтение снимает прежний отказ, а не показывает его поверх записи', () => {
        store.read('gone');
        askedOne('gone').flush('', { status: 404, statusText: 'Not Found' });
        store.read('m1');

        expect(store.fault()).toBeNull();

        askedOne('m1').flush(apiOne());

        expect(store.entity()?.id).toBe('m1');
        expect(store.fault()).toBeNull();
    });
});
