import { ISideMenu } from '../side-menu.types';

/**
 * Ключ настроек бокового меню в хранилище.
 *
 * Назван приставкой кита: хранилище браузера общее на весь адрес, и короткое имя столкнулось бы с
 * ключом потребителя молча. Под ключом — один объект, в нём настройки каждого меню под его номером.
 */
export const SIDE_MENU_SETTINGS_KEY: string = 'rtui-side-menu';

/** Номер меню, которому приложение своего не задало. */
export const DEFAULT_MENU_ID: string = 'default';

/** Только строки и числа, без повторов, в прежнем порядке. */
export function normalizeFavorites(values: ReadonlyArray<unknown>): ISideMenu.FavoriteId[] {
    return values.reduce((kept: ISideMenu.FavoriteId[], value: unknown): ISideMenu.FavoriteId[] => {
        if ((typeof value === 'string' || typeof value === 'number') && !kept.includes(value)) {
            kept.push(value);
        }

        return kept;
    }, []);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Настройки одного меню из того, что лежит под его номером.
 *
 * Список избранного очищается так же, как при записи: из массива остаются строки и числа, повтор
 * отбрасывается — первое место побеждает. `1` и `'1'` — разные номера: пункт меню может носить
 * любой из двух, и сведение их в один подменило бы чужой пункт. Не массив — списка нет.
 */
export function normalizeSettings(value: unknown): ISideMenu.Settings {
    if (!isRecord(value) || !Array.isArray(value['favorites'])) {
        return {};
    }

    return { favorites: normalizeFavorites(value['favorites']) };
}

/**
 * Настройки всех меню из того, что лежит в хранилище.
 *
 * Сломанная запись читается пустой: не JSON, не объект — одинаково. Меню с номером, чьё значение
 * не объект, пропускается, остальные читаются: сломанный угол одного меню не стирает соседние.
 */
export function parseSettings(raw: string | null): Record<string, ISideMenu.Settings> {
    if (raw === null) {
        return {};
    }

    try {
        const value: unknown = JSON.parse(raw);

        if (!isRecord(value)) {
            return {};
        }

        return Object.fromEntries(
            Object.entries(value)
                .filter(([, settings]: [string, unknown]): boolean => isRecord(settings))
                .map(([menuId, settings]: [string, unknown]): [string, ISideMenu.Settings] => [menuId, normalizeSettings(settings)])
        );
    } catch {
        return {};
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
export function favoritesSection(menu: ReadonlyArray<ISideMenu.Item>, shown: ISideMenu.Item[]): ISideMenu.Item | null {
    const first: ISideMenu.Item | undefined = shown[0];

    if (!first) {
        return null;
    }

    const section: ISideMenu.Item | undefined =
        menu.find((item: ISideMenu.Item): boolean => item.submenu === shown) ??
        menu.find((item: ISideMenu.Item): boolean => !!item.submenu?.some((child: ISideMenu.Item): boolean => child.id === first.id));

    return section?.favorites ? section : null;
}
