import { isKitIconName, materialPairOf } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtSideMenu } from './rt-side-menu.model';

/**
 * Значок пункта по его `icon`: имя кита как есть, имя Material первого кита — его парой из перечня
 * кита, как у `rt-menu-item`. `null` — кит такой значок не рисует: пункт берёт свой шаблон меню или
 * стоит без значка.
 */
export function sideMenuIconName(icon: string | undefined): IRtIcon.Name | null {
    if (!icon) {
        return null;
    }
    if (isKitIconName(icon)) {
        return icon;
    }
    return materialPairOf(icon);
}

/**
 * Имена значков меню, о которых оно должно предупредить: ни имени кита, ни пары в перечне. И значок
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
 * Предупреждение разработчику приложения об именах из `unpairedSideMenuIcons`: имя без значка кита и
 * без пары рисует пункт без значка, и пропуск без предупреждения не заметен.
 */
export function warnUnpairedSideMenuIcons(menuId: string, items: ReadonlyArray<IRtSideMenu.Item>, hasOwnIcon: boolean): void {
    const unpaired: string[] = unpairedSideMenuIcons(items, hasOwnIcon);

    if (unpaired.length) {
        const names: string = unpaired.map((name: string): string => `«${name}»`).join(', ');
        // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
        console.warn(
            `rt-side-menu «${menuId}»: значков ${names} нет ни в наборе кита, ни в перечне имён Material. ` +
                'Задайте имя кита или свой значок через <ng-template rtSideMenuIcon>.'
        );
    }
}
