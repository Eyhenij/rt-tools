import { Route } from '@angular/router';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';

/** Адрес раздела. Назван здесь и читается пунктом меню: два объявления разошлись бы молча. */
export const PEOPLE_ROUTE: string = 'people';

/**
 * Маршруты раздела людей.
 *
 * Маршрут один: список. Панели подробностей у человека нет — всё, что о нём известно, стоит в
 * строке списка; панели создания нет тоже — записи заводит команда строки запуска, а не веб.
 * Настройку столбцов раздел получает тем же порядком, что и соседи, — объявлением рядом с
 * маршрутами приложения.
 *
 * Экран приезжает отложенной загрузкой: приложение не знает ни одного экрана, и раздел уезжает
 * из первой отдачи страницы целиком.
 */
export const peopleRoutes: Route[] = [
    {
        path: PEOPLE_ROUTE,
        title: adminLabel('sectionPeople'),
        loadComponent: async () => (await import('@rt/message-bus-admin/accounts/feature/list')).AdminPeopleListComponent,
    },
];
