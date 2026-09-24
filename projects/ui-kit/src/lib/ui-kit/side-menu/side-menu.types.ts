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
    /** Номер меню, под которым лежат его настройки: избранное читается и пишется по нему. */
    readonly menuId: Signal<string>;
    /** Указатель ушёл с панели; без пункта — то же, что уход мышью. */
    toggleSubMenu(item?: ISideMenu.Item): void;
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

    /**
     * Настройки одного меню под его номером в хранилище. Незнакомые поля кит не удаляет: их могло
     * положить приложение или следующая версия кита.
     */
    /**
     * Место под скрытые кнопки строки: `always` — кнопка, ждущая наведения, держит свою ширину;
     * `none` — в покое ширины не занимает, и подпись идёт до края.
     */
    export type FavoriteActionsReserve = 'always' | 'none';

    export interface Settings {
        favorites?: FavoriteId[];
        /** Пункты полосы, чей блок избранного свёрнут; блок по умолчанию развёрнут. */
        favoritesCollapsed?: Array<Item['id']>;
        subMenuMode?: SubMenuMode;
        subMenuWidth?: number;
        [field: string]: unknown;
    }

    export interface Item {
        id: string | number;

        icon?: string;
        name?: string;
        link?: string;
        submenu?: Item[];
        /** Избранное в подменю этого пункта полосы. По умолчанию выключено. */
        favorites?: boolean;
        /**
         * Пункт со ссылкой, который в избранное не ставится: своя страница раздела, дашборд,
         * действие «Создать». Звезды у него нет, и номер, сохранённый раньше, в блок не попадает.
         */
        favoriteDisabled?: boolean;
        iconButton?: {
            icon: string;
            data?: ItemData;
        };
    }
}
