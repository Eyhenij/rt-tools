/**
 * Выборка списка: страница, размер, порядок и отбор по дереву — и её жизнь в адресе раздела.
 *
 * Живёт в адресе, а не в состоянии экрана: перезагрузка на второй странице отобранного списка
 * иначе возвращает на первую, а ссылка на увиденное не передаётся никому.
 *
 * Разбор чистый и отказа не бросает. Значение, которое не читается, заменяется умолчанием: адрес
 * правит человек руками, и отказ на опечатку в нём означал бы пустой экран вместо списка. Тем же
 * решается и адрес, пришедший из прошлой редакции экрана.
 *
 * Умолчания живут здесь, а не у каждого раздела: разошедшись, они дали бы разным спискам разный
 * первый экран при одном и том же пустом адресе.
 */
import { PAGE_SIZE_DEFAULT, TPageDirection } from '@rt/message-bus-common';

/** Выборка, как её читает экран. Пустой отбор — груз всех деревьев. */
export interface IAdminListQuery {
    readonly page: number;
    readonly size: number;
    /** Поле порядка — одно из тех, что раздел объявил сортируемыми. */
    readonly sort: string;
    readonly dir: TPageDirection;
    /** Признак дерева. Пусто — не сужено. */
    readonly tree: string;
}

/** Имена параметров адреса. Названы здесь, чтобы разбор и сборка не расходились строками. */
export const LIST_QUERY_PARAMS: Readonly<Record<'page' | 'size' | 'sort' | 'dir' | 'tree', string>> = Object.freeze({
    page: 'page',
    size: 'size',
    sort: 'sort',
    dir: 'dir',
    tree: 'tree',
});

/** Порядок по умолчанию: свежие сверху. Поле называет сам раздел — оно у всех своё. */
export const DEFAULT_DIRECTION: TPageDirection = 'desc';

/**
 * Размеры страницы, которые экран предлагает человеку.
 *
 * Тот же набор получает переключатель страниц кита: он прячет себя, когда записей меньше, чем
 * самый малый из предложенных, — и размер, которого в наборе нет, оставлял бы человека на второй
 * странице без переключателя. Адрес такой размер получает руками или из прошлой редакции экрана,
 * и читается он как несказанный.
 */
export const LIST_PAGE_SIZES: readonly number[] = Object.freeze([20, 50, 100]);

/** Целое от единицы и выше; всё остальное — пусто, и на его место встаёт умолчание. */
function positive(raw: unknown): number | null {
    const asked: string = typeof raw === 'string' ? raw.trim() : '';
    if (!/^\d+$/.test(asked)) {
        return null;
    }
    const value: number = Number(asked);

    return value >= 1 ? value : null;
}

/** Размер страницы из набора предложенных; всё остальное — пусто, и его место займёт умолчание. */
function offeredSize(raw: unknown): number | null {
    const value: number | null = positive(raw);

    return value !== null && LIST_PAGE_SIZES.includes(value) ? value : null;
}

/** Направление порядка. Чужое слово читается как отсутствие ответа. */
function direction(raw: unknown): TPageDirection | null {
    return raw === 'asc' || raw === 'desc' ? raw : null;
}

/** Строка параметра. Всё, что не строка, — пусто: массив приходит от повторённого параметра. */
function plain(raw: unknown): string {
    return typeof raw === 'string' ? raw.trim() : '';
}

/**
 * Выборка из параметров адреса.
 *
 * @param params Параметры адреса, как их отдаёт роутер.
 * @param sortable Поля, которые раздел объявил сортируемыми; первое из них — порядок по
 *   умолчанию. Поле не из набора отбрасывается: иначе адрес просил бы у приёмника порядок, на
 *   который тот отвечает отказом.
 */
export function listQueryOf(params: Readonly<Record<string, unknown>>, sortable: readonly string[]): IAdminListQuery {
    const asked: string = plain(params[LIST_QUERY_PARAMS.sort]);

    return {
        page: positive(params[LIST_QUERY_PARAMS.page]) ?? 1,
        size: offeredSize(params[LIST_QUERY_PARAMS.size]) ?? PAGE_SIZE_DEFAULT,
        sort: sortable.includes(asked) ? asked : (sortable[0] ?? ''),
        dir: direction(params[LIST_QUERY_PARAMS.dir]) ?? DEFAULT_DIRECTION,
        tree: plain(params[LIST_QUERY_PARAMS.tree]),
    };
}

/**
 * Выборка обратно в параметры адреса.
 *
 * Значение, равное умолчанию, в адрес не пишется: адрес раздела остаётся коротким, а ссылка на
 * первую страницу — той же самой, с какой стороны на неё ни прийти. Снимается параметр пустым
 * значением, а не отсутствием ключа: роутер убирает его из адреса только так.
 */
export function listQueryParams(query: IAdminListQuery, sortable: readonly string[]): Record<string, string | null> {
    return {
        [LIST_QUERY_PARAMS.page]: query.page === 1 ? null : String(query.page),
        [LIST_QUERY_PARAMS.size]: query.size === PAGE_SIZE_DEFAULT ? null : String(query.size),
        [LIST_QUERY_PARAMS.sort]: query.sort === (sortable[0] ?? '') ? null : query.sort,
        [LIST_QUERY_PARAMS.dir]: query.dir === DEFAULT_DIRECTION ? null : query.dir,
        [LIST_QUERY_PARAMS.tree]: query.tree === '' ? null : query.tree,
    };
}

/** Та же выборка или другая. Сравнивается по значениям: по ней экран решает, читать ли заново. */
export function sameListQuery(one: IAdminListQuery, other: IAdminListQuery): boolean {
    const samePlace: boolean = one.page === other.page && one.size === other.size;
    const sameOrder: boolean = one.sort === other.sort && one.dir === other.dir;

    return samePlace && sameOrder && one.tree === other.tree;
}
