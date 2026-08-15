import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { catchError, Observable, throwError } from 'rxjs';

import { RETURN_TO_PARAM, SIGN_IN_PATH } from './session.guard';

/**
 * Обращения самого входа: их отказ — ответ экрану входа, а не конец сеанса.
 *
 * Неверная пара, невошедший вопрос «кто вошёл» и выход отвечают тем же кодом, что и кончившийся
 * вход, и уводом они превратились бы в круг: экран входа спрашивает приёмника, кто вошёл,
 * получает отказ и уводит сам себя на себя же.
 */
const AUTH_PATH: string = '/api/auth/';

/** Вход кончился по ответу приёмника, а не по часам вкладки: срок держит он. */
const SESSION_OVER: number = 401;

/**
 * Кончившийся вход уводит человека на вход, а не показывает отказ.
 *
 * Вход обрывается посреди работы — просрочен, отозван, выключена учётная запись, — и первым об
 * этом узнаёт не гвард, а обращение к операции: гвард отвечает на переход, а человек в это время
 * стоит на открытом экране и никуда не переходит. Экран без увода показывал бы отказ чтения, у
 * которого нет действия: повтор упирается в тот же отказ, а войти заново неоткуда.
 *
 * Место увода — перехватчик, а не общий слой списка: адрес входа живёт в домене входа, и общему
 * слою границы его не открывают.
 *
 * Отказ идёт дальше по потоку нетронутым: увод — не ответ на запрос, и тот, кто ждал груза,
 * должен узнать, что груза не будет.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const router: Router = inject(Router);
    const store: AuthStore = inject(AuthStore);

    return next(request).pipe(
        catchError((error: unknown): Observable<never> => {
            if (error instanceof HttpErrorResponse && error.status === SESSION_OVER && !request.url.startsWith(AUTH_PATH)) {
                store.forget();

                // Второй отказ, пришедший вдогонку первому, уже уведённого не трогает: иначе
                // «куда шёл» переписалось бы самим адресом входа, и после входа человек попадал
                // бы на него же.
                if (!router.url.startsWith(`/${SIGN_IN_PATH}`)) {
                    void router.navigate([SIGN_IN_PATH], { queryParams: { [RETURN_TO_PARAM]: router.url } });
                }
            }

            return throwError((): unknown => error);
        })
    );
};
