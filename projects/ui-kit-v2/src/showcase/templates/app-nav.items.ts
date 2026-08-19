import { IRtPageHeader } from '../../lib/components/page-header/rt-page-header.model';

/**
 * Разделы верхней навигации показа одним объявлением — так же, как их объявляет приложение:
 * из него рисуется меню, и второго объявления рядом с маршрутами нет.
 *
 * Подписи стоят ключами словаря, а не строками: экран берёт их так же, как настоящее
 * приложение, — через transloco. Переводит их обёртка истории, ей же принадлежит и словарь.
 *
 * Раздел, у которого экрана нет, стоит с `disabled`: у показа живой раздел один — заявки, —
 * а остальные показывают, в каких видах бывает сам ряд. Панель второго уровня объявляется
 * колонками: колонка → группа → пункт, и ширину панели кит считает по числу колонок.
 */
export namespace IAppNav {
    /** Пункт ряда или пункт панели второго уровня. */
    export interface Item {
        readonly id: string;
        readonly labelKey: string;
        readonly icon?: NonNullable<IRtPageHeader.Item['icon']>;
        readonly route?: string;
        readonly routerLinkActiveExact?: boolean;
        readonly disabled?: boolean;
        readonly unread?: boolean;
        readonly columns?: ReadonlyArray<Column>;
    }

    /** Колонка панели второго уровня. */
    export interface Column {
        readonly id: string;
        readonly groups: ReadonlyArray<Group>;
    }

    /** Группа пунктов внутри колонки. Без подписи группа идёт без заголовка. */
    export interface Group {
        readonly id: string;
        readonly labelKey?: string;
        readonly icon?: NonNullable<IRtPageHeader.Item['icon']>;
        readonly items: ReadonlyArray<Item>;
    }
}

/** Разделы показа: живой один, остальные показывают формы, в которых бывает пункт ряда. */
export const APP_NAV_ITEMS: ReadonlyArray<IAppNav.Item> = [
    { id: 'dashboard', labelKey: 'navDashboard', icon: 'th-large', route: '/dashboard' },
    { id: 'bookings', labelKey: 'navBookings', icon: 'inbox', route: '/bookings' },
    { id: 'calendar', labelKey: 'navCalendar', icon: 'calendar', route: '/calendar' },
    {
        id: 'guests',
        labelKey: 'navGuests',
        icon: 'users',
        columns: [
            {
                id: 'guests-main',
                groups: [
                    {
                        id: 'guests-base',
                        items: [
                            { id: 'guests-list', labelKey: 'navGuestsList', disabled: true },
                            { id: 'guest-groups', labelKey: 'navGuestGroups', disabled: true },
                        ],
                    },
                ],
            },
        ],
    },
    // Раздел без экрана: пункт стоит недоступным, и кит сам объясняет это подсказкой.
    { id: 'finance', labelKey: 'navFinance', icon: 'wallet', disabled: true },
    {
        id: 'settings',
        labelKey: 'navSettings',
        icon: 'cog',
        columns: [
            {
                id: 'settings-main',
                groups: [
                    {
                        id: 'settings-base',
                        items: [
                            { id: 'properties', labelKey: 'navProperties', disabled: true },
                            { id: 'users', labelKey: 'navUsers', disabled: true },
                            { id: 'roles', labelKey: 'navRoles', disabled: true },
                        ],
                    },
                ],
            },
            {
                id: 'settings-reference',
                groups: [
                    {
                        id: 'settings-directories',
                        labelKey: 'navGroupDirectories',
                        icon: 'book',
                        items: [
                            { id: 'guest-tags', labelKey: 'navGuestTags', disabled: true },
                            { id: 'contractors', labelKey: 'navContractors', disabled: true },
                        ],
                    },
                    {
                        id: 'settings-mail',
                        labelKey: 'navGroupMail',
                        icon: 'email',
                        items: [
                            { id: 'mail-templates', labelKey: 'navMailTemplates', disabled: true },
                            { id: 'mail-sent', labelKey: 'navMailSent', unread: true, disabled: true },
                        ],
                    },
                ],
            },
        ],
    },
];

/** Ключи подписей всех уровней подряд: перевод приходит списком той же длины. */
export function appNavLabelKeysOf(items: ReadonlyArray<IAppNav.Item>): string[] {
    return items.flatMap((item: IAppNav.Item): string[] => [
        item.labelKey,
        ...(item.columns ?? []).flatMap((column: IAppNav.Column): string[] =>
            column.groups.flatMap((group: IAppNav.Group): string[] => [
                ...(group.labelKey === undefined ? [] : [group.labelKey]),
                ...appNavLabelKeysOf(group.items),
            ])
        ),
    ]);
}

/** Как подпись достаётся по ключу: обёртка держит переведённый набор и отдаёт сюда чтение. */
export type TAppNavLabel = (labelKey: string) => string;

/** Декларация переводится в модель кита здесь: словаря кит не знает. */
export function appNavSectionsOf(items: ReadonlyArray<IAppNav.Item>, label: TAppNavLabel): ReadonlyArray<IRtPageHeader.Item> {
    return items.map((item: IAppNav.Item): IRtPageHeader.Item => ({
        id: item.id,
        label: label(item.labelKey),
        icon: item.icon,
        route: item.route,
        routerLinkActiveExact: item.routerLinkActiveExact,
        disabled: item.disabled,
        unread: item.unread,
        columns: item.columns?.map((column: IAppNav.Column): IRtPageHeader.Column => ({
            id: column.id,
            groups: column.groups.map((group: IAppNav.Group): IRtPageHeader.Group => ({
                id: group.id,
                label: group.labelKey === undefined ? undefined : label(group.labelKey),
                icon: group.icon,
                items: appNavSectionsOf(group.items, label),
            })),
        })),
    }));
}
