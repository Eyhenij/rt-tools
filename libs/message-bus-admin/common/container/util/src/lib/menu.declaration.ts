import { IRtIcon } from '@rt-tools/ui-kit-v2';

/** Пункт меню админки: что показать, куда вести и чем нарисовать. */
export interface IAdminMenuItem {
    readonly title: string;
    readonly path: string;
    readonly icon: IRtIcon.Name;
}

/**
 * Меню админки объявлением, а не разметкой.
 *
 * Пункт заводится вместе со своим экраном и в одном месте: собранное разметкой меню расходится с
 * маршрутами молча — пункт остаётся, экран уезжает, и человек попадает в пустоту.
 *
 * Разделов груза три, и приходят они по одному со своими задачами: пункта без экрана здесь не
 * бывает.
 */
export const ADMIN_MENU: readonly IAdminMenuItem[] = Object.freeze([
    { title: 'Разборы происшествий', path: '/postmortems', icon: 'list' } as const,
]);
