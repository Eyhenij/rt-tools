import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { QUALITY_PATH } from '@rt/message-bus-admin/usage/util';
import { IQualityReport } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { RT_KIT_LOCALE } from '@rt-tools/ui-kit-v2';
import { Observable, of } from 'rxjs';

import { AdminUsageQualityComponent } from './admin-usage-quality.component';

const TREES_PATH: string = '/api/trees';

/** Хранилище выбора столбцов в памяти: настоящего в стенде спек нет. */
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

function report(over: Partial<IQualityReport> = {}): IQualityReport {
    return {
        rows: [{ resource: 'one-guard', refusals: 1, empty: 2, gateRefusals: 0, afterLoad: 0, wastedRuns: 1, wastedSeconds: 120, loss: 3 }],
        total: 1,
        page: 1,
        size: 20,
        from: '2026-08-01',
        to: '2026-08-31',
        anyLine: true,
        anyInPeriod: true,
        firstPass: { counted: 3, firstPass: 2, share: null, noHandover: 0 },
        corrections: { count: 1, accepted: 3, perTask: null },
        repeats: { repeats: 0, fixes: 0, share: null, unnamed: 0 },
        completeness: { enrolled: 2, sent: 1, withOutcomes: 1, faults: [] },
        versions: ['0.35.0'],
        ...over,
    };
}

describe('AdminUsageQualityComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;

    function asked(): TestRequest {
        return http.expectOne((candidate): boolean => candidate.url === QUALITY_PATH);
    }

    function has(qaId: string): boolean {
        return harness.fixture.nativeElement.querySelector(`[qa-dataid="${qaId}"]`) !== null;
    }

    function textOf(qaId: string): string {
        return harness.fixture.nativeElement.querySelector(`[qa-dataid="${qaId}"]`)?.textContent.trim() ?? '';
    }

    async function settle(): Promise<void> {
        await harness.fixture.whenStable();
        harness.detectChanges();
    }

    async function open(answer: IQualityReport): Promise<void> {
        harness = await RouterTestingHarness.create('/quality');
        asked().flush(answer);
        http.expectOne(TREES_PATH).flush([{ slug: 'one', name: 'Первое' }]);
        await settle();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
                { provide: IDBStorageService, useClass: ColumnSettingsStub },
                { provide: RT_KIT_LOCALE, useValue: signal('ru') },
                provideRouter([{ path: 'quality', component: AdminUsageQualityComponent }]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-AK-1325 — на первом чтении стоит скелет, а после ответа числа и таблица', async () => {
        harness = await RouterTestingHarness.create('/quality');
        harness.detectChanges();

        expect(has('quality-reading')).toBe(true);
        expect(has('quality-tiles')).toBe(false);

        asked().flush(report());
        http.expectOne(TREES_PATH).flush([]);
        await settle();

        expect(has('quality-reading')).toBe(false);
        expect(textOf('quality-tile-first-pass')).toContain('2 из 3');
        expect(textOf('quality-cell-resource')).toBe('one-guard');
        expect(textOf('quality-cell-wasted-minutes')).toBe('2');
    });

    it('SC-AK-1326 — строка полноты стоит под числами, а сбой называет дерево и причину', async () => {
        await open(
            report({
                completeness: { enrolled: 2, sent: 1, withOutcomes: 1, faults: [{ tree: { slug: 'one', name: 'Первое' }, fault: 2 }] },
            })
        );

        expect(textOf('quality-completeness')).toContain('1 из 2');
        expect(textOf('quality-send-fault')).toBe('Первое: приём отказал токену проекта');
    });

    it('SC-AK-1329 — ни одной строки дня: чисел нет, а пустая таблица называет команду', async () => {
        await open(report({ rows: [], total: 0, anyLine: false }));

        expect(has('quality-tiles')).toBe(false);
        expect(has('quality-reading')).toBe(false);
        expect(harness.fixture.nativeElement.textContent).toContain('npx agent-kit enroll --code');
    });

    it('SC-AK-1331 — период без строк: чисел нет, а таблица просит другой период', async () => {
        await open(report({ rows: [], total: 0, anyInPeriod: false }));

        expect(has('quality-tiles')).toBe(false);
        expect(has('quality-completeness')).toBe(true);
        expect(harness.fixture.nativeElement.textContent).toContain('За этот период чисел нет');
    });

    it('SC-AK-1330 — отказ чтения снимает сводку, а страница показывает повтор', async () => {
        harness = await RouterTestingHarness.create('/quality');
        http.expectOne(TREES_PATH).flush([]);
        asked().flush({ message: 'нет' }, { status: 500, statusText: 'Server Error' });
        await settle();

        expect(has('quality-reading')).toBe(false);
        expect(has('quality-retry')).toBe(true);

        harness.fixture.nativeElement.querySelector('[qa-dataid="quality-retry"]').click();
        asked().flush(report());
        await settle();

        expect(has('quality-tiles')).toBe(true);
    });

    it('SC-AK-1327 — версия уходит в запрос из адреса, а меню версий не предлагает «без версии»', async () => {
        harness = await RouterTestingHarness.create('/quality?version=0.35.0');
        http.expectOne(TREES_PATH).flush([]);

        const request: TestRequest = asked();

        expect(request.request.params.get('version')).toBe('0.35.0');
        request.flush(report());
        await settle();

        expect(has('list-version-filter')).toBe(true);
    });
});
