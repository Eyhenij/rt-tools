import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IUsage, USAGE_PATH } from '@rt/message-bus-admin/usage/util';
import { IUsagePage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminUsageListComponent } from './admin-usage-list.component';

const TREES_PATH: string = '/api/trees';
const PERIOD: { from: string; to: string } = { from: '2026-08-01', to: '2026-08-31' };

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

/** Панель сессий: спеке нужен маршрут в аутлете `ro`, а не её содержимое. */
@Component({
    selector: 'admin-usage-sessions-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class SessionsStubComponent {}

function rowOf(patch: Partial<IUsage.Row.Api> = {}): IUsage.Row.Api {
    return { skill: 'testing', kind: 'rule', loads: 3, sessions: 2, denials: 1, ...patch };
}

function pageOf(rows: readonly IUsage.Row.Api[], period: { from: string; to: string } = PERIOD): IUsagePage {
    return { rows, total: rows.length, page: 1, size: 20, ...period };
}

describe('AdminUsageListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IUsage.Row.Api[] = [], period: { from: string; to: string } = PERIOD): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === USAGE_PATH);

        request.flush(pageOf(rows, period));

        return request;
    }

    /** Деревья отбора: их просит тулбар страницы, и без ответа спека висла бы на `verify()`. */
    function answerTrees(): void {
        http.expectOne(TREES_PATH).flush([{ slug: 'a1b2', name: 'Приёмник' }]);
    }

    async function openSection(url: string = '/usage', rows: readonly IUsage.Row.Api[] = [rowOf()]): Promise<void> {
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

    function fieldValue(qaId: string): string {
        return harness.fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"] input`)).nativeElement.value;
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
                    { path: 'usage', component: AdminUsageListComponent },
                    { path: 'usage/:skill', pathMatch: 'full', outlet: 'ro', component: SessionsStubComponent },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-348 — в тулбаре стоят отбор по дереву и отбор по периоду, а состояния и версии нет', async () => {
        await openSection();

        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-tree-filter"]')).not.toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-period-from"]')).not.toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-period-to"]')).not.toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-state-filter"]')).toBeNull();
        expect(harness.fixture.nativeElement.querySelector('[qa-dataid="list-version-filter"]')).toBeNull();
    });

    it('раздел, открытый без выборки, читает таблицу самыми загружаемыми сверху и без периода', async () => {
        harness = await RouterTestingHarness.create('/usage?tree=a1b2');

        const list: TestRequest = answerList();

        expect(list.request.url).toBe(USAGE_PATH);
        expect(list.request.params.get('sort')).toBe('loads');
        expect(list.request.params.get('dir')).toBe('desc');
        expect(list.request.params.get('tree')).toBe('a1b2');
        expect(list.request.params.has('from')).toBe(false);
        answerTrees();
    });

    it('SC-MB-349 — период из адреса уходит в запрос списка двумя днями', async () => {
        harness = await RouterTestingHarness.create('/usage?tree=a1b2&from=2026-08-10&to=2026-08-10&sort=sessions&dir=asc');

        const list: TestRequest = answerList();

        expect(list.request.params.get('from')).toBe('2026-08-10');
        expect(list.request.params.get('to')).toBe('2026-08-10');
        expect(list.request.params.get('sort')).toBe('sessions');
        expect(list.request.params.get('dir')).toBe('asc');
        answerTrees();
    });

    it('SC-MB-353 — период, которого адрес не назвал, в отборе показан тем, что считал приёмник', async () => {
        await openSection('/usage?tree=a1b2');
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(fieldValue('list-period-from')).toBe(PERIOD.from);
        expect(fieldValue('list-period-to')).toBe(PERIOD.to);
        expect(router.url).toBe('/usage?tree=a1b2');
    });

    it('порядок по полю не из набора раздела до приёмника не доходит', async () => {
        harness = await RouterTestingHarness.create('/usage?sort=kind');

        const list: TestRequest = answerList();

        expect(list.request.params.get('sort')).toBe('loads');
        answerTrees();
    });

    it('SC-MB-348 — строка таблицы называет скил, род словом словаря, загрузки, сессии и отказы', async () => {
        await openSection('/usage', [rowOf(), rowOf({ skill: 'git-workflow-commit', kind: 'pattern', loads: 1, sessions: 1, denials: 0 })]);

        expect(cells('usage-cell-skill')).toEqual(['testing', 'git-workflow-commit']);
        expect(cells('usage-cell-kind')).toEqual(['правило', 'паттерн']);
        expect(cells('usage-cell-loads')).toEqual(['3', '1']);
        expect(cells('usage-cell-sessions')).toEqual(['2', '1']);
        expect(cells('usage-cell-denials')).toEqual(['1', '0']);
    });

    it('SC-MB-350 — нажатие на строку открывает панель сессий скила, не трогая выборку', async () => {
        await openSection('/usage?tree=a1b2&from=2026-08-01&to=2026-08-31');
        harness.fixture.debugElement.query(By.css('[qa-dataid="usage-row"]')).nativeElement.click();
        await harness.fixture.whenStable();

        expect(router.url).toContain('(ro:usage/testing)');
        expect(router.url).toContain('tree=a1b2');
        expect(router.url).toContain('from=2026-08-01');
    });

    it('SC-MB-135 — таблица раздела объявлена элементом кита, а не атрибутом на своей разметке', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('rt-table[qa-dataid="usage-table"][role="table"]'))).not.toBeNull();
    });

    it('SC-MB-132 — якоря списка собраны из префикса раздела, и чужих среди них нет', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="usage-row"]'))).not.toBeNull();
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="summaries-row"]'))).toBeNull();
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="list-table"]'))).toBeNull();
    });
});
