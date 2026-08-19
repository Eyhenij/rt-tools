import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ApplicationRef, DebugElement } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IInvite, INVITES_PATH } from '@rt/message-bus-admin/invites/util';
import { ETreeInviteView, IPage } from '@rt/message-bus-common';
import { IDBStorageService, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { Observable, of } from 'rxjs';

import { AdminInvitesListComponent } from './admin-invites-list.component';

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

function rowOf(patch: Partial<IInvite.Short.Api> = {}): IInvite.Short.Api {
    return {
        name: 'Своё дерево',
        state: ETreeInviteView.Waiting,
        issuedAt: '2026-08-17T10:00:00.000Z',
        expiresAt: '2026-08-19T10:00:00.000Z',
        treeSlug: null,
        ...patch,
    };
}

function pageOf(rows: readonly IInvite.Short.Api[]): IPage<IInvite.Short.Api> {
    return { rows, total: rows.length, page: 1, size: 20 };
}

describe('AdminInvitesListComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;

    /** Отвечает списку тем, чем ответил бы приёмник, и отдаёт ушедший запрос. */
    function answerList(rows: readonly IInvite.Short.Api[] = []): TestRequest {
        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url === INVITES_PATH);

        request.flush(pageOf(rows));

        return request;
    }

    async function openSection(rows: readonly IInvite.Short.Api[] = [rowOf()], url: string = '/invites'): Promise<void> {
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

    /** Наложения кит рисует вне разметки экрана — их ищут в самой странице. */
    function overlayNode(qaId: string): HTMLElement | null {
        return document.querySelector(`[qa-dataid="${qaId}"]`);
    }

    /** Нажать то, что уже нарисовано наложением, и дать приложению перерисоваться. */
    async function clickOverlay(qaId: string): Promise<void> {
        overlayNode(qaId)?.click();
        TestBed.inject(ApplicationRef).tick();
        await harness.fixture.whenStable();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
                { provide: IDBStorageService, useClass: ColumnSettingsStub },
                provideRouter([{ path: 'invites', component: AdminInvitesListComponent }]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-128 — раздел, открытый без выборки, читает приглашения выданными позже сверху', async () => {
        harness = await RouterTestingHarness.create('/invites');

        const list: TestRequest = answerList([rowOf()]);

        expect(list.request.url).toBe(INVITES_PATH);
        expect(list.request.params.get('sort')).toBe('issuedAt');
        expect(list.request.params.get('dir')).toBe('desc');
    });

    it('SC-MB-128 — строка называет имя, состояние и сроки, а кода приглашения на экране нет', async () => {
        await openSection();

        expect(cells('invites-cell-name')).toEqual(['Своё дерево']);
        expect(cells('invites-cell-state')).toEqual(['Ждёт']);
        expect(cells('invites-cell-issued')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
        expect(cells('invites-cell-expires')[0]).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
        expect(harness.fixture.nativeElement.textContent).not.toContain('hash');
    });

    it('SC-MB-128 — погашенное приглашение остаётся в списке и называет своё дерево', async () => {
        await openSection([rowOf({ state: ETreeInviteView.Redeemed, treeSlug: 'own-tree' })]);

        expect(cells('invites-cell-state')).toEqual(['Погашено']);
        expect(cells('invites-cell-tree')).toEqual(['own-tree']);
    });

    it('SC-MB-128, SC-MB-162 — пустой список называет кнопку, которой выдаётся приглашение', async () => {
        await openSection([]);

        const text: string = harness.fixture.nativeElement.textContent;

        // сперва положительное: пустое состояние показано и называет, откуда берутся записи
        expect(text).toContain('Пригласить дерево');
        // и только потом отрицательное: команды узла в нём больше нет
        expect(text).not.toContain('tree:invite');
    });

    it('SC-MB-120 — у ждущего приглашения есть чем открыть действия строки', async () => {
        await openSection([rowOf()]);

        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"]'))).not.toBeNull();
    });

    it('SC-MB-120 — у отозванного приглашения кнопки действий нет вовсе', async () => {
        await openSection([rowOf({ state: ETreeInviteView.Revoked })]);

        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="invites-row"]'))).not.toBeNull();
        expect(harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"]'))).toBeNull();
    });

    it('SC-MB-120 — отзыв спрашивает подтверждение, и без него приёмник не зовётся', async () => {
        await openSection([rowOf()]);
        harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"] button')).nativeElement.click();
        await harness.fixture.whenStable();
        harness.detectChanges();

        await clickOverlay('invites-revoke');

        expect(overlayNode('menu-confirm-message')?.textContent).toContain('Своё дерево');
        http.expectNone((candidate): boolean => candidate.method === 'DELETE');

        await clickOverlay('menu-confirm-cancel');

        http.expectNone((candidate): boolean => candidate.method === 'DELETE');
    });

    it('SC-MB-120 — подтверждённый отзыв уходит на приёмник и перечитывает список', async () => {
        await openSection([rowOf()]);
        harness.fixture.debugElement.query(By.css('[qa-dataid="menu-trigger"] button')).nativeElement.click();
        await harness.fixture.whenStable();
        harness.detectChanges();

        await clickOverlay('invites-revoke');
        await clickOverlay('menu-confirm-accept');

        const revoke: TestRequest = http.expectOne((candidate): boolean => candidate.method === 'DELETE');

        expect(revoke.request.url).toBe(`${INVITES_PATH}/${encodeURIComponent('Своё дерево')}`);
        revoke.flush({});
        await harness.fixture.whenStable();

        const reread: TestRequest = answerList([rowOf({ state: ETreeInviteView.Revoked })]);

        expect(reread.request.method).toBe('GET');
    });

    it('SC-MB-135 — таблица раздела объявлена элементом кита, а не атрибутом на своей разметке', async () => {
        await openSection();

        expect(harness.fixture.debugElement.query(By.css('rt-table[qa-dataid="invites-table"][role="table"]'))).not.toBeNull();
    });
});
