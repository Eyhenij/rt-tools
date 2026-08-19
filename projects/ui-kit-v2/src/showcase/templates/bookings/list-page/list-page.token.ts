import { forwardRef, InjectionToken, Provider, Type } from '@angular/core';

import { IListPage } from './list-page.model';

/**
 * Экран, который рисует шаблон списка. Токен, а не класс основы: шаблон лежит в основании
 * семейства и о предметной области не знает, а через токен он получает ровно договор
 * {@link IListPage.Host}.
 */
export const APP_LIST_PAGE_HOST: InjectionToken<IListPage.Host> = new InjectionToken<IListPage.Host>('APP_LIST_PAGE_HOST');

/**
 * Объявление экрана шаблону: `providers: [provideListPage(() => BookingsPageComponent)]`.
 *
 * Класс передаётся функцией: аргумент декоратора вычисляется до того, как класс объявлен, и
 * прямая ссылка на него упала бы при загрузке чанка.
 */
export function provideListPage(component: () => Type<IListPage.Host>): Provider {
    return { provide: APP_LIST_PAGE_HOST, useExisting: forwardRef(component) };
}
