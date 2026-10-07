import { WritableSignal } from '@angular/core';
import { TNullable } from '@rt-tools/utils';

import { ISideMenu } from '../side-menu.types';

/** Выбор меню, который переставляет нажатие пункта полосы при закреплённом подменю. */
export interface IPinnedPickTarget {
    selectedItem: WritableSignal<TNullable<ISideMenu.Item>>;
    selectedSubMenu: WritableSignal<TNullable<ISideMenu.Item[]>>;
    subMenuQuery: WritableSignal<string>;
}

/**
 * Нажат пункт полосы, пока подменю закреплено. Наведение здесь по-прежнему не делает ничего:
 * рука идёт вдоль полосы к подвалу и к самой панели, и переставленное наведением подменю
 * мелькало бы разделами по дороге. Нажатие — выбор человека, и для раздела без своего адреса
 * это единственный способ его открыть.
 *
 * Пункт со своим адресом и без разделов выбор снимает: человек ушёл на страницу, разделов у
 * которой нет, и оставленная от прежнего раздела панель врала бы о том, где он стоит.
 *
 * Лежит отдельно от меню, как тяга и ходьба с клавиатуры рядом: файл меню упёрся в предел длины.
 */
export function pickPinnedSubMenu(menu: IPinnedPickTarget, item: ISideMenu.Item): void {
    if (item?.submenu?.length) {
        menu.selectedItem.set(item);
        menu.selectedSubMenu.set(item.submenu);
        menu.subMenuQuery.set('');
    } else if (item?.link) {
        menu.selectedItem.set(null);
        menu.selectedSubMenu.set(null);
        menu.subMenuQuery.set('');
    } else {
        // Пункт без разделов и без своего адреса: нажимать в нём нечего, и выбор остаётся прежним.
    }
}
