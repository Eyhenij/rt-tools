import { ISideMenu } from './side-menu.types';

/**
 * Отбор пунктов подменю по подстроке подписи.
 *
 * Считается здесь, а не в шаблоне: разметка меню держит две раскладки разом, и ветвление отбора
 * в ней читается хуже вызова.
 */
export function filterSubMenuItems(items: ReadonlyArray<ISideMenu.Item>, query: string): ISideMenu.Item[] {
    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [...items];
    }

    return items.filter((item: ISideMenu.Item): boolean => !!item.name?.toLowerCase().includes(needle));
}
