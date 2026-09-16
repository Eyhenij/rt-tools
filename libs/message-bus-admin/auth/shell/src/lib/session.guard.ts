import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { IAdminSession, RETURN_TO_PARAM, SIGN_IN_PATH } from '@rt/message-bus-admin/auth/util';
import { map, Observable, of } from 'rxjs';

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
