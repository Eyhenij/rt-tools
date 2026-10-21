import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
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
        /** Очередь ухода в «Ещё»: меньшее число уходит раньше. */
        readonly priority: number;
    }
}

export namespace IRtPageHeaderFit {
    /** Раздел верхнего ряда с замеренной шириной и важностью. */
    export interface Slot {
        readonly id: string;
        readonly width: number;
        readonly priority: number;
    }

    export interface Input {
        /** Разделы в порядке списка. */
        readonly slots: ReadonlyArray<Slot>;
        /** Ширина пункта «Ещё». */
        readonly moreWidth: number;
        /** Ширина, которую ряд может занять. */
        readonly available: number;
        /** Промежуток между соседними пунктами ряда. */
        readonly gap: number;
    }

    /** Раскладка ряда: оба списка идут в порядке исходного списка. */
    export interface Result {
        readonly row: ReadonlyArray<string>;
        readonly more: ReadonlyArray<string>;
    }
}

/**
 * Запас на дробные пиксели замера: сумма округлённых браузером ширин расходится с шириной ряда на
 * доли пикселя, и без запаса последний раздел уходил бы в «Ещё», хотя на глаз помещается.
 */
const FIT_TOLERANCE: number = 0.5;

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
            priority: item.priority ?? 0,
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
 * Разделы для кругов сжатой полосы: первые `count` из тех, у кого есть иконка. Раздел без
 * иконки в круг не попадает — показать в нём нечего, и он остаётся под кнопкой «ещё».
 */
export function compactSectionsOf(
    sections: ReadonlyArray<IRtPageHeaderView.Section>,
    count: number
): ReadonlyArray<IRtPageHeaderView.Section> {
    return sections.filter((section: IRtPageHeaderView.Section): boolean => section.icon !== null).slice(0, Math.max(0, count));
}

/**
 * Прилипла ли шапка: липкий узел стоит на пиксель выше края прокрутки и, прилипнув, теряет этот
 * пиксель из видимой области — наблюдатель пересечения отдаёт долю меньше единицы. Узел, ушедший
 * из области целиком, прилипшим не считается: его не видно вовсе.
 */
export function isStuck(intersectionRatio: number, isIntersecting: boolean): boolean {
    return isIntersecting && intersectionRatio < 1;
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

function idOf(slot: IRtPageHeaderFit.Slot): string {
    return slot.id;
}

/** Ширина ряда из пунктов заданной ширины с промежутками между соседями. */
function rowWidthOf(widths: ReadonlyArray<number>, gap: number): number {
    const total: number = widths.reduce((sum: number, width: number): number => sum + width, 0);

    return total + gap * Math.max(0, widths.length - 1);
}

/**
 * Какие разделы стоят в ряду, а какие уходят в «Ещё». Всё помещается — «Ещё» нет. Иначе разделы
 * уходят по очереди важности, пока оставшиеся вместе с «Ещё» не встанут в доступную ширину:
 * меньшая важность уходит раньше, а при равной — стоящий дальше от начала списка. Порядок
 * оставшихся не меняется.
 */
export function fitRow(input: IRtPageHeaderFit.Input): IRtPageHeaderFit.Result {
    const { slots, moreWidth, available, gap } = input;
    const limit: number = available + FIT_TOLERANCE;
    if (
        rowWidthOf(
            slots.map((slot: IRtPageHeaderFit.Slot): number => slot.width),
            gap
        ) <= limit
    ) {
        return { row: slots.map(idOf), more: [] };
    }

    const departure: ReadonlyArray<number> = Array.from(slots.keys()).sort(
        (a: number, b: number): number => slots[a].priority - slots[b].priority || b - a
    );
    const kept: Set<number> = new Set<number>(slots.keys());
    for (const index of departure) {
        const keptWidths: ReadonlyArray<number> = Array.from(kept, (at: number): number => slots[at].width);
        if (rowWidthOf([...keptWidths, moreWidth], gap) <= limit) {
            break;
        }
        kept.delete(index);
    }

    return {
        row: Array.from(slots.keys())
            .filter((index: number): boolean => kept.has(index))
            .map((index: number): string => slots[index].id),
        more: Array.from(slots.keys())
            .filter((index: number): boolean => !kept.has(index))
            .map((index: number): string => slots[index].id),
    };
}

/** Активен ли раздел: своим адресом или адресом пункта своей панели. */
export function isSectionActive(section: IRtPageHeaderView.Section, path: string): boolean {
    return isEntryActive(section, path) || section.panelItems.some((entry: IRtPageHeaderView.Entry): boolean => isEntryActive(entry, path));
}

/** Есть ли среди разделов активный — по нему «Ещё» подсвечивается, как выбранный пункт ряда. */
export function hasActiveSection(sections: ReadonlyArray<IRtPageHeaderView.Section>, url: string): boolean {
    const path: string = pathOf(url);

    return sections.some((section: IRtPageHeaderView.Section): boolean => isSectionActive(section, path));
}
