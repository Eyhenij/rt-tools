import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IPostmortem, POSTMORTEMS_PATH } from '@rt/message-bus-admin/postmortems/util';
import { IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminPostmortemsListComponent } from './admin-postmortems-list.component';

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
    selector: 'admin-postmortem-details-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class DetailsStubComponent {}

function rowOf(patch: Partial<IPostmortem.Short.Api> = {}): IPostmortem.Short.Api {
    return {
        id: 'p1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        file: '2026-08-14-incident.md',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        updatedAt: '2026-08-15T06:00:00.000Z',
        ...patch,
    };
}

function pageOf(rows: readonly IPostmortem.Short.Api[]): IPage<IPostmortem.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminPostmortemsListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IPostmortem.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === POSTMORTEMS_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    /** Деревья отбора: их просит тулбар страницы, и без ответа спека висла бы на `verify()`. */
    function answerTrees(): void {
        http.expectOne(TREES_PATH).flush([{ slug: 'a1b2', name: 'Приёмник' }]);
    }

    async function openSection(url: string = '/postmortems', rows: readonly IPostmortem.Short.Api[] = [rowOf()]): Promise<void> {
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
                    { path: 'postmortems', component: AdminPostmortemsListComponent },
                    { path: 'postmortems/:id', pathMatch: 'full', outlet: 'ro', component: DetailsStubComponent },
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
        harness = await RouterTestingHarness.create('/postmortems');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(POSTMORTEMS_PATH);
        expect(list.request.params.get('sort')).toBe('arrivedAt');
        expect(list.request.params.get('dir')).toBe('desc');
        answerTrees();
    });

    it('выборка из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/postmortems?page=2&size=50&sort=file&dir=asc&tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.params.get('page')).toBe('2');
        expect(list.request.params.get('size')).toBe('50');
        expect(list.request.params.get('sort')).toBe('file');
        expect(list.request.params.get('dir')).toBe('asc');
        expect(list.request.params.get('tree')).toBe('a1b2');
        answerTrees();
    });

    it('SC-MB-222 — в тулбаре раздела стоят два отбора, и по состоянию — правее', async () => {
        await openSection();

        const filters: string[] = Array.from(
            harness.fixture.nativeElement.querySelectorAll('[qa-dataid="list-tree-filter"], [qa-dataid="list-state-filter"]')
        ).map((node: Element): string => String(node.getAttribute('qa-dataid')));

        expect(filters).toEqual(['list-tree-filter', 'list-state-filter']);
    });

    it('SC-MB-223 — отбор по состоянию из адреса уходит в запрос списка', async () => {
        harness = await RouterTestingHarness.create('/postmortems?state=in_work&tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.params.get('state')).toBe('in_work');
        expect(list.request.params.get('tree')).toBe('a1b2');
        answerTrees();
    });

    it('SC-MB-224 — снятый отбор по состоянию в запрос не уходит вовсе', async () => {
        harness = await RouterTestingHarness.create('/postmortems');

        const list: TestRequest = answerList();

        expect(list.request.params.has('state')).toBe(false);
        answerTrees();
    });

    it('строка таблицы называет дерево именем, а разбор — файлом', async () => {
        await openSection();

        expect(cells('postmortems-cell-tree')).toEqual(['Приёмник']);
        expect(cells('postmortems-cell-file')).toEqual(['2026-08-14-incident.md']);
    });

    it('время в строке показано днём и минутами, а не строкой ответа', async () => {
        await openSection();

        expect(cells('postmortems-cell-arrived')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
        expect(cells('postmortems-cell-updated')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('нажатие на строку открывает панель подробностей, не трогая выборку', async () => {
        await openSection('/postmortems?page=2&tree=a1b2');
        harness.fixture.debugElement.query(By.css('[qa-dataid="postmortems-row"]')).nativeElement.click();
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:postmortems/p1)');
        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
    });

    it('SC-MB-135 — таблица раздела объявлена элементом кита, а не атрибутом на своей разметке', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('rt-table[qa-dataid="postmortems-table"][role="table"]'))).not.toBeNull();
    });
});
