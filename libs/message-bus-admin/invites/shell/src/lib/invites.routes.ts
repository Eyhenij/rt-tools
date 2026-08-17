import { Route } from '@angular/router';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const INVITES_ROUTE: string = 'invites';

/**
 * Маршруты раздела приглашений.
 *
 * Маршрут один: панели подробностей у приглашения нет — всё, что о нём известно, стоит в строке
 * списка, а самого кода нет ни на экране, ни в хранилище. Настройку столбцов раздел получает
 * тем же порядком, что и соседи, — объявлением рядом с маршрутами приложения.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает ни одного экрана, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const invitesRoutes: Route[] = [
    {
        path: INVITES_ROUTE,
        title: adminLabel('sectionInvites'),
        loadComponent: async () => (await import('@rt/message-bus-admin/invites/feature/list')).AdminInvitesListComponent,
    },
];
