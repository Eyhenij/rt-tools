import { adminLabel } from '@rt/message-bus-admin/common/core/util';
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
 *
 * Подпись пункта идёт из словаря, а не литералом: тем же ключом называет себя заголовок экрана
 * и заголовок вкладки браузера, и написанная здесь заново она расходится с ними молча.
 */
export const ADMIN_MENU: readonly IAdminMenuItem[] = Object.freeze([
    { title: adminLabel('sectionPostmortems'), path: '/postmortems', icon: 'list' } as const,
    { title: adminLabel('sectionProposals'), path: '/proposals', icon: 'comments' } as const,
    { title: adminLabel('sectionSummaries'), path: '/summaries', icon: 'chart-bar' } as const,
]);
