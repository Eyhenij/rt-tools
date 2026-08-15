import { Route } from '@angular/router';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const POSTMORTEMS_ROUTE: string = 'postmortems';

/**
 * Маршруты раздела разборов происшествий.
 *
 * Панель подробностей — ребёнок списка в аутлете `ro`: так она переживает перезагрузку,
 * передаётся ссылкой и попадает в историю браузера, а закрытая возвращает список тем же, каким
 * он был, — выборка лежит в том же адресе.
 *
 * Экраны приезжают отложенной загрузкой: приложение не знает ни одного из них, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const postmortemsRoutes: Route[] = [
    {
        path: POSTMORTEMS_ROUTE,
        title: adminLabel('sectionPostmortems'),
        loadComponent: async () => (await import('@rt/message-bus-admin/postmortems/feature/list')).AdminPostmortemsListComponent,
        children: [
            {
                path: ':id',
                outlet: 'ro',
                loadComponent: async () =>
                    (await import('@rt/message-bus-admin/postmortems/feature/details-aside')).AdminPostmortemDetailsAsideComponent,
            },
        ],
    },
];
