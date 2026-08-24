import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IMonthRecord, SUMMARIES_PATH } from '@rt/message-bus-admin/summaries/util';
import { IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminSummariesListComponent } from './admin-summaries-list.component';

const TREES_PATH: string = '/api/trees';

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
    selector: 'admin-month-record-details-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class DetailsStubComponent {}

function rowOf(patch: Partial<IMonthRecord.Short.Api> = {}): IMonthRecord.Short.Api {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        schema: '1',
        ranAt: '2026-08-15T09:20:05.257Z',
        ...patch,
    };
}

function pageOf(rows: readonly IMonthRecord.Short.Api[]): IPage<IMonthRecord.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminSummariesListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IMonthRecord.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === SUMMARIES_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    /** Деревья отбора: их просит тулбар страницы, и без ответа спека висла бы на `verify()`. */
    function answerTrees(): void {
        http.expectOne(TREES_PATH).flush([{ slug: 'a1b2', name: 'Приёмник' }]);
    }

    async function openSection(url: string = '/summaries', rows: readonly IMonthRecord.Short.Api[] = [rowOf()]): Promise<void> {
        harness = await RouterTestingHarness.create(url);
        answerList(rows);
        answerTrees();
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
                    { path: 'summaries', component: AdminSummariesListComponent },
                    { path: 'summaries/:id', pathMatch: 'full', outlet: 'ro', component: DetailsStubComponent },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-234, SC-MB-252 — в тулбаре сводок стоит один отбор по дереву: ни состояния, ни версии у записи месяца нет', async () => {
        harness = await RouterTestingHarness.create('/summaries');

        answerList([rowOf()]);
        answerTrees();
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-tree-filter"]')).not.toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-state-filter"]')).toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-version-filter"]')).toBeNull();
    });

    it('раздел, открытый без выборки, читает свой список свежими сверху', async () => {
        harness = await RouterTestingHarness.create('/summaries');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(SUMMARIES_PATH);
        expect(list.request.params.get('sort')).toBe('ranAt');
        expect(list.request.params.get('dir')).toBe('desc');
        answerTrees();
    });

    it('выборка из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/summaries?page=2&size=50&sort=month&dir=asc&tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.params.get('page')).toBe('2');
        expect(list.request.params.get('size')).toBe('50');
        expect(list.request.params.get('sort')).toBe('month');
        expect(list.request.params.get('dir')).toBe('asc');
        expect(list.request.params.get('tree')).toBe('a1b2');
        answerTrees();
    });

    it('порядок по полю не из набора раздела до приёмника не доходит', async () => {
        harness = await RouterTestingHarness.create('/summaries?sort=sessions');

        const list: TestRequest = answerList();

        expect(list.request.params.get('sort')).toBe('ranAt');
        answerTrees();
    });

    it('строка таблицы называет дерево именем, месяц и счёт заходов', async () => {
        await openSection();

        expect(cells('summaries-cell-tree')).toEqual(['Приёмник']);
        expect(cells('summaries-cell-month')).toEqual(['2026-08']);
        expect(cells('summaries-cell-sessions')).toEqual(['19']);
    });

    it('месяц без сводки показан нулём заходов, а не пустой ячейкой', async () => {
        await openSection('/summaries', [rowOf({ sessions: null })]);

        expect(cells('summaries-cell-sessions')).toEqual(['0']);
    });

    it('время в строке показано днём и минутами, а не строкой ответа', async () => {
        await openSection();

        expect(cells('summaries-cell-ran')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('нажатие на строку открывает панель подробностей, не трогая выборку', async () => {
        await openSection('/summaries?page=2&tree=a1b2');
        harness.fixture.debugElement.query(By.css('[qa-dataid="summaries-row"]')).nativeElement.click();
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:summaries/m1)');
        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
    });

    it('SC-MB-135 — таблица раздела объявлена элементом кита, а не атрибутом на своей разметке', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('rt-table[qa-dataid="summaries-table"][role="table"]'))).not.toBeNull();
    });

    it('SC-MB-132 — якоря списка собраны из префикса раздела, и чужих среди них нет', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="summaries-row"]'))).not.toBeNull();
        expect(cells('summaries-cell-tree')).toEqual(['Приёмник']);
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="proposals-row"]'))).toBeNull();
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="list-table"]'))).toBeNull();
    });
});
