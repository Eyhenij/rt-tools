import { ISideMenu } from '../side-menu.types';

/**
 * Ключ списка избранного по умолчанию.
 *
 * Назван приставкой кита, как ключи моды и ширины подменю: хранилище браузера общее на весь адрес,
 * и короткое имя столкнулось бы с ключом потребителя молча.
 */
export const FAVORITES_KEY: string = 'rtui-side-menu-favorites';

/** Только строки и числа, без повторов, в прежнем порядке. */
export function normalizeFavorites(values: ReadonlyArray<unknown>): ISideMenu.FavoriteId[] {
    return values.reduce((kept: ISideMenu.FavoriteId[], value: unknown): ISideMenu.FavoriteId[] => {
        if ((typeof value === 'string' || typeof value === 'number') && !kept.includes(value)) {
            kept.push(value);
        }

        return kept;
    }, []);
}

/**
 * Список из того, что лежит в хранилище.
 *
 * Сломанная запись читается пустым списком: не JSON, не массив — одинаково. Из массива остаются
 * только строки и числа, повтор отбрасывается — первое место побеждает. `1` и `'1'` — разные
 * номера: пункт меню может носить любой из двух, и сведение их в один подменило бы чужой пункт.
 */
export function parseFavorites(raw: string | null): ISideMenu.FavoriteId[] {
    if (raw === null) {
        return [];
    }

    try {
        const value: unknown = JSON.parse(raw);

        return Array.isArray(value) ? normalizeFavorites(value) : [];
    } catch {
        return [];
    }
}

/**
 * Перенос записи списка с места на место.
 *
 * Номер места вне списка у источника ничего не меняет — переносить нечего; у цели прижимается к
 * краю: рука, бросившая строку ниже последней, хотела поставить её последней.
 */
export function moveFavorite(ids: ReadonlyArray<ISideMenu.FavoriteId>, from: number, to: number): ISideMenu.FavoriteId[] {
    const next: ISideMenu.FavoriteId[] = [...ids];

    if (from < 0 || from >= next.length) {
        return next;
    }

    const moved: ISideMenu.FavoriteId = next.splice(from, 1)[0];
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
 * его там, куда ставил.
 */
export function moveVisibleFavorite(
    ids: ReadonlyArray<ISideMenu.FavoriteId>,
    visible: ReadonlyArray<ISideMenu.FavoriteId>,
    from: number,
    to: number
): ISideMenu.FavoriteId[] {
    const reordered: ISideMenu.FavoriteId[] = moveFavorite(visible, from, to);
    const slots: Set<ISideMenu.FavoriteId> = new Set(visible);
    let next: number = 0;

    return ids.map((id: ISideMenu.FavoriteId): ISideMenu.FavoriteId => {
        if (!slots.has(id)) {
            return id;
        }

        const placed: ISideMenu.FavoriteId = reordered[next];
        next += 1;

        return placed;
    });
}

/** Может ли пункт стоять в избранном: ссылка есть — может; папка без ссылки никуда не ведёт. */
export function isFavoriteCandidate(item: ISideMenu.Item): boolean {
    return Boolean(item.link?.trim());
}

function collectLinkedItems(items: ReadonlyArray<ISideMenu.Item>, byId: Map<ISideMenu.FavoriteId, ISideMenu.Item>): void {
    for (const item of items) {
        if (isFavoriteCandidate(item) && !byId.has(item.id)) {
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
export function findFavoriteItems(menu: ReadonlyArray<ISideMenu.Item>, ids: ReadonlyArray<ISideMenu.FavoriteId>): ISideMenu.Item[] {
    const byId: Map<ISideMenu.FavoriteId, ISideMenu.Item> = new Map();
    collectLinkedItems(
        menu.flatMap((item: ISideMenu.Item): ISideMenu.Item[] => item.submenu ?? []),
        byId
    );

    return ids.reduce((found: ISideMenu.Item[], id: ISideMenu.FavoriteId): ISideMenu.Item[] => {
        const item: ISideMenu.Item | undefined = byId.get(id);

        if (item) {
            found.push(item);
        }

        return found;
    }, []);
}

/**
 * Пункт полосы, чьё подменю сейчас открыто, если избранное у него включено.
 *
 * Избранное у каждого пункта своё и по умолчанию выключено: включает его потребитель флагом
 * `favorites` пункта полосы. Открытое подменю узнаётся по набору: выбранный человеком, а пока
 * выбора нет — набор активного пункта, как у закреплённого подменю.
 */
export function favoritesSection(
    menu: ReadonlyArray<ISideMenu.Item>,
    selectedSubMenu: ISideMenu.Item[] | null,
    active: ReadonlyArray<string | number>
): ISideMenu.Item | null {
    const section: ISideMenu.Item | undefined = selectedSubMenu?.length
        ? menu.find((item: ISideMenu.Item): boolean => item.submenu === selectedSubMenu)
        : menu.find((item: ISideMenu.Item): boolean => active.includes(item.id) && Boolean(item.submenu?.length));

    return section?.favorites ? section : null;
}
