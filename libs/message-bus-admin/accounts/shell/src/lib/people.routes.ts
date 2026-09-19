import { Route } from '@angular/router';
import { PERSON_ACCESS_ROUTE, PERSON_CREATE_ROUTE, PERSON_PASSWORD_ROUTE } from '@rt/message-bus-admin/accounts/util';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const PEOPLE_ROUTE: string = 'people';

/**
 * Маршруты раздела людей.
 *
 * Маршрутов четыре: список, панель заведения, панель нового пароля и панель прав. Панели
 * подробностей у человека нет — всё, что о нём известно, стоит в строке списка; все панели правят,
 * а не показывают. Отключение панели не имеет: ему нечего спрашивать, и оно живёт меню строки. Настройку столбцов
 * раздел получает тем же порядком, что и соседи, — объявлением рядом с маршрутами приложения.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает ни одного экрана, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const peopleRoutes: Route[] = [
    {
        path: PEOPLE_ROUTE,
        title: adminTabTitle('sectionPeople'),
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/list')).AdminPeopleListComponent,
    },
    {
        // Адрес панели называет раздел, потому что аутлет один на всю админку: без раздела в
        // адресе панели разных разделов делили бы один адрес. На месте признака записи стоит
        // слово заведения — записи, которую панель заводит, ещё нет
        path: `${PEOPLE_ROUTE}/${PERSON_CREATE_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/create-aside')).AdminPersonCreateAsideComponent,
    },
    {
        // Признак записи здесь — её имя: им человек входит, и оно же стоит в строке списка.
        // Второй сегмент называет сторону записи, которую панель правит
        path: `${PEOPLE_ROUTE}/:id/${PERSON_PASSWORD_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () =>
            (await import('@rt/message-bus-admin/accounts/feature/password-aside')).AdminPersonPasswordAsideComponent,
    },
    {
        // Права записи: роль и точечные правки. Закрыта правом на роли, а не на правку людей, —
        // тем же, что и раздел ролей; пункт меню строки рисуется по нему же
        path: `${PEOPLE_ROUTE}/:id/${PERSON_ACCESS_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/access-aside')).AdminPersonAccessAsideComponent,
    },
];
