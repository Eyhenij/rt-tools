import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IProposal, PROPOSALS_PATH } from '@rt/message-bus-admin/proposals/util';
import { IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminProposalsListComponent } from './admin-proposals-list.component';

const TREES_PATH: string = '/api/trees';
const VERSIONS_PATH: string = '/api/cargo/versions';

/**
 * Хранилище выбора столбцов, живущее в памяти.
 *
 * Настоящее лежит в базе браузера, а её в стенде спек нет вовсе: служба отвечает на это ошибкой
 * подписке таблицы, и прогон валится не падением проверки, а необработанным отказом.
 */
class ColumnSettingsStub {
    readonly #kept: Map<string, unknown> = new Map<string, unknown>();

    public get(key: string): Observable<unknown> {
        return of(this.#kept.get(key));
    }

    public set(key: string, value: unknown): Observable<void> {
        this.#kept.set(key, value);

        return of(undefined);
    }

    public remove(key: string): Observable<void> {
        this.#kept.delete(key);

        return of(undefined);
    }
}

/** Панель подробностей: спеке нужен маршрут в аутлете `ro`, а не её содержимое. */
@Component({
    selector: 'admin-proposal-details-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class DetailsStubComponent {}

function rowOf(patch: Partial<IProposal.Short.Api> = {}): IProposal.Short.Api {
    return {
        id: 'q1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        resource: 'rules/lists.md',
        address: 'Ловушки',
        releaseVersion: '0.9.0',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        ...patch,
    };
}

function pageOf(rows: readonly IProposal.Short.Api[]): IPage<IProposal.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminProposalsListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IProposal.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === PROPOSALS_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    /** Деревья отбора: их просит тулбар страницы, и без ответа спека висла бы на `verify()`. */
    function answerTrees(): void {
        http.expectOne(TREES_PATH).flush([{ slug: 'a1b2', name: 'Приёмник' }]);
    }

    /** Версии отбора: их просит третий отбор тулбара, и отдаёт ушедший запрос — по нему виден род груза. */
    function answerVersions(versions: readonly string[] = ['0.9.0', '0.10.0']): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === VERSIONS_PATH);

        request.flush(versions);

        return request;
    }

    async function openSection(url: string = '/proposals', rows: readonly IProposal.Short.Api[] = [rowOf()]): Promise<void> {
        harness = await RouterTestingHarness.create(url);
        answerList(rows);
        answerTrees();
        answerVersions();
        await harness.fixture.whenStable();
        harness.detectChanges();
    }

    function cells(qaId: string): readonly string[] {
        return harness.fixture.debugElement
            .queryAll(By.css(`[qa-dataid="${qaId}"]`))
            .map((cell: DebugElement): string => cell.nativeElement.textContent.trim());
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
                { provide: IDBStorageService, useClass: ColumnSettingsStub },
                provideRouter([
                    { path: 'proposals', component: AdminProposalsListComponent },
                    { path: 'proposals/:id', pathMatch: 'full', outlet: 'ro', component: DetailsStubComponent },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('раздел, открытый без выборки, читает свой список свежими сверху', async () => {
        harness = await RouterTestingHarness.create('/proposals');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(PROPOSALS_PATH);
        expect(list.request.params.get('sort')).toBe('arrivedAt');
        expect(list.request.params.get('dir')).toBe('desc');
        answerTrees();
    });

    it('SC-MB-222, SC-MB-239 — в тулбаре раздела стоят три отбора, и по версии — правее всех', async () => {
        await openSection();

        const filters: string[] = Array.from(
            harness.fixture.nativeElement.querySelectorAll(
                '[qa-dataid="list-tree-filter"], [qa-dataid="list-state-filter"], [qa-dataid="list-version-filter"]'
            )
        ).map((node: Element): string => String(node.getAttribute('qa-dataid')));

        expect(filters).toEqual(['list-tree-filter', 'list-state-filter', 'list-version-filter']);
    });

    it('SC-MB-254 — раздел просит версии своего рода груза, а не версии разборов', async () => {
        harness = await RouterTestingHarness.create('/proposals');
        answerList();
        answerTrees();

        expect(answerVersions().request.params.get('kind')).toBe('proposal');
    });

    it('SC-MB-241 — отбор по версии из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/proposals?version=0.9.0');

        const list: TestRequest = answerList();

        expect(list.request.params.get('version')).toBe('0.9.0');
        answerTrees();
        answerVersions();
    });

    it('SC-MB-237, SC-MB-238 — столбец версии показывает выпущенную запись и оставляет ячейку пустой у невыпущенной', async () => {
        await openSection('/proposals', [rowOf(), rowOf({ id: 'q2', resource: 'laws/lists.md', releaseVersion: null })]);

        expect(cells('proposals-cell-version')).toEqual(['0.9.0', '']);
    });

    it('SC-MB-223 — отбор по состоянию из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/proposals?state=released');

        const list: TestRequest = answerList();

        expect(list.request.params.get('state')).toBe('released');
        answerTrees();
    });

    it('выборка из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/proposals?page=2&size=50&sort=resource&dir=asc&tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.params.get('page')).toBe('2');
        expect(list.request.params.get('size')).toBe('50');
        expect(list.request.params.get('sort')).toBe('resource');
        expect(list.request.params.get('dir')).toBe('asc');
        expect(list.request.params.get('tree')).toBe('a1b2');
        answerTrees();
    });

    it('порядок по полю не из набора раздела до приёмника не доходит', async () => {
        harness = await RouterTestingHarness.create('/proposals?sort=file');

        const list: TestRequest = answerList();

        expect(list.request.params.get('sort')).toBe('arrivedAt');
        answerTrees();
    });

    it('строка таблицы называет дерево именем, а предложение — ресурсом и адресом', async () => {
        await openSection();

        expect(cells('proposals-cell-tree')).toEqual(['Приёмник']);
        expect(cells('proposals-cell-resource')).toEqual(['rules/lists.md']);
        expect(cells('proposals-cell-address')).toEqual(['Ловушки']);
    });

    it('время в строке показано днём и минутами, а не строкой ответа', async () => {
        await openSection();

        expect(cells('proposals-cell-arrived')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('нажатие на строку открывает панель подробностей, не трогая выборку', async () => {
        await openSection('/proposals?page=2&tree=a1b2');
        harness.fixture.debugElement.query(By.css('[qa-dataid="proposals-row"]')).nativeElement.click();
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:proposals/q1)');
        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
    });

    it('SC-MB-135 — таблица раздела объявлена элементом кита, а не атрибутом на своей разметке', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('rt-table[qa-dataid="proposals-table"][role="table"]'))).not.toBeNull();
    });
});
