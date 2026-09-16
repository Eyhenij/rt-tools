import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IRole, ROLES_PATH } from '@rt/message-bus-admin/accounts/util';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminRolesListComponent } from './admin-roles-list.component';

/**
 * Хранилище выбора столбцов, живущее в памяти: настоящее лежит в базе браузера, которой в стенде
 * спек нет, и служба отвечала бы подписке таблицы ошибкой.
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

function rowOf(patch: Partial<IRole.Short.Api> = {}): IRole.Short.Api {
    return { key: 'owner', name: 'Владелец', rights: ['postmortems:read', 'roles:manage'], people: 1, ...patch };
}

function pageOf(rows: readonly IRole.Short.Api[]): IPage<IRole.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminRolesListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;

    function answerList(rows: readonly IRole.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === ROLES_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    async function openSection(rows: readonly IRole.Short.Api[] = [rowOf()]): Promise<void> {
        harness = await RouterTestingHarness.create('/roles');
        answerList(rows);
        await harness.fixture.whenStable();
        harness.detectChanges();
    }

    function signedInWith(rights: readonly string[]): void {
        TestBed.inject(AuthStore).restore().subscribe();
        http.expectOne('/api/auth/session').flush({ name: 'Набор', rights });
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
                provideRouter([{ path: 'roles', component: AdminRolesListComponent }]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-371 — раздел читает роли по имени, и строка называет имя, права словами и число людей', async () => {
        harness = await RouterTestingHarness.create('/roles');

        const list: TestRequest = answerList([rowOf(), rowOf({ key: 'spare', name: 'Лишняя', rights: [], people: 0 })]);

        expect(list.request.params.get('sort')).toBe('name');
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(cells('roles-cell-name')).toEqual(['Владелец', 'Лишняя']);
        expect(cells('roles-cell-rights')).toEqual(['Разборы происшествий — чтение, Роли — правка', 'Ни одного права']);
        expect(cells('roles-cell-people')).toEqual(['1', '0']);
    });

    it('SC-MB-373 — пустой список называет, чем заводятся роли, и кнопка над ним стоит', async () => {
        await openSection([]);

        expect(harness.fixture.nativeElement.textContent).toContain('кнопкой «Завести роль»');
        expect(found('[qa-dataid="roles-create"]')).not.toBeNull();
    });

    it('SC-MB-376 — удаление есть только у роли, которую никто не держит', async () => {
        await openSection([rowOf(), rowOf({ key: 'spare', name: 'Лишняя', people: 0 })]);
        signedInWith(['roles:manage']);

        const triggers: DebugElement[] = harness.fixture.debugElement.queryAll(By.css('[qa-dataid="menu-trigger"] button'));

        // Занятая роль первой: меню, открытое раз, остаётся в слое поверх страницы, и второе
        // открытое рядом с ним не сказало бы, чей пункт нашёлся. Сперва положительное — пункт
        // правки у занятой есть, — и только потом отсутствие удаления
        triggers[0].nativeElement.click();
        harness.detectChanges();

        expect(document.querySelectorAll('[qa-dataid="roles-edit"]')).toHaveLength(1);
        expect(document.querySelectorAll('[qa-dataid="roles-delete"]')).toHaveLength(0);

        triggers[1].nativeElement.click();
        harness.detectChanges();

        expect(document.querySelectorAll('[qa-dataid="roles-delete"]')).toHaveLength(1);
    });

    it('SC-MB-372 — без права на роли нет ни кнопки над списком, ни меню строки; до ответа не прячется ничего', async () => {
        await openSection();

        expect(found('[qa-dataid="roles-create"]')).not.toBeNull();
        expect(found('[qa-dataid="menu-trigger"]')).not.toBeNull();

        signedInWith(['accounts:read']);

        expect(found('[qa-dataid="roles-row"]')).not.toBeNull();
        expect(found('[qa-dataid="roles-create"]')).toBeNull();
        expect(found('[qa-dataid="menu-trigger"]')).toBeNull();
    });
});
