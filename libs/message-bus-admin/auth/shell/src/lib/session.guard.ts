import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { IAdminSession } from '@rt/message-bus-admin/auth/util';
import { map, Observable, of } from 'rxjs';

/** Адрес экрана входа. Один на всё приложение: сюда уводит и гвард, и выход. */
export const SIGN_IN_PATH: string = 'sign-in';

/**
 * Куда человек шёл, когда его отправили на вход. Читается экраном входа после успеха, поэтому
 * имя параметра названо здесь, а не повторено строкой в обоих местах.
 */
export const RETURN_TO_PARAM: string = 'returnTo';

/**
 * Пускает вошедшего и уводит на вход остальных.
 *
 * Вошедшего гвард узнаёт у приёмника, а не по памяти вкладки: вход живёт кукой и переживает
 * перезагрузку. Спрашивается приёмник один раз — дальше отвечает состояние стора, иначе каждый
 * переход между разделами стоил бы запроса.
 */
export const sessionGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
    const store: AuthStore = inject(AuthStore);
    const router: Router = inject(Router);

    const asked: Observable<IAdminSession | null> = store.signedIn() ? of(store.session()) : store.restore();

    return asked.pipe(
        // eslint-disable-next-line sonarjs/function-return-type -- гард маршрута отвечает каркасу либо согласием, либо адресом ухода: это его договорённость, а не два разных ответа
        map((session: IAdminSession | null): boolean | UrlTree => {
            if (session !== null) {
                return true;
            }

            return router.createUrlTree([SIGN_IN_PATH], { queryParams: { [RETURN_TO_PARAM]: state.url } });
        })
    );
};
