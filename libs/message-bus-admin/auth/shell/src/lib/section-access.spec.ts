import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';

import { firstOpenSectionPath, sectionRightGuard } from './section-access';

/**
 * Раздел, закрытый правом своего пункта меню.
 *
 * Права приезжают ответом приёмника, а не подставляются в состояние: путь тот же, что у экрана, и
 * подставленное состояние проверяло бы то, чего в дереве нет.
 */
describe('sectionRightGuard', (): void => {
    let http: HttpTestingController;

    function signedInWith(rights: readonly string[]): void {
        TestBed.inject(AuthStore).restore().subscribe();
        http.expectOne('/api/auth/session').flush({ name: 'Владелец', rights });
    }

    /** Ответ проверки на переход по адресу: согласие, отказ или адрес ухода. */
    function verdictOf(url: string): boolean | UrlTree {
        return runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
            sectionRightGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
        ) as boolean | UrlTree;
    }

    beforeEach((): void => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
        });

        http = TestBed.inject(HttpTestingController);
    });

    afterEach((): void => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('SC-MB-298 — раздел, право на который есть, открывается', (): void => {
        signedInWith(['postmortems:read']);

        expect(verdictOf('/postmortems')).toBe(true);
    });

    it('SC-MB-300 — адрес закрытого раздела прямой ссылкой не открывается', (): void => {
        signedInWith(['proposals:read']);

        const verdict: boolean | UrlTree = verdictOf('/postmortems');

        expect(verdict).not.toBe(true);
        expect(String(verdict)).toBe('/proposals');
    });

    it('SC-MB-300 — панель подробностей закрытого раздела закрыта тем же правом', (): void => {
        signedInWith(['proposals:read']);

        expect(verdictOf('/postmortems/1c2d')).not.toBe(true);
    });

    it('SC-MB-325 — раздел людей без права `accounts:read` не открывается прямой ссылкой', (): void => {
        // Сперва положительное: с правом раздел открывается — иначе проверка зеленела бы и на
        // адресе, которого в объявлении меню нет вовсе.
        signedInWith(['accounts:read']);

        expect(verdictOf('/people')).toBe(true);

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
        });
        http = TestBed.inject(HttpTestingController);
        signedInWith(['proposals:read']);

        expect(verdictOf('/people')).not.toBe(true);
    });

    it('SC-MB-301 — пока ответ о вошедшем не приехал, не закрывается ничего', (): void => {
        // Права неизвестны, а не пусты: закрыв по пустому набору, админка увела бы с раздела
        // того, у кого право на него есть.
        expect(verdictOf('/postmortems')).toBe(true);
    });

    it('SC-MB-302 — вошедшему без единого права переход не состоится, и уводить его некуда', (): void => {
        signedInWith([]);

        expect(verdictOf('/postmortems')).toBe(false);
        expect(runInInjectionContext(TestBed.inject(EnvironmentInjector), (): string => firstOpenSectionPath())).toBe('');
    });

    it('SC-MB-303 — корень ведёт в первый открытый раздел, а не в первый по списку', (): void => {
        signedInWith(['summaries:read', 'invites:read']);

        expect(runInInjectionContext(TestBed.inject(EnvironmentInjector), (): string => firstOpenSectionPath())).toBe('/summaries');
    });

    it('SC-MB-305 — снятое право закрывает раздел на следующем переходе', (): void => {
        signedInWith(['postmortems:read']);

        expect(verdictOf('/postmortems')).toBe(true);

        signedInWith(['proposals:read']);

        expect(verdictOf('/postmortems')).not.toBe(true);
    });

    it('адрес, за которым не стоит ни один пункт меню, эта проверка не судит', (): void => {
        // Сначала проверяется, что искомое вообще находится: проверка, не узнающая ни одного
        // адреса, отвечала бы согласием всегда и оставалась бы зелёной на любой поломке отбора.
        signedInWith([]);

        expect(verdictOf('/postmortems')).toBe(false);
        expect(verdictOf('/nothing-here')).toBe(true);
    });
});
