import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ESignInFault, IAdminSession } from '@rt/message-bus-admin/auth/util';

import { AuthStore } from './auth.store';

const LOGIN_PATH: string = '/api/auth/login';
const LOGOUT_PATH: string = '/api/auth/logout';
const SESSION_PATH: string = '/api/auth/session';

const SESSION: IAdminSession = { name: 'owner' };

describe('AuthStore', () => {
    let store: AuthStore;
    let http: HttpTestingController;

    /** Вход парой: спека отвечает за приёмник тем, чем сказано. */
    function signIn(): TestRequest {
        store.signIn({ name: 'owner', password: 'right' });

        return http.expectOne(LOGIN_PATH);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

        store = TestBed.inject(AuthStore);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
        TestBed.resetTestingModule();
    });

    it('годная пара делает человека вошедшим', () => {
        signIn().flush(SESSION);

        expect(store.signedIn()).toBe(true);
        expect(store.session()).toEqual(SESSION);
        expect(store.fault()).toBeNull();
    });

    it('вход идёт с кукой: без неё приёмник не узнаёт вошедшего', () => {
        const request: TestRequest = signIn();

        expect(request.request.withCredentials).toBe(true);
        request.flush(SESSION);
    });

    it('неверная пара оставляет невошедшим и называет род отказа', () => {
        signIn().flush('', { status: 401, statusText: 'Unauthorized' });

        expect(store.signedIn()).toBe(false);
        expect(store.fault()).toBe(ESignInFault.Pair);
    });

    it('вторая попытка поверх идущей приёмника не тревожит', () => {
        const first: TestRequest = signIn();

        store.signIn({ name: 'owner', password: 'again' });
        http.expectNone(LOGIN_PATH);
        first.flush(SESSION);

        expect(store.signedIn()).toBe(true);
    });

    it('вход переживает перезагрузку: кто вошёл, спрашивается у приёмника', () => {
        store.restore().subscribe();
        http.expectOne(SESSION_PATH).flush(SESSION);

        expect(store.signedIn()).toBe(true);
    });

    it('«не вошёл» — законный ответ, а не поломка работы', () => {
        let asked: IAdminSession | null = SESSION;

        store.restore().subscribe((session: IAdminSession | null): void => void (asked = session));
        http.expectOne(SESSION_PATH).flush('', { status: 401, statusText: 'Unauthorized' });

        expect(asked).toBeNull();
        expect(store.signedIn()).toBe(false);
    });

    it('выход обрывает вход у приёмника и в состоянии', () => {
        signIn().flush(SESSION);
        store.signOut().subscribe();
        http.expectOne(LOGOUT_PATH).flush(null);

        expect(store.signedIn()).toBe(false);
    });

    it('забытый вход приёмника не тревожит: это он и сказал, что входа больше нет', () => {
        signIn().flush(SESSION);
        store.forget();

        expect(store.signedIn()).toBe(false);
        expect(store.session()).toBeNull();
        http.expectNone(LOGOUT_PATH);
    });
});
