import { InjectionToken, Signal } from '@angular/core';

/**
 * Меню, в котором стоит подпункт. Токен вместо самого компонента: подпункт брал его классом, а
 * меню объявляет подпункт в своих импортах — получался круг «меню → подпункт → меню».
 *
 * Подпункту нужно от меню три значения: какие пункты сейчас отмечены активными, какие папки стоят
 * раскрытыми и что набрано в поиске — последнее затем, чтобы отметить в подписи то, чем она совпала.
 *
 * Активность и раскрытость разошлись, когда поиск научился спускаться внутрь папок: активным
 * остаётся адрес, на котором человек стоит, а раскрытой — всякая папка, в которой нашлось
 * совпадение. Одно значение на двоих раскрывало бы только папку текущего адреса, то есть прятало бы
 * ровно то, что человек искал.
 */
export interface IRtuiSideMenuHost {
    /** Пункты полосы: блок избранного ищет в их подменю пункты, стоящие за номерами списка. */
    readonly menuItems: Signal<ISideMenu.Item[]>;
    readonly activeMenuIds: Signal<Array<string | number>>;
    /**
     * Набор, который подменю показывает сейчас, до отбора поиском: пустой, пока подменю нечего
     * показать. По нему блок избранного и звёзды узнают свой пункт полосы.
     */
    readonly shownSubMenu: Signal<ISideMenu.Item[]>;
    readonly expandedMenuIds: Signal<Array<string | number>>;
    readonly highlightedMenuId: Signal<string | number | null>;
    readonly subMenuQuery: Signal<string>;
}

export const RTUI_SIDE_MENU: InjectionToken<IRtuiSideMenuHost> = new InjectionToken<IRtuiSideMenuHost>('RTUI_SIDE_MENU');

export namespace ISideMenu {
    export type ItemData = string | number | object;

    /**
     * Чем подменю держится открытым: наведением, как было всегда, или закреплением — тогда оно
     * стоит открытым, пока человек сам его не свернёт.
     */
    export type SubMenuMode = 'hover' | 'pinned';

    /** Номер пункта в списке избранного — тот же, что `id` пункта меню. */
    export type FavoriteId = Item['id'];

    export interface Item {
        id: string | number;

        icon?: string;
        name?: string;
        link?: string;
        submenu?: Item[];
        /** Избранное в подменю этого пункта полосы. По умолчанию выключено. */
        favorites?: boolean;
        iconButton?: {
            icon: string;
            data?: ItemData;
        };
    }
}
