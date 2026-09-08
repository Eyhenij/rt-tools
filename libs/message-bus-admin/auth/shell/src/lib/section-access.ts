import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { ADMIN_MENU, IAdminMenuItem } from '@rt/message-bus-admin/common/container/util';

/**
 * Доступ к разделу по праву его пункта меню.
 *
 * Право берётся из объявления пункта, а не из своего списка рядом с маршрутами: пункт уже несёт
 * адрес, и второе объявление той же связи разошлось бы с первым молча — вышло бы «пункта не
 * видно, а страница открывается».
 *
 * Стоит проверка на детях закрытой ветки, а не на ней самой: страж ветки отрабатывает раз на
 * загрузку страницы и переходов между разделами не видит, а право может быть снято посреди
 * работы.
 *
 * Лежит рядом со стражем входа, а не рядом с оболочкой: оболочка грузится по требованию, и
 * маршруты, назвавшие её статически, это теряют. Оба стража закрытой ветки — здесь.
 */

/** Пункт, которому принадлежит адрес. Адрес панели подробностей лежит внутри адреса раздела. */
function itemOf(url: string): IAdminMenuItem | undefined {
    const path: string = url.split('?')[0].split('#')[0];

    return ADMIN_MENU.find((item: IAdminMenuItem): boolean => path === item.path || path.startsWith(`${item.path}/`));
}

/**
 * Первый открытый вошедшему раздел.
 *
 * Пока ответ о вошедшем не приехал, права неизвестны, а не пусты, и первым оказывается первый по
 * списку — тот же, что и прежде. Открытых нет ни одного — адреса нет: корень остаётся на месте, и
 * оболочка показывает, что доступа нет.
 */
export function firstOpenSectionPath(): string {
    const store: AuthStore = inject(AuthStore);
    const open: IAdminMenuItem | undefined = ADMIN_MENU.find((item: IAdminMenuItem): boolean => store.allows(item.right));

    return open?.path ?? '';
}

/**
 * Пускает в раздел того, у кого есть право его читать.
 *
 * Адрес, за которым не стоит ни один пункт меню, эта проверка не судит вовсе: он закрыт стражем
 * входа, как и был.
 */
// eslint-disable-next-line sonarjs/function-return-type -- гард маршрута отвечает каркасу либо согласием, либо адресом ухода: это его договорённость, а не два разных ответа
export const sectionRightGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
    const store: AuthStore = inject(AuthStore);
    const router: Router = inject(Router);
    const item: IAdminMenuItem | undefined = itemOf(state.url);

    if (!item || store.allows(item.right)) {
        return true;
    }

    const open: string = firstOpenSectionPath();

    // Открытых разделов нет ни одного: уводить некуда, и переход просто не состоится — оболочка
    // на его месте показывает, что доступа нет. Увод на корень здесь закрутил бы переадресацию.
    return open === '' ? false : router.createUrlTree([open]);
};
