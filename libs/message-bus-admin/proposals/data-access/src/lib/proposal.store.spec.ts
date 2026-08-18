import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EReadFault, IAdminListQuery, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { IProposal, PROPOSALS_PATH } from '@rt/message-bus-admin/proposals/util';

import { ProposalStore } from './proposal.store';
import { ProposalsStore } from './proposals.store';
import { PROPOSAL_SORTABLE } from '@rt/message-bus-common';

/** Ответ приёмника на одну запись: время в нём строка, текст и месяц приезжают только здесь. */
function apiOne(patch: Partial<IProposal.Api> = {}): IProposal.Api {
    return {
        id: 'q1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        resource: 'rules/lists.md',
        address: 'Ловушки',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        text: 'ловушку стоит назвать',
        month: '2026-08',
        ...patch,
    };
}

describe('ProposalsStore', () => {
    let store: ProposalsStore;
    let http: HttpTestingController;

    const QUERY: IAdminListQuery = listQueryOf({}, PROPOSAL_SORTABLE);

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(ProposalsStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('список читается адресом предложений', () => {
        store.read(QUERY);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === PROPOSALS_PATH);

        expect(request.request.method).toBe('GET');
        request.flush({ rows: [], total: 0, page: 1, size: 20 });
    });

    it('строка ложится в состояние переведённой: время временем, а не строкой', () => {
        store.read(QUERY);
        http.expectOne((candidate): boolean => candidate.url === PROPOSALS_PATH).flush({
            rows: [
                {
                    id: 'q1',
                    tree: { slug: 'a1b2', name: 'Приёмник' },
                    resource: 'rules/lists.md',
                    address: 'Ловушки',
                    arrivedAt: '2026-08-14T21:30:00.000Z',
                },
            ],
            total: 1,
            page: 1,
            size: 20,
        });

        const row: IProposal.Short.State = store.rows()[0];

        expect(row.arrivedAt).toBeInstanceOf(Date);
        expect(row.arrivedAt.toISOString()).toBe('2026-08-14T21:30:00.000Z');
        expect(row.resource).toBe('rules/lists.md');
        expect(row.tree.name).toBe('Приёмник');
    });

    it('умолчание порядка — свежие сверху: первое поле набора и убывание', () => {
        store.read(QUERY);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === PROPOSALS_PATH);

        expect(request.request.params.get('sort')).toBe('arrivedAt');
        request.flush({ rows: [], total: 0, page: 1, size: 20 });
    });
});

describe('ProposalStore', () => {
    let store: ProposalStore;
    let http: HttpTestingController;

    /** Запрос одной записи: адрес раздела с признаком записи хвостом. */
    function askedOne(id: string): TestRequest {
        return http.expectOne((candidate): boolean => candidate.url === `${PROPOSALS_PATH}/${id}`);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(ProposalStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('прочитанная запись несёт текст предложения и месяц записи', () => {
        store.read('q1');
        askedOne('q1').flush(apiOne({ text: 'ловушку стоит назвать', month: '2026-08' }));

        expect(store.entity()?.text).toBe('ловушку стоит назвать');
        expect(store.entity()?.month).toBe('2026-08');
        expect(store.entity()?.arrivedAt).toBeInstanceOf(Date);
        expect(store.fault()).toBeNull();
        expect(store.pending()).toBe(false);
    });

    it('признак записи уходит в адрес закодированным', () => {
        store.read('a b/c');
        askedOne(encodeURIComponent('a b/c')).flush(apiOne());

        expect(store.entity()?.id).toBe('q1');
    });

    it('записи, которой нет, отвечает своим родом отказа, а не поломкой чтения', () => {
        store.read('gone');
        askedOne('gone').flush('нет записи', { status: 404, statusText: 'Not Found' });

        expect(store.fault()?.kind).toBe(EReadFault.Missing);
        expect(store.entity()).toBeNull();
    });

    it('отказ службы называет номер обращения', () => {
        store.read('q1');
        askedOne('q1').flush({ message: 'обращение ab12cd' }, { status: 500, statusText: 'Server Error' });

        expect(store.fault()).toEqual({ kind: EReadFault.Service, incident: 'ab12cd' });
    });

    it('кончившийся вход отличается от поломки чтения', () => {
        store.read('q1');
        askedOne('q1').flush('', { status: 401, statusText: 'Unauthorized' });

        expect(store.fault()?.kind).toBe(EReadFault.Session);
    });

    it('соседняя запись, открытая до ответа, показывается вместо первой', () => {
        store.read('first');

        const first: TestRequest = askedOne('first');

        store.read('second');
        askedOne('second').flush(apiOne({ id: 'second', resource: 'rules/testing.md' }));

        expect(first.cancelled).toBe(true);
        expect(store.entity()?.id).toBe('second');
    });

    it('новое чтение снимает прежний отказ, а не показывает его поверх записи', () => {
        store.read('gone');
        askedOne('gone').flush('', { status: 404, statusText: 'Not Found' });
        store.read('q1');

        expect(store.fault()).toBeNull();

        askedOne('q1').flush(apiOne());

        expect(store.entity()?.id).toBe('q1');
        expect(store.fault()).toBeNull();
    });
});
