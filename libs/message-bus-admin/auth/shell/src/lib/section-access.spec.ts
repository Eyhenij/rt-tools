import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';

import { firstOpenSectionPath, landingPath, noSectionsGuard, sectionRightGuard } from './section-access';

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

    /** Ответ проверки на переход на сам экран «разделов нет». */
    function noSectionsVerdict(): boolean | UrlTree {
        return runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
            noSectionsGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        ) as boolean | UrlTree;
    }

    /** Куда ведёт корень админки при нынешних правах. */
    function landing(): string {
        return runInInjectionContext(TestBed.inject(EnvironmentInjector), (): string => landingPath());
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

    it('SC-MB-351 — раздел использования закрыт своим правом: право сводок его не открывает', (): void => {
        signedInWith(['summaries:read']);

        expect(verdictOf('/usage')).not.toBe(true);

        signedInWith(['usage:read']);

        expect(verdictOf('/usage')).toBe(true);
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

    it('SC-MB-397 — прямая ссылка в закрытый раздел у того, кому не открыт ни один, ведёт на экран', (): void => {
        // Отказ перехода, стоявший здесь прежде, оставлял адрес там, где он стоял, — а на первой
        // загрузке страницы стоять ему негде, и человек видел белую страницу.
        signedInWith([]);

        const verdict: boolean | UrlTree = verdictOf('/postmortems');

        expect(verdict).not.toBe(true);
        expect(String(verdict)).toBe('/no-sections');
        expect(runInInjectionContext(TestBed.inject(EnvironmentInjector), (): string => firstOpenSectionPath())).toBe('');
    });

    it('SC-MB-395 — корень у вошедшего без единого права ведёт на экран, а не в пустой адрес', (): void => {
        signedInWith([]);

        expect(landing()).toBe('/no-sections');
    });

    it('SC-MB-398 — адрес экрана уводит того, кому раздел открыт, в этот раздел', (): void => {
        signedInWith(['summaries:read']);

        const verdict: boolean | UrlTree = noSectionsVerdict();

        expect(verdict).not.toBe(true);
        expect(String(verdict)).toBe('/summaries');
    });

    it('SC-MB-396 — экран открыт тому, кому не открыт ни один раздел', (): void => {
        // Отрицательное проверено соседней спекой: адрес уводит того, у кого раздел есть, — без
        // неё эта зеленела бы и у стража, отвечающего согласием всегда.
        signedInWith([]);

        expect(noSectionsVerdict()).toBe(true);
    });

    it('SC-MB-303 — корень ведёт в первый открытый раздел, а не в первый по списку', (): void => {
        signedInWith(['summaries:read', 'invites:read']);

        expect(runInInjectionContext(TestBed.inject(EnvironmentInjector), (): string => firstOpenSectionPath())).toBe('/summaries');
        expect(landing()).toBe('/summaries');
    });

    it('SC-MB-401 — пока ответ о вошедшем не приехал, на экран «разделов нет» не уводят', (): void => {
        // Права неизвестны, а не пусты: увод на экран до ответа читался бы как отказ, который тут
        // же взяли назад.
        expect(landing()).toBe('/postmortems');
        expect(noSectionsVerdict()).not.toBe(true);
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

        expect(verdictOf('/postmortems')).not.toBe(true);
        expect(verdictOf('/nothing-here')).toBe(true);
    });
});
