import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IPerson, PEOPLE_PATH } from '@rt/message-bus-admin/accounts/util';
import { IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminPeopleListComponent } from './admin-people-list.component';

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

function rowOf(patch: Partial<IPerson.Short.Api> = {}): IPerson.Short.Api {
    return {
        name: 'Ольга',
        role: 'Владелец',
        disabledAt: null,
        lastLoginAt: '2026-08-17T10:00:00.000Z',
        ...patch,
    };
}

function pageOf(rows: readonly IPerson.Short.Api[]): IPage<IPerson.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminPeopleListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IPerson.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === PEOPLE_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    async function openSection(rows: readonly IPerson.Short.Api[] = [rowOf()], url: string = '/people'): Promise<void> {
        harness = await RouterTestingHarness.create(url);
        answerList(rows);
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
                provideRouter([{ path: 'people', component: AdminPeopleListComponent }]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-324 — раздел, открытый без выборки, читает людей входившими позже сверху', async () => {
        harness = await RouterTestingHarness.create('/people');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(PEOPLE_PATH);
        expect(list.request.params.get('sort')).toBe('lastLoginAt');
        expect(list.request.params.get('dir')).toBe('desc');
    });

    it('SC-MB-324 — строка называет имя, роль, состояние и время последнего входа', async () => {
        await openSection();

        expect(cells('people-cell-name')).toEqual(['Ольга']);
        expect(cells('people-cell-role')).toEqual(['Владелец']);
        expect(cells('people-cell-state')).toEqual(['Действует']);
        expect(cells('people-cell-last-login')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('SC-MB-324 — у записи без роли на месте роли стоит слово об этом, а не пустая ячейка', async () => {
        // Сперва положительное: у соседней записи роль на месте — иначе проверка зеленела бы и на
        // экране, потерявшем этот столбец целиком.
        await openSection([rowOf(), rowOf({ name: 'Андрей', role: null })]);

        expect(cells('people-cell-role')[0]).toBe('Владелец');
        expect(cells('people-cell-role')[1]).toBe('Роли нет');
    });

    it('SC-MB-324 — отключённая запись называет своё состояние и из списка не пропадает', async () => {
        await openSection([rowOf({ name: 'Андрей', disabledAt: '2026-08-18T10:00:00.000Z' })]);

        expect(cells('people-cell-name')).toEqual(['Андрей']);
        expect(cells('people-cell-state')).toEqual(['Отключена']);
    });

    it('SC-MB-324 — запись без входов говорит об этом словом, а не пустым местом', async () => {
        await openSection([rowOf({ lastLoginAt: null })]);

        expect(cells('people-cell-last-login')).toEqual(['Не входили']);
    });

    it('SC-MB-324 — пустой список называет, чем заводятся записи, а кнопки заведения не обещает', async () => {
        await openSection([]);

        const text: string = harness.fixture.nativeElement.textContent;

        // сперва положительное: пустое состояние показано и называет, откуда берутся записи
        expect(text).toContain('Заводятся командой строки запуска');
        // и только потом отрицательное: кнопки заведения раздел не показывает — её нет вовсе
        expect(text).not.toContain('Завести');
    });

    it('SC-MB-324 — порядок по состоянию просится полем времени отключения, а не ключом столбца', async () => {
        await openSection();
        harness.fixture.debugElement.queryAll(By.css('[cdk-header-cell] button'))[1].nativeElement.click();
        await harness.fixture.whenStable();

        // Ключ столбца «state» набор полей приёмника не принимает: попросив его, экран получил бы
        // отказ выборки там, где заголовок нажимается.
        const list: TestRequest = http.expectOne((candidate): boolean => candidate.url === PEOPLE_PATH);

        expect(list.request.params.get('sort')).toBe('disabledAt');
    });

    it('SC-MB-324 — ни строка, ни меню строки не нажимаются: правок над записью из веба нет', async () => {
        await openSection();

        // Сперва положительное: строка на экране есть — иначе проверка зеленела бы на пустом списке.
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="people-row"]'))).not.toBeNull();
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"]'))).toBeNull();
    });
});
