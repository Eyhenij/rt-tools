import { isKitIconName, materialPairOf } from '../icon/rt-icon-glyph.logic';
import { IRtIcon } from '../icon/rt-icon.model';
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
 * Имена значков меню, о которых оно должно предупредить: ни имени кита, ни пары в перечне. Значок
 * пункта закрывает свой шаблон меню; значок кнопки строки шаблона не берёт и предупреждает всегда.
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
            // Кнопка строки своего шаблона не берёт: имя без значка кита оставляет её пустой при любом меню.
            if (item.iconButton?.icon && sideMenuIconName(item.iconButton.icon) === null) {
                found.add(item.iconButton.icon);
            }
            walk(item.submenu ?? []);
        }
    };
    walk(items);

    return [...found];
}
