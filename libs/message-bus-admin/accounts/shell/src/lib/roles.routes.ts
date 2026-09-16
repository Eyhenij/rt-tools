import { Route } from '@angular/router';
import { ROLE_CREATE_ROUTE } from '@rt/message-bus-admin/accounts/util';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const ROLES_ROUTE: string = 'roles';

/**
 * Маршруты раздела ролей.
 *
 * Маршрутов три: список, панель заведения и панель роли. Обе панели — один компонент: у роли нет
 * подробностей сверх строки, и панель её правит; в адресе заведения на месте ключа стоит слово
 * заведения, и основа панели ставит режим заведения по отсутствию ключа. Настройку столбцов
 * раздел получает тем же порядком, что и соседи, — объявлением рядом с маршрутами приложения.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает ни одного экрана, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const rolesRoutes: Route[] = [
    {
        path: ROLES_ROUTE,
        title: adminLabel('sectionRoles'),
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/roles-list')).AdminRolesListComponent,
    },
    {
        // Раньше маршрута с ключом: иначе слово заведения досталось бы ему ключом роли
        path: `${ROLES_ROUTE}/${ROLE_CREATE_ROUTE}`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/role-aside')).AdminRoleAsideComponent,
    },
    {
        path: `${ROLES_ROUTE}/:id`,
        pathMatch: 'full',
        outlet: 'ro',
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/role-aside')).AdminRoleAsideComponent,
    },
];
