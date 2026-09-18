import { Route } from '@angular/router';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const POSTMORTEMS_ROUTE: string = 'postmortems';

/**
 * Маршруты раздела разборов происшествий.
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
export const postmortemsRoutes: Route[] = [
    {
        path: POSTMORTEMS_ROUTE,
        title: adminTabTitle('sectionPostmortems'),
        loadComponent: async () => (await import('@rt/message-bus-admin/postmortems/feature/list')).AdminPostmortemsListComponent,
    },
    {
        // Адрес панели называет раздел, потому что аутлет один на всю админку: без раздела в
        // адресе первый же объявленный `:id` забрал бы панели всех трёх разделов. Совпадение
        // при этом полное — иначе роутер не разбирает адрес из двух сегментов в аутлете и
        // отвечает «маршрут не найден».
        path: `${POSTMORTEMS_ROUTE}/:id`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () =>
            (await import('@rt/message-bus-admin/postmortems/feature/details-aside')).AdminPostmortemDetailsAsideComponent,
    },
];
