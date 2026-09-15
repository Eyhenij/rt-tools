import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminContainerComponent } from './admin-container.component';

describe('AdminContainerComponent', () => {
    let fixture: ComponentFixture<AdminContainerComponent>;
    let http: HttpTestingController;

    /**
     * Ответ приёмника о том, кто вошёл. Права приезжают им, а не подставляются в состояние:
     * подставленные, они проверяли бы то, чего в дереве нет, — путь ответа тот же, что у экрана.
     */
    function signedInWith(rights: readonly string[]): void {
        TestBed.inject(AuthStore).restore().subscribe();
        http.expectOne('/api/auth/session').flush({ name: 'Владелец', rights });
        fixture.detectChanges();
    }

    /** Подписи разделов в шапке: по ним видно, какие пункты нарисованы. */
    function shownSections(): readonly string[] {
        return fixture.debugElement
            .queryAll(By.css('[qa-dataid="header-nav-item"]'))
            .map((item): string => (item.nativeElement as HTMLElement).textContent?.trim() ?? '');
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminContainerComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(AdminContainerComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        // Значки кит просит тем же клиентом: без слива они читаются проверкой как неотвеченные
        // запросы экрана, и падает на них любая спека, что бы она ни проверяла.
        http.match((request: HttpRequest<unknown>): boolean => request.url.startsWith('/icons/'));
        http.verify();
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('стопка тостов на странице одна, и рисует её каркас', () => {
        const toasters: ReadonlyArray<unknown> = fixture.debugElement.queryAll(By.css('rt-toaster'));

        expect(toasters.length).toBe(1);
        expect(fixture.debugElement.query(By.css('rt-container rt-toaster'))).not.toBeNull();
    });

    it('шапка стоит в зоне шапки каркаса, а раздел — в зоне содержимого', () => {
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-header"] admin-header'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-content"] router-outlet'))).not.toBeNull();
    });

    it('SC-MB-142 — разделы приходят в шапку декларацией меню, а колонки с ними нет', () => {
        signedInWith(['postmortems:read', 'proposals:read', 'summaries:read', 'usage:read', 'invites:read', 'accounts:read']);

        expect(shownSections().length).toBe(6);
        expect(fixture.debugElement.query(By.css('rt-section-nav'))).toBeNull();
    });

    it('SC-MB-298 — раздел, право на который есть, в шапке стоит', () => {
        signedInWith(['postmortems:read']);

        expect(shownSections()).toEqual(['Разборы происшествий']);
    });

    it('SC-MB-299, SC-MB-351 — раздела, права на который нет, в шапке нет вовсе', () => {
        signedInWith(['postmortems:read']);

        expect(shownSections()).not.toContain('Приглашения');
        expect(shownSections()).not.toContain('Использование');
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-no-sections"]'))).toBeNull();
    });

    it('SC-MB-325 — раздел людей стоит в шапке у того, у кого есть `accounts:read`', () => {
        signedInWith(['accounts:read']);

        expect(shownSections()).toEqual(['Пользователи']);
    });

    it('SC-MB-325 — раздела людей без этого права в шапке нет вовсе', () => {
        signedInWith(['postmortems:read']);

        // Сперва положительное: разделы вообще показываются — иначе проверка на отсутствие
        // зеленела бы и на шапке, потерявшей меню целиком.
        expect(shownSections()).toContain('Разборы происшествий');
        expect(shownSections()).not.toContain('Пользователи');
    });

    it('SC-MB-301 — пока ответ о вошедшем не приехал, не скрывается ничего', () => {
        // Права неизвестны, а не пусты: скрыв по пустому набору, админка спрятала бы разделы у
        // того, у кого они есть, — и человек остался бы на пустом экране без выхода с него.
        // Семь — все пункты декларации, включая роли, которые открыты одним правом на роли
        expect(shownSections().length).toBe(7);
    });

    it('SC-MB-302 — вошедшему без единого права разделов не показывают, а говорят, что доступа нет', () => {
        signedInWith([]);

        expect(shownSections()).toEqual([]);
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-no-sections"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-content"] router-outlet'))).toBeNull();
    });
});
