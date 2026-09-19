import { Route } from '@angular/router';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const USAGE_ROUTE: string = 'usage';

/**
 * Маршруты раздела использования правил.
 *
 * Панель сессий — сосед списка в аутлете `ro`, а не его ребёнок: рисует её правая шторка
 * оболочки, а объявлена шторка у каркаса. Адрес панели несёт раздел и скил, и панель так же
 * переживает перезагрузку, передаётся ссылкой и попадает в историю браузера, а закрытая
 * возвращает список тем же, каким он был, — выборка лежит в том же адресе.
 *
 * Экраны приезжают отложенной загрузкой: приложение не знает ни одного из них.
 */
export const usageRoutes: Route[] = [
    {
        path: USAGE_ROUTE,
        title: adminTabTitle('sectionUsage'),
        loadComponent: async () => (await import('@rt/message-bus-admin/usage/feature/list')).AdminUsageListComponent,
    },
    {
        // Адрес панели называет раздел, потому что аутлет один на всю админку. Совпадение полное
        // — иначе роутер не разбирает адрес из двух сегментов в аутлете.
        path: `${USAGE_ROUTE}/:skill`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/usage/feature/sessions-aside')).AdminUsageSessionsAsideComponent,
    },
];
