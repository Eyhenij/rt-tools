import { Route } from '@angular/router';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const SUMMARIES_ROUTE: string = 'summaries';

/**
 * Маршруты раздела сводок деревьев.
 *
 * Панель подробностей — сосед списка в аутлете `ro`, а не его ребёнок: рисует её правая шторка
 * оболочки, а объявлена шторка у каркаса — аутлет, спрятанный внутрь экрана раздела, оставлял бы
 * панель стоять под таблицей. Адрес от этого не теряет ни раздела, ни записи: `ro` несёт их
 * обоих, и панель так же переживает перезагрузку, передаётся ссылкой и попадает в историю
 * браузера, а закрытая возвращает список тем же, каким он был, — выборка лежит в том же адресе.
 *
 * Экраны приезжают отложенной загрузкой: приложение не знает ни одного из них, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const summariesRoutes: Route[] = [
    {
        path: SUMMARIES_ROUTE,
        title: adminTabTitle('sectionSummaries'),
        loadComponent: async () => (await import('@rt/message-bus-admin/summaries/feature/list')).AdminSummariesListComponent,
    },
    {
        // Адрес панели называет раздел, потому что аутлет один на всю админку: без раздела в
        // адресе первый же объявленный `:id` забрал бы панели всех трёх разделов. Совпадение
        // при этом полное — иначе роутер не разбирает адрес из двух сегментов в аутлете и
        // отвечает «маршрут не найден».
        path: `${SUMMARIES_ROUTE}/:id`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () =>
            (await import('@rt/message-bus-admin/summaries/feature/details-aside')).AdminMonthRecordDetailsAsideComponent,
    },
];
