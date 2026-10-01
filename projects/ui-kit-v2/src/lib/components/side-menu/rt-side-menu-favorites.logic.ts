import { IRtSideMenu } from './rt-side-menu.model';

/** Только строки и числа, без повторов, в прежнем порядке. */
export function normalizeSideMenuFavorites(values: ReadonlyArray<unknown>): IRtSideMenu.FavoriteId[] {
    return values.reduce((kept: IRtSideMenu.FavoriteId[], value: unknown): IRtSideMenu.FavoriteId[] => {
        if ((typeof value === 'string' || typeof value === 'number') && !kept.includes(value)) {
            kept.push(value);
        }

        return kept;
    }, []);
}

/**
 * Перенос записи списка с места на место.
 *
 * Номер места вне списка у источника ничего не меняет — переносить нечего; у цели прижимается к
 * краю: рука, бросившая строку ниже последней, хотела поставить её последней.
 */
export function moveSideMenuFavorite(ids: ReadonlyArray<IRtSideMenu.FavoriteId>, from: number, to: number): IRtSideMenu.FavoriteId[] {
    const next: IRtSideMenu.FavoriteId[] = [...ids];

    if (from < 0 || from >= next.length) {
        return next;
    }

    const moved: IRtSideMenu.FavoriteId = next.splice(from, 1)[0];
    const target: number = Math.min(Math.max(to, 0), next.length);
    next.splice(target, 0, moved);

    return next;
}

/**
 * Перенос строки блока — места в блоке, а не в списке.
 *
 * Блок показывает только те номера, пункты которых в меню есть, поэтому место в блоке — не место в
 * списке. Видимые номера переставляются между собой и встают в те же ячейки списка, которые
 * занимали; скрытые остаются на своих местах: их пункт вернётся вместе с правом, и человек найдёт
 * его там, куда ставил. Видимый номер, которого в списке нет, пропускается: список могла поменять
 * другая вкладка, а место номера, которого нет, занять нечем.
 */
export function moveVisibleSideMenuFavorite(
    ids: ReadonlyArray<IRtSideMenu.FavoriteId>,
    visible: ReadonlyArray<IRtSideMenu.FavoriteId>,
    from: number,
    to: number
): IRtSideMenu.FavoriteId[] {
    const listed: Set<IRtSideMenu.FavoriteId> = new Set(ids);
    const reordered: IRtSideMenu.FavoriteId[] = moveSideMenuFavorite(normalizeSideMenuFavorites(visible), from, to).filter(
        (id: IRtSideMenu.FavoriteId): boolean => listed.has(id)
    );
    const slots: Set<IRtSideMenu.FavoriteId> = new Set(reordered);
    let next: number = 0;

    return ids.map((id: IRtSideMenu.FavoriteId): IRtSideMenu.FavoriteId => {
        if (!slots.has(id)) {
            return id;
        }

        const placed: IRtSideMenu.FavoriteId = reordered[next];
        next += 1;

        return placed;
    });
}

/**
 * Может ли пункт стоять в избранном: ссылка есть — может; папка без ссылки никуда не ведёт, а
 * пункт с флагом `favoriteDisabled` приложение исключило само.
 */
export function isSideMenuFavoriteCandidate(item: IRtSideMenu.Item): boolean {
    return Boolean(item.link?.trim()) && !item.favoriteDisabled;
}

function collectLinkedItems(items: ReadonlyArray<IRtSideMenu.Item>, byId: Map<IRtSideMenu.FavoriteId, IRtSideMenu.Item>): void {
    for (const item of items) {
        if (isSideMenuFavoriteCandidate(item) && !byId.has(item.id)) {
            byId.set(item.id, item);
        }

        collectLinkedItems(item.submenu ?? [], byId);
    }
}

/**
 * Пункты меню, стоящие за номерами списка, в порядке списка.
 *
 * Пункт ищется в подменю пунктов полосы, вглубь папок, и берётся первый со ссылкой: избранное,
 * которое никуда не ведёт, — сломанное избранное. Номер без пункта пропускается, но из списка не
 * уходит — это решает сервис, а не меню.
 */
export function findSideMenuFavoriteItems(
    menu: ReadonlyArray<IRtSideMenu.Item>,
    ids: ReadonlyArray<IRtSideMenu.FavoriteId>
): IRtSideMenu.Item[] {
    const byId: Map<IRtSideMenu.FavoriteId, IRtSideMenu.Item> = new Map();
    collectLinkedItems(
        menu.flatMap((item: IRtSideMenu.Item): IRtSideMenu.Item[] => item.submenu ?? []),
        byId
    );

    return ids.reduce((found: IRtSideMenu.Item[], id: IRtSideMenu.FavoriteId): IRtSideMenu.Item[] => {
        const item: IRtSideMenu.Item | undefined = byId.get(id);

        if (item) {
            found.push(item);
        }

        return found;
    }, []);
}

/**
 * Пункт полосы, чьё подменю сейчас показано, если избранное у него включено.
 *
 * Избранное у каждого пункта своё и по умолчанию выключено: включает его потребитель флагом
 * `favorites` пункта полосы. Показанный набор даёт меню — закреплённый или открытый наведением, —
 * и пустой набор не принадлежит никому: подменю без списка не показывает ничьё избранное.
 *
 * Раздел узнаётся сначала по самому набору, затем по номеру его первого пункта: приложение вправе
 * передать меню заново теми же пунктами в новых объектах — при смене языка или прав, — и набор,
 * который подменю ещё держит, перестаёт совпадать с пунктами полосы по ссылке. Номера пунктов
 * подменю единственны на всё меню — это обязанность потребителя.
 */
export function sideMenuFavoritesSection(menu: ReadonlyArray<IRtSideMenu.Item>, shown: IRtSideMenu.Item[]): IRtSideMenu.Item | null {
    const first: IRtSideMenu.Item | undefined = shown[0];

    if (!first) {
        return null;
    }

    const section: IRtSideMenu.Item | undefined =
        menu.find((item: IRtSideMenu.Item): boolean => item.submenu === shown) ??
        menu.find((item: IRtSideMenu.Item): boolean => !!item.submenu?.some((child: IRtSideMenu.Item): boolean => child.id === first.id));

    return section?.favorites ? section : null;
}

/** Место на экране, где строку отпустили, и прямоугольник панели подменю. */
export interface IRtSideMenuDropPoint {
    x: number;
    y: number;
}

/**
 * Строку отпустили за пределами панели. Пока её тянули, уход указателя с панели не закрывал
 * подменю, открытое наведением, — после броска он должен сработать так, будто случился сейчас.
 */
export function isSideMenuDropOutside(panel: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>, point: IRtSideMenuDropPoint): boolean {
    return point.x < panel.left || point.x > panel.right || point.y < panel.top || point.y > panel.bottom;
}
