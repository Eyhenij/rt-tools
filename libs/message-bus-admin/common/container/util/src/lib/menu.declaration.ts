import { TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';
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
 *
 * Подпись стоит ключом словаря, а не готовым текстом: текст, взятый здесь, приходит на языке той
 * минуты, когда файл загрузился, и на нём же остаётся до перезагрузки страницы.
 */
export interface IAdminMenuItem {
    readonly title: TAdminLabelKey;
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
 * бывает. Три последних пункта груза не показывают вовсе — приглашения заводят сами деревья,
 * люди входят в приёмник, роли говорят, кому что открыто, — и стоят они в конце по той же
 * причине: человек ходит в них реже остальных.
 *
 * Подпись пункта идёт ключом словаря, а не литералом: тем же ключом называет себя заголовок
 * экрана и заголовок вкладки браузера, и написанная здесь заново она расходится с ними молча.
 * Текст по ключу спрашивает оболочка — на выбранном языке и заново при каждой его смене.
 */
export const ADMIN_MENU: readonly IAdminMenuItem[] = Object.freeze([
    { title: 'sectionPostmortems', path: '/postmortems', icon: 'list', right: 'postmortems:read' } as const,
    { title: 'sectionProposals', path: '/proposals', icon: 'comments', right: 'proposals:read' } as const,
    { title: 'sectionSummaries', path: '/summaries', icon: 'chart-bar', right: 'summaries:read' } as const,
    { title: 'sectionUsage', path: '/usage', icon: 'chart-line', right: 'usage:read' } as const,
    { title: 'sectionChat', path: '/chat', icon: 'comments', right: 'chat:read' } as const,
    { title: 'sectionInvites', path: '/invites', icon: 'ico-invite', right: 'invites:read' } as const,
    { title: 'sectionPeople', path: '/people', icon: 'users', right: 'accounts:read' } as const,
    { title: 'sectionRoles', path: '/roles', icon: 'shield', right: 'roles:manage' } as const,
]);
