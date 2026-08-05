import { IRtIcon } from '../icon';
import { IRtPageHeader } from './rt-page-header.model';

/** Чем пункт отрисуется: панелью, ссылкой или кнопкой. */
export enum ERtPageHeaderEntry {
    Panel = 'panel',
    Link = 'link',
    Button = 'button',
}

export namespace IRtPageHeaderView {
    /** Пункт, готовый к отрисовке: форма решена заранее, шаблон её не выводит. */
    export interface Entry {
        readonly id: string;
        readonly label: string;
        readonly icon: IRtIcon.Name | null;
        readonly route: string;
        readonly routerLinkActiveExact: boolean;
        readonly disabled: boolean;
        readonly unread: boolean;
        readonly kind: ERtPageHeaderEntry;
    }

    export interface Group {
        readonly id: string;
        readonly label: string;
        readonly icon: IRtIcon.Name | null;
        readonly items: ReadonlyArray<Entry>;
    }

    export interface Column {
        readonly id: string;
        readonly groups: ReadonlyArray<Group>;
    }

    export interface Section extends Entry {
        readonly columns: ReadonlyArray<Column>;
        readonly columnCount: number;
        /** Все пункты панели одним списком: подсветка раздела и сведение маркера. */
        readonly panelItems: ReadonlyArray<Entry>;
        /** Группы всех колонок подряд: на узком экране колонок нет, а группы есть. */
        readonly panelGroups: ReadonlyArray<Group>;
    }
}

/** Пункты панели одним списком — колонки и группы для этого раскрываются. */
export function panelItemsOf(item: IRtPageHeader.Item): ReadonlyArray<IRtPageHeader.Item> {
    return (item.columns ?? []).flatMap((column: IRtPageHeader.Column): ReadonlyArray<IRtPageHeader.Item> =>
        column.groups.flatMap((group: IRtPageHeader.Group): ReadonlyArray<IRtPageHeader.Item> => group.items)
    );
}

/**
 * Маркер раздела. Пункты панели свёрнуты, и непросмотренное внутри видно только
 * по точке у самого раздела.
 */
export function unreadOf(item: IRtPageHeader.Item): boolean {
    return item.unread === true || panelItemsOf(item).some((entry: IRtPageHeader.Item): boolean => entry.unread === true);
}

export function entryKindOf(item: IRtPageHeader.Item): ERtPageHeaderEntry {
    if (panelItemsOf(item).length > 0) {
        return ERtPageHeaderEntry.Panel;
    }
    if ((item.route ?? '') !== '' && !item.disabled) {
        return ERtPageHeaderEntry.Link;
    }

    return ERtPageHeaderEntry.Button;
}

export function toEntry(item: IRtPageHeader.Item): IRtPageHeaderView.Entry {
    return {
        id: item.id,
        label: item.label,
        icon: item.icon ?? null,
        route: item.route ?? '',
        routerLinkActiveExact: item.routerLinkActiveExact === true,
        disabled: item.disabled === true,
        unread: item.unread === true,
        kind: entryKindOf(item),
    };
}

function toGroup(group: IRtPageHeader.Group): IRtPageHeaderView.Group {
    return {
        id: group.id,
        label: group.label ?? '',
        icon: group.icon ?? null,
        items: group.items.map(toEntry),
    };
}

function toColumn(column: IRtPageHeader.Column): IRtPageHeaderView.Column {
    return {
        id: column.id,
        groups: column.groups.map(toGroup),
    };
}

/** Группы всех колонок одним списком — узкий экран раскладывает панель без колонок. */
export function panelGroupsOf(columns: ReadonlyArray<IRtPageHeaderView.Column>): ReadonlyArray<IRtPageHeaderView.Group> {
    return columns.flatMap((column: IRtPageHeaderView.Column): ReadonlyArray<IRtPageHeaderView.Group> => column.groups);
}

/** Разделы верхнего ряда вместе с раскладкой их панелей. */
export function toSections(items: ReadonlyArray<IRtPageHeader.Item>): ReadonlyArray<IRtPageHeaderView.Section> {
    return items.map((item: IRtPageHeader.Item): IRtPageHeaderView.Section => {
        const columns: ReadonlyArray<IRtPageHeaderView.Column> = (item.columns ?? []).map(toColumn);

        return {
            ...toEntry(item),
            unread: unreadOf(item),
            columns,
            columnCount: columns.length,
            panelItems: panelItemsOf(item).map(toEntry),
            panelGroups: panelGroupsOf(columns),
        };
    });
}

/** Адрес без строки запроса и якоря — подсветка считается по пути. */
export function pathOf(url: string): string {
    return url.split(/[?#]/)[0] ?? '';
}

export function isEntryActive(entry: IRtPageHeaderView.Entry, path: string): boolean {
    if (entry.kind !== ERtPageHeaderEntry.Link) {
        return false;
    }

    return entry.routerLinkActiveExact ? path === entry.route : path.startsWith(entry.route);
}

/**
 * Разделы, у которых активен хоть один пункт панели. Обход идёт по раскрытому
 * списку пунктов: своего адреса у раздела с панелью нет, и подсветить его больше
 * нечем.
 */
export function activeSectionIds(sections: ReadonlyArray<IRtPageHeaderView.Section>, url: string): ReadonlySet<string> {
    const path: string = pathOf(url);
    const ids: Set<string> = new Set<string>();
    for (const section of sections) {
        if (section.panelItems.some((entry: IRtPageHeaderView.Entry): boolean => isEntryActive(entry, path))) {
            ids.add(section.id);
        }
    }

    return ids;
}
