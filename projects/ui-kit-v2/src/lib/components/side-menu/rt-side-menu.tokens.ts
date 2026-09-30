import { InjectionToken, Signal } from '@angular/core';

import { IRtSideMenu } from './rt-side-menu.model';

/**
 * Меню, в котором стоит подпункт. Токен вместо самого компонента: меню объявляет подпункт в своих
 * импортах, и прямая ссылка замкнула бы круг «меню → подпункт → меню».
 *
 * Активность и раскрытость — два значения: активным остаётся адрес, на котором человек стоит, а
 * раскрытой — всякая папка, в которой нашлось совпадение.
 */
export interface IRtSideMenuHost {
    readonly activeMenuIds: Signal<ReadonlyArray<string | number>>;
    readonly expandedMenuIds: Signal<ReadonlyArray<string | number>>;
    readonly highlightedMenuId: Signal<string | number | null>;
    readonly subMenuQuery: Signal<string>;
    /** Раскрыть или свернуть папку нажатием её заголовка. */
    toggleFolder(item: IRtSideMenu.Item): void;
}

export const RT_SIDE_MENU: InjectionToken<IRtSideMenuHost> = new InjectionToken<IRtSideMenuHost>('RT_SIDE_MENU');
