import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { IPage } from '@rt/message-bus-common';
import { EListSortOrder } from '@rt-tools/utils';

import { AdminListScreenBase } from './admin-list-screen.base';

interface IRow {
    id: string;
}

const LIST_PATH: string = '/api/postmortems';
const TREES_PATH: string = '/api/trees';

/** Стор раздела: к основе он добавляет ровно адрес операции. */
@Injectable({ providedIn: 'root' })
class TestListStore extends AdminListStoreBase<IRow> {
    protected readonly path: string = LIST_PATH;

    constructor() {
        super();
    }

    protected rowOf(raw: IRow): IRow {
        return raw;
    }
}

/**
 * Раздел, собранный на основе. Своих решений у него нет — только стор, поля порядка и
 * публичные обёртки: методы основы защищённые, и спека зовёт их так же, как шаблон.
 *
 * Аутлета панели в шаблоне нет: в приложении он объявлен у оболочки, а не у экрана раздела.
 */
@Component({
    selector: 'admin-test-list',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestScreenComponent extends AdminListScreenBase<IRow> {
    protected readonly store: TestListStore = inject(TestListStore);
    protected readonly sortable: readonly string[] = ['arrivedAt', 'updatedAt'];
    protected readonly tableId: string = 'admin-test';

    constructor() {
        super();
    }

    public askPage(page: number): void {
        this.goToPage(page);
    }

    public askSize(size: number): void {
        this.changeSize(size);
    }

    public askTree(tree: string): void {
        this.changeTree(tree);
    }

    public askSort(field: string): void {
        this.changeSort({ propertyName: field, sortDirection: EListSortOrder.ASC });
    }

    public open(id: string): void {
        this.openDetails(id);
    }

    public shownRows(): readonly IRow[] {
        return this.rows();
    }

    public shownEmptyMessage(): string {
        return this.emptyMessage();
    }

    public shownEmptyDescription(): string {
        return this.emptyDescription();
    }
}

/** Панель подробностей: своего содержимого спеке не нужно — нужен маршрут в аутлете `ro`. */
@Component({
    selector: 'admin-test-details',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestDetailsComponent {}

function pageOf(rows: readonly IRow[]): IPage<IRow> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminListScreenBase', () => {
    let http: HttpTestingController;
    let router: Router;

    /** Читает список тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IRow[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === LIST_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([
                    { path: 'postmortems', component: TestScreenComponent },
                    { path: 'postmortems/table-settings', pathMatch: 'full', outlet: 'ro', component: TestDetailsComponent },
                    { path: 'postmortems/:id', pathMatch: 'full', outlet: 'ro', component: TestDetailsComponent },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('вход в раздел читает список выборкой из адреса и деревья для отбора', async () => {
        await RouterTestingHarness.create('/postmortems?page=2&tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.params.get('page')).toBe('2');
        expect(list.request.params.get('tree')).toBe('a1b2');
        http.expectOne(TREES_PATH).flush([{ slug: 'a1b2', name: 'Приёмник' }]);
    });

    it('переход на страницу уходит в адрес, а чтение — от адреса', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.askPage(3);
        await harness.fixture.whenStable();

        expect(router.url).toBe('/postmortems?page=3');
        expect(answerList([{ id: 'third' }]).request.params.get('page')).toBe('3');
        expect(screen.shownRows()).toEqual([{ id: 'third' }]);
    });

    it('SC-MB-111 — отбор по дереву возвращает список на первую страницу', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems?page=4');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.askTree('c3d4');
        await harness.fixture.whenStable();

        expect(router.url).toBe('/postmortems?tree=c3d4');
        answerList();
    });

    it('порядок, названный заголовком столбца, встаёт в адрес', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.askSort('updatedAt');
        await harness.fixture.whenStable();

        expect(router.url).toBe('/postmortems?sort=updatedAt&dir=asc');
        answerList();
    });

    it('размер страницы меняется вместе с возвратом на первую', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems?page=2');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.askSize(50);
        await harness.fixture.whenStable();

        expect(router.url).toBe('/postmortems?size=50');
        answerList();
    });

    it('открытая запись не трогает выборку: закрытая панель вернёт тот же список', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems?page=2&tree=a1b2');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.open('one');
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:postmortems/one)');
        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
    });

    it('SC-MB-116 — настройка столбцов не трогает выборку: закрытая панель вернёт тот же список', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems?page=2&tree=a1b2');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);
        screen.openColumns();
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:postmortems/table-settings)');
        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
    });

    it('пустой список объясняет себя по-разному с отбором и без него', async () => {
        const harness: RouterTestingHarness = await RouterTestingHarness.create('/postmortems');
        const screen: TestScreenComponent = harness.routeDebugElement?.componentInstance;

        answerList();
        http.expectOne(TREES_PATH).flush([]);

        expect(screen.shownEmptyMessage()).toBe('Записей нет');
        expect(screen.shownEmptyDescription()).toBe('Ни один проект их пока не присылал');

        screen.askTree('a1b2');
        await harness.fixture.whenStable();
        answerList();

        expect(screen.shownEmptyMessage()).toBe('По этому отбору записей нет');
        expect(screen.shownEmptyDescription()).toBe('Снимите отбор по проекту или выберите другой');
    });
});
