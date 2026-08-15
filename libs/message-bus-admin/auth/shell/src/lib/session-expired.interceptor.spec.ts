import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { IAdminSession } from '@rt/message-bus-admin/auth/util';
import { filter, firstValueFrom, Observable, take } from 'rxjs';

import { sessionExpiredInterceptor } from './session-expired.interceptor';
import { RETURN_TO_PARAM, SIGN_IN_PATH } from './session.guard';

const LIST_PATH: string = '/api/postmortems';
const SESSION_PATH: string = '/api/auth/session';

/** Экраны спеки: их разметка ни при чём — проверяется адрес, на котором человек оказался. */
@Component({ selector: 'admin-test-screen', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ScreenComponent {}

const SESSION: IAdminSession = { name: 'owner' };

describe('sessionExpiredInterceptor', () => {
    let http: HttpTestingController;
    let client: HttpClient;
    let router: Router;
    let store: AuthStore;

    /** Отказ приёмника на обращении, ушедшем с открытого экрана. */
    function refuse(path: string, status: number): void {
        client.get(path).subscribe({ error: (): void => undefined });
        http.expectOne(path).flush('', { status, statusText: 'Refused' });
    }

    /**
     * Обещание приезда роутера, взятое до отказа.
     *
     * Увод идёт из перехватчика, и его навигацию спеке подождать нечем: дождаться приезда можно
     * только событием, а подписаться на него надо раньше, чем отказ случился.
     */
    function arrival(): Promise<unknown> {
        return firstValueFrom(
            router.events.pipe(
                filter((event: unknown): boolean => event instanceof NavigationEnd),
                take(1)
            )
        );
    }

    /** Оборот очереди: увода не ждут, а дают ему случиться и смотрят, что его не было. */
    function settled(): Promise<void> {
        return new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 0);
        });
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
                provideHttpClientTesting(),
                provideRouter([
                    { path: SIGN_IN_PATH, component: ScreenComponent },
                    { path: 'postmortems', component: ScreenComponent },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        client = TestBed.inject(HttpClient);
        router = TestBed.inject(Router);
        store = TestBed.inject(AuthStore);

        await RouterTestingHarness.create('/postmortems?page=2');
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('кончившийся вход уводит с открытого экрана на вход', async () => {
        const arrived: Promise<unknown> = arrival();

        refuse(LIST_PATH, 401);
        await arrived;

        expect(router.url).toContain(`/${SIGN_IN_PATH}`);
    });

    it('увод помнит, где человек стоял, вместе с выборкой списка', async () => {
        const arrived: Promise<unknown> = arrival();

        refuse(LIST_PATH, 401);
        await arrived;

        expect(decodeURIComponent(router.url)).toContain(`${RETURN_TO_PARAM}=/postmortems?page=2`);
    });

    it('состояние забывает вход, которого приёмник больше не принимает', async () => {
        store.signIn({ name: 'owner', password: 'right' });
        http.expectOne('/api/auth/login').flush(SESSION);

        expect(store.signedIn()).toBe(true);

        const arrived: Promise<unknown> = arrival();

        refuse(LIST_PATH, 401);
        await arrived;

        expect(store.signedIn()).toBe(false);
    });

    it('отказ доезжает до того, кто ждал груза, а не гасится уводом', async () => {
        let refused: number = 0;

        const arrived: Promise<unknown> = arrival();

        client.get(LIST_PATH).subscribe({ error: (): void => void (refused += 1) });
        http.expectOne(LIST_PATH).flush('', { status: 401, statusText: 'Unauthorized' });
        await arrived;

        expect(refused).toBe(1);
    });

    it('вопрос «кто вошёл» отказом на вход не уводит: его ждёт сам экран входа', async () => {
        const asked: Observable<unknown> = client.get(SESSION_PATH);

        asked.subscribe({ error: (): void => undefined });
        http.expectOne(SESSION_PATH).flush('', { status: 401, statusText: 'Unauthorized' });
        await settled();

        expect(router.url).toBe('/postmortems?page=2');
    });

    it('прочие отказы чтения человека с экрана не уводят', async () => {
        refuse(LIST_PATH, 500);
        await settled();

        expect(router.url).toBe('/postmortems?page=2');
    });

    it('второй отказ вдогонку не переписывает, куда человек шёл', async () => {
        const arrived: Promise<unknown> = arrival();

        refuse(LIST_PATH, 401);
        await arrived;

        const first: string = router.url;

        expect(first).toContain(`/${SIGN_IN_PATH}`);

        refuse(LIST_PATH, 401);
        await settled();

        expect(router.url).toBe(first);
    });

    it('удачное чтение перехватчик не трогает', () => {
        let answered: unknown = null;

        client.get(LIST_PATH).subscribe((body: unknown): void => void (answered = body));

        const request: TestRequest = http.expectOne(LIST_PATH);

        request.flush({ rows: [], total: 0, page: 1, size: 20 });

        expect(answered).toEqual({ rows: [], total: 0, page: 1, size: 20 });
        expect(router.url).toBe('/postmortems?page=2');
    });
});
