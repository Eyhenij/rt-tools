import { Route } from '@angular/router';
import { adminTabTitle } from '@rt/message-bus-admin/common/core/util';
import { INVITE_CREATE_ROUTE } from '@rt/message-bus-admin/invites/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const INVITES_ROUTE: string = 'invites';

/**
 * Маршруты раздела приглашений.
 *
 * Маршрута два: список и панель создания. Панели подробностей у приглашения нет — всё, что о
 * нём известно, стоит в строке списка, а самого кода нет ни там, ни в хранилище; панель создания
 * же показывает код один раз, сразу после выдачи. Настройку столбцов раздел получает тем же
 * порядком, что и соседи, — объявлением рядом с маршрутами приложения.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает ни одного экрана, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const invitesRoutes: Route[] = [
    {
        path: INVITES_ROUTE,
        title: adminTabTitle('sectionInvites'),
        loadComponent: async () => (await import('@rt/message-bus-admin/invites/feature/list')).AdminInvitesListComponent,
    },
    {
        // Адрес панели называет раздел, потому что аутлет один на всю админку: без раздела в
        // адресе панели разных разделов делили бы один адрес. На месте признака записи стоит
        // слово создания — записи, которую панель заводит, ещё нет
        path: `${INVITES_ROUTE}/${INVITE_CREATE_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/invites/feature/create-aside')).AdminInviteCreateAsideComponent,
    },
];
