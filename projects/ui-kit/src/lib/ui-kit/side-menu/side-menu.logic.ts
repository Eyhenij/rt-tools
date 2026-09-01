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

/**
 * Ключ, под которым хранится выбор человека.
 *
 * Назван приставкой кита: хранилище браузера общее на весь адрес, и короткое имя вроде `mode`
 * столкнулось бы с ключом потребителя молча — оба пишут в одно место.
 */
export const SUB_MENU_MODE_KEY: string = 'rtui-side-menu-sub-menu-mode';

/**
 * Чтение сохранённого выбора.
 *
 * Мода подменю — настройка человека, а не состояние экрана: она обязана переживать перезагрузку.
 * Хранит её потребитель — кит не знает, где у приложения лежат настройки человека, — а эти две
 * функции дают ему готовый и одинаковый способ, чтобы ключ не расходился от приложения к
 * приложению.
 *
 * Отказ хранилища работу не останавливает: браузер отдаёт его закрытым в приватном окне и при
 * запрете данных сайта, и упавшее чтение оставило бы человека без меню вовсе. Незнакомое значение
 * читается так же, как пустое, — прежней модой.
 */
export function readSubMenuMode(storage: Storage | null): ISideMenu.SubMenuMode {
    if (storage === null) {
        return 'hover';
    }

    try {
        return storage.getItem(SUB_MENU_MODE_KEY) === 'pinned' ? 'pinned' : 'hover';
    } catch {
        return 'hover';
    }
}

/** Запись выбора. Отказ хранилища глушится по той же причине, что и при чтении. */
export function writeSubMenuMode(storage: Storage | null, mode: ISideMenu.SubMenuMode): void {
    if (storage === null) {
        return;
    }

    try {
        storage.setItem(SUB_MENU_MODE_KEY, mode);
    } catch {
        // хранилище закрыто настройками браузера — выбор просто не переживёт перезагрузку
    }
}
