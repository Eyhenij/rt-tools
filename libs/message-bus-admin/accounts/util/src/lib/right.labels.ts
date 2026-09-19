/**
 * Права словами: раздел и действие, сгруппированные по разделам.
 *
 * Имя права — пара «раздел:действие» из закрытого набора, и человеку она не показывается: он
 * читает раздел так, как тот называется в шапке, и действие словом. Подписи разделов берутся из
 * тех же ключей словаря, что и шапка: написанные здесь заново, они разошлись бы с ней молча.
 *
 * Порядок групп — порядок разделов в шапке; внутри группы чтение стоит раньше правки.
 *
 * Словарь приходит доводом: функции чистые и каркаса не знают, а взятый ими текст иначе приходил
 * бы на языке той минуты, когда файл загрузился.
 */
import { TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { RIGHTS, TRight } from '@rt/message-bus-common';

/** Группа прав одного раздела: подпись раздела и его права по порядку. */
export interface IRightGroup {
    readonly section: string;
    readonly rights: readonly IRightOption[];
}

/** Одно право с подписью: показывается ею в панели роли и в панели прав человека. */
export interface IRightOption {
    readonly right: TRight;
    /** Действие словом: «чтение», «правка». */
    readonly action: string;
    /** Раздел и действие вместе: так право стоит в строке списка ролей. */
    readonly label: string;
}

/** Ключ словаря с подписью раздела по ресурсу права. Набор закрыт, как и набор прав. */
const SECTION_LABEL_KEY: Readonly<Record<string, TAdminLabelKey>> = {
    postmortems: 'sectionPostmortems',
    proposals: 'sectionProposals',
    summaries: 'sectionSummaries',
    usage: 'sectionUsage',
    invites: 'sectionInvites',
    accounts: 'sectionPeople',
    roles: 'sectionRoles',
};

/** Ключ словаря со словом действия. */
const ACTION_LABEL_KEY: Readonly<Record<string, TAdminLabelKey>> = {
    read: 'rightRead',
    manage: 'rightManage',
};

/** Подпись раздела по имени права. */
function sectionOf(right: TRight, text: TAdminText): string {
    const [resource]: string[] = right.split(':');

    return text(SECTION_LABEL_KEY[resource] ?? 'sectionRoles');
}

/** Слово действия по имени права. */
function actionOf(right: TRight, text: TAdminText): string {
    const [, action]: string[] = right.split(':');

    return text(ACTION_LABEL_KEY[action] ?? 'rightRead');
}

/** Право с подписями: раздел и действие. */
export function rightOption(right: TRight, text: TAdminText): IRightOption {
    const action: string = actionOf(right, text);

    return { right, action, label: `${sectionOf(right, text)} — ${action}` };
}

/**
 * Все права набора по разделам, в порядке набора.
 *
 * Считается от закрытого набора, а не перечислено здесь: право, появившееся в наборе, встаёт в
 * панель само, а перечисленное здесь заново отстало бы от набора молча.
 */
export function rightGroups(text: TAdminText): readonly IRightGroup[] {
    const groups: IRightGroup[] = [];

    RIGHTS.forEach((right: TRight): void => {
        const section: string = sectionOf(right, text);
        const option: IRightOption = rightOption(right, text);
        const group: IRightGroup | undefined = groups.find((one: IRightGroup): boolean => one.section === section);

        if (group) {
            groups[groups.indexOf(group)] = { section, rights: [...group.rights, option] };
        } else {
            groups.push({ section, rights: [option] });
        }
    });

    return groups;
}

/** Права словами через запятую. Пусто — слово об этом, а не пустая строка. */
export function rightsLabel(rights: readonly TRight[], text: TAdminText): string {
    return rights.length === 0 ? text('roleRightsNone') : rights.map((right: TRight): string => rightOption(right, text).label).join(', ');
}
