import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { TRight } from '@rt/message-bus-common';
import { IRtIcon } from '@rt-tools/ui-kit-v2';

/**
 * Пункт меню админки: что показать, куда вести, чем нарисовать и каким правом он закрыт.
 *
 * Право стоит здесь, а не у маршрута: пункт уже несёт адрес, и страж читает право отсюда же.
 * Второе объявление той же связи разошлось бы с первым молча, и вышло бы «пункта не видно, а
 * страница открывается».
 *
 * Имя права берётся из закрытого набора общей либы — того же, которым приёмник закрывает свои
 * операции. Свой список имён в админке разошёлся бы с набором приёмника молча.
 */
export interface IAdminMenuItem {
    readonly title: string;
    readonly path: string;
    readonly icon: IRtIcon.Name;
    readonly right: TRight;
}

/**
 * Меню админки объявлением, а не разметкой.
 *
 * Пункт заводится вместе со своим экраном и в одном месте: собранное разметкой меню расходится с
 * маршрутами молча — пункт остаётся, экран уезжает, и человек попадает в пустоту.
 *
 * Разделов груза три, и приходят они по одному со своими задачами: пункта без экрана здесь не
 * бывает. Четвёртый пункт груза не показывает вовсе — приглашения заводят сами деревья, и
 * стоит он последним по той же причине: человек ходит в него реже остальных.
 *
 * Подпись пункта идёт из словаря, а не литералом: тем же ключом называет себя заголовок экрана
 * и заголовок вкладки браузера, и написанная здесь заново она расходится с ними молча.
 */
export const ADMIN_MENU: readonly IAdminMenuItem[] = Object.freeze([
    { title: adminLabel('sectionPostmortems'), path: '/postmortems', icon: 'list', right: 'postmortems:read' } as const,
    { title: adminLabel('sectionProposals'), path: '/proposals', icon: 'comments', right: 'proposals:read' } as const,
    { title: adminLabel('sectionSummaries'), path: '/summaries', icon: 'chart-bar', right: 'summaries:read' } as const,
    { title: adminLabel('sectionUsage'), path: '/usage', icon: 'chart-line', right: 'usage:read' } as const,
    { title: adminLabel('sectionInvites'), path: '/invites', icon: 'ico-invite', right: 'invites:read' } as const,
]);
