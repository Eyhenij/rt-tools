import { InjectionToken, Signal } from '@angular/core';

/**
 * Меню, в котором стоит подпункт. Токен вместо самого компонента: подпункт брал его классом, а
 * меню объявляет подпункт в своих импортах — получался круг «меню → подпункт → меню».
 *
 * Подпункту нужно от меню одно: какие пункты сейчас раскрыты.
 */
export interface IRtuiSideMenuHost {
    readonly activeMenuIds: Signal<Array<string | number>>;
}

export const RTUI_SIDE_MENU: InjectionToken<IRtuiSideMenuHost> = new InjectionToken<IRtuiSideMenuHost>('RTUI_SIDE_MENU');

export namespace ISideMenu {
    export type ItemData = string | number | object;

    /**
     * Чем подменю держится открытым: наведением, как было всегда, или закреплением — тогда оно
     * стоит открытым, пока человек сам его не свернёт.
     */
    export type SubMenuMode = 'hover' | 'pinned';

    export interface Item {
        id: string | number;

        icon?: string;
        name?: string;
        link?: string;
        submenu?: Item[];
        iconButton?: {
            icon: string;
            data?: ItemData;
        };
    }
}
