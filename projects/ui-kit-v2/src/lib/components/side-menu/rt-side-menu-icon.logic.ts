import { kitNameOf } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtSideMenu } from './rt-side-menu.model';

/**
 * Значок пункта по его `icon`, равному имени кита. `null` — кит такой значок не рисует: пункт берёт
 * свой шаблон меню или стоит без значка.
 */
export function sideMenuIconName(icon: string | undefined): IRtIcon.Name | null {
    return kitNameOf(icon);
}

/**
 * Имена значков меню, о которых оно должно предупредить: это не имена кита. И значок
 * пункта, и значок кнопки строки закрывает свой шаблон меню.
 * Без предупреждения такой значок пуст, и пропуск не заметен. Обходит пункты на любую глубину;
 * каждое имя — один раз.
 */
export function unpairedSideMenuIcons(items: ReadonlyArray<IRtSideMenu.Item>, hasOwnIcon: boolean): string[] {
    const found: Set<string> = new Set<string>();
    const walk: (list: ReadonlyArray<IRtSideMenu.Item>) => void = (list: ReadonlyArray<IRtSideMenu.Item>): void => {
        for (const item of list) {
            if (!hasOwnIcon && item.icon && sideMenuIconName(item.icon) === null) {
                found.add(item.icon);
            }
            if (!hasOwnIcon && item.iconButton?.icon && sideMenuIconName(item.iconButton.icon) === null) {
                found.add(item.iconButton.icon);
            }
            walk(item.submenu ?? []);
        }
    };
    walk(items);

    return [...found];
}

/**
 * Предупреждение разработчику приложения об именах из `unpairedSideMenuIcons`: имя, которого нет в
 * наборе кита, рисует пункт без значка, и пропуск без предупреждения не заметен.
 */
export function warnUnpairedSideMenuIcons(menuId: string, items: ReadonlyArray<IRtSideMenu.Item>, hasOwnIcon: boolean): void {
    const unpaired: string[] = unpairedSideMenuIcons(items, hasOwnIcon);

    if (unpaired.length) {
        const names: string = unpaired.map((name: string): string => `«${name}»`).join(', ');
        // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
        console.warn(
            `rt-side-menu «${menuId}»: значков ${names} нет в наборе кита. ` +
                'Задайте имя кита или свой значок через <ng-template rtSideMenuIcon>.'
        );
    }
}
