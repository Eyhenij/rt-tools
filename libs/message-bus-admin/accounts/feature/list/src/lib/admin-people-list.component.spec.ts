import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IPerson, PEOPLE_PATH } from '@rt/message-bus-admin/accounts/util';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
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

    /**
     * Ответ о вошедшем: права и имя, как их прислал бы приёмник. Тем же путём, что и у экрана:
     * подставленное состояние проверяло бы то, чего в дереве нет.
     */
    function signedInWith(rights: readonly string[], name: string = 'Набор'): void {
        TestBed.inject(AuthStore).restore().subscribe();
        http.expectOne('/api/auth/session').flush({ name, rights });
        harness.detectChanges();
    }

    function found(selector: string): DebugElement | null {
        return harness.fixture.debugElement.query(By.css(selector));
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

    it('SC-MB-360 — раздел, открытый без выборки, читает людей входившими позже сверху', async () => {
        harness = await RouterTestingHarness.create('/people');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(PEOPLE_PATH);
        expect(list.request.params.get('sort')).toBe('lastLoginAt');
        expect(list.request.params.get('dir')).toBe('desc');
    });

    it('SC-MB-360 — строка называет имя, роль, состояние и время последнего входа', async () => {
        await openSection();

        expect(cells('people-cell-name')).toEqual(['Ольга']);
        expect(cells('people-cell-role')).toEqual(['Владелец']);
        expect(cells('people-cell-state')).toEqual(['Действует']);
        expect(cells('people-cell-last-login')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('SC-MB-360 — у записи без роли на месте роли стоит слово об этом, а не пустая ячейка', async () => {
        // Сперва положительное: у соседней записи роль на месте — иначе проверка зеленела бы и на
        // экране, потерявшем этот столбец целиком.
        await openSection([rowOf(), rowOf({ name: 'Андрей', role: null })]);

        expect(cells('people-cell-role')[0]).toBe('Владелец');
        expect(cells('people-cell-role')[1]).toBe('Роли нет');
    });

    it('SC-MB-360 — отключённая запись называет своё состояние и из списка не пропадает', async () => {
        await openSection([rowOf({ name: 'Андрей', disabledAt: '2026-08-18T10:00:00.000Z' })]);

        expect(cells('people-cell-name')).toEqual(['Андрей']);
        expect(cells('people-cell-state')).toEqual(['Отключена']);
    });

    it('SC-MB-360 — запись без входов говорит об этом словом, а не пустым местом', async () => {
        await openSection([rowOf({ lastLoginAt: null })]);

        expect(cells('people-cell-last-login')).toEqual(['Не входили']);
    });

    it('SC-MB-360 — пустой список называет, чем заводятся записи, и кнопка над ним стоит', async () => {
        await openSection([]);

        const text: string = harness.fixture.nativeElement.textContent;

        expect(text).toContain('кнопкой «Завести пользователя»');
        expect(found('[qa-dataid="people-create"]')).not.toBeNull();
    });

    it('SC-MB-360 — порядок по состоянию просится полем времени отключения, а не ключом столбца', async () => {
        await openSection();
        harness.fixture.debugElement.queryAll(By.css('[cdk-header-cell] button'))[1].nativeElement.click();
        await harness.fixture.whenStable();

        // Ключ столбца «state» набор полей приёмника не принимает: попросив его, экран получил бы
        // отказ выборки там, где заголовок нажимается.
        const list: TestRequest = http.expectOne((candidate): boolean => candidate.url === PEOPLE_PATH);

        expect(list.request.params.get('sort')).toBe('disabledAt');
    });

    it('SC-MB-368 — без права на правку нет ни кнопки над списком, ни меню строки', async () => {
        await openSection([rowOf(), rowOf({ name: 'Андрей' })]);

        // Сперва положительное: с правом кнопка и меню на месте — иначе утверждение об отсутствии
        // зеленело бы и на экране, потерявшем их целиком.
        signedInWith(['accounts:read', 'accounts:manage']);

        expect(found('[qa-dataid="people-create"]')).not.toBeNull();
        expect(found('[qa-dataid="menu-trigger"]')).not.toBeNull();

        signedInWith(['accounts:read']);

        expect(found('[qa-dataid="people-row"]')).not.toBeNull();
        expect(found('[qa-dataid="people-create"]')).toBeNull();
        expect(found('[qa-dataid="menu-trigger"]')).toBeNull();
    });

    it('SC-MB-368 — пока ответ о вошедшем не приехал, кнопка и меню не прячутся', async () => {
        await openSection();

        expect(found('[qa-dataid="people-create"]')).not.toBeNull();
        expect(found('[qa-dataid="menu-trigger"]')).not.toBeNull();
    });

    it('SC-MB-365 — у отключённой записи меню нет: отключать второй раз и менять пароль нечему', async () => {
        await openSection([rowOf(), rowOf({ name: 'Андрей', disabledAt: '2026-08-18T10:00:00.000Z' })]);
        signedInWith(['accounts:manage']);

        expect(harness.fixture.debugElement.queryAll(By.css('[qa-dataid="menu-trigger"]'))).toHaveLength(1);
    });

    it('SC-MB-366 — своя строка отключения не получает, а чужая получает', async () => {
        await openSection([rowOf({ name: 'Набор' }), rowOf({ name: 'Андрей' })]);
        signedInWith(['accounts:manage'], 'Набор');

        const triggers: DebugElement[] = harness.fixture.debugElement.queryAll(By.css('[qa-dataid="menu-trigger"] button'));

        // Своя строка первой: меню, открытое раз, остаётся в слое поверх страницы, и второе
        // открытое рядом с ним не сказало бы, чей пункт нашёлся. Сперва положительное — пункт
        // пароля у своей строки есть, — и только потом отсутствие отключения.
        triggers[0].nativeElement.click();
        harness.detectChanges();

        expect(document.querySelectorAll('[qa-dataid="people-password"]')).toHaveLength(1);
        expect(document.querySelectorAll('[qa-dataid="people-disable"]')).toHaveLength(0);

        triggers[1].nativeElement.click();
        harness.detectChanges();

        expect(document.querySelectorAll('[qa-dataid="people-disable"]')).toHaveLength(1);
    });

    it('SC-MB-377 — пункт «Права» есть с правом на роли и без права на правку людей, и наоборот его нет', async () => {
        await openSection([rowOf({ name: 'Андрей' })]);
        signedInWith(['roles:manage']);

        harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"] button')).nativeElement.click();
        harness.detectChanges();

        expect(document.querySelectorAll('[qa-dataid="people-access"]')).toHaveLength(1);
        expect(document.querySelectorAll('[qa-dataid="people-password"]')).toHaveLength(0);
        expect(document.querySelectorAll('[qa-dataid="people-disable"]')).toHaveLength(0);
    });
});
