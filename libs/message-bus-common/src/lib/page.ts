/**
 * Выборка списка: страница, размер, порядок и отбор по дереву — и то, чем список отвечает.
 *
 * Живёт в общей либе, потому что читают её обе стороны: приёмник собирает страницу, админка её
 * запрашивает и рисует переключатель страниц по общему числу. Копия этого разбора у каждого из
 * трёх списков разошлась бы с остальными на первой же правке границ.
 *
 * Разбор чистый и отказа не бросает: отказ — это код ответа, а код знает только принимающая
 * сторона. Здесь решается, что именно не разобрано, и собирается текст, который человек прочитает.
 *
 * Границы разведены намеренно: размер выше предела не отбивается, а прижимается к пределу —
 * запрос за тысячей строк это промах вызывающего, а не человека, и вес ответа он всё равно не
 * поднимет. Номер и размер, которые не читаются числом, отбиваются: молча подставленное
 * умолчание показало бы не ту страницу, о которой спрашивали.
 */

/** Размер страницы, когда запрос его не назвал. */
export const PAGE_SIZE_DEFAULT: number = 20;

/** Предел размера страницы: больше него ответ не отдаётся, сколько бы ни попросили. */
export const PAGE_SIZE_MAX: number = 100;

/** Куда идёт порядок. Набор закрыт: третьего направления у сортировки нет. */
export type TPageDirection = 'asc' | 'desc';

/** Выборка, как её разобрал приёмник: страницы считаются с единицы. */
export interface IPageAsked {
    readonly page: number;
    readonly size: number;
    /** Поле порядка — одно из названных списком; чем оно оборачивается в запросе, знает домен. */
    readonly sort: string;
    readonly dir: TPageDirection;
    /** Признак дерева, которым сужен список. Пусто — груз всех деревьев. */
    readonly tree: string | null;
}

/**
 * Страница списка.
 *
 * Общее число едет вместе со строками: без него переключатель страниц не знает, сколько их, а
 * второй запрос за счётом отвечал бы уже про другой список.
 */
export interface IPage<TRow> {
    readonly rows: readonly TRow[];
    readonly total: number;
    readonly page: number;
    readonly size: number;
}

/** Сколько записей пропустить, чтобы дойти до запрошенной страницы. */
export function pageSkip(asked: IPageAsked): number {
    return (asked.page - 1) * asked.size;
}

/** Целое от единицы и выше. Пусто — значение числом не читается, и подставлять умолчание нельзя. */
function wholeOf(value: unknown): number | null {
    if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
        return null;
    }

    const whole: number = Number(value.trim());

    return whole >= 1 ? whole : null;
}

/**
 * Что в выборке не разобрано. Пусто — выборку можно читать.
 *
 * Отказ называет параметр и его границы: «неверный запрос» без имени параметра означает, что
 * причину ищут перебором.
 */
export function pageFault(query: Record<string, unknown>, sortable: readonly string[]): string | null {
    if (query['page'] !== undefined && wholeOf(query['page']) === null) {
        return 'параметр page ожидается целым числом от 1';
    }
    if (query['size'] !== undefined && wholeOf(query['size']) === null) {
        return `параметр size ожидается целым числом от 1 до ${PAGE_SIZE_MAX}`;
    }

    const sort: unknown = query['sort'];

    if (sort !== undefined && (typeof sort !== 'string' || !sortable.includes(sort))) {
        return `параметр sort ожидается одним из: ${sortable.join(', ')}`;
    }

    const dir: unknown = query['dir'];

    if (dir !== undefined && dir !== 'asc' && dir !== 'desc') {
        return 'параметр dir ожидается одним из: asc, desc';
    }
    if (query['tree'] !== undefined && typeof query['tree'] !== 'string') {
        return 'параметр tree ожидается признаком одного дерева';
    }

    return null;
}

/**
 * Выборка запроса.
 *
 * Зовётся после `pageFault`, но и сама по себе полна: неразобранное здесь заменяется умолчанием,
 * а не роняет разбор. Первое поле списка порядка — умолчание домена: список пустым не бывает.
 */
export function pageAsked(query: Record<string, unknown>, sortable: readonly string[]): IPageAsked {
    const sort: unknown = query['sort'];
    const tree: unknown = query['tree'];

    return {
        page: wholeOf(query['page']) ?? 1,
        size: Math.min(wholeOf(query['size']) ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX),
        sort: typeof sort === 'string' && sortable.includes(sort) ? sort : sortable[0],
        dir: query['dir'] === 'asc' ? 'asc' : 'desc',
        tree: typeof tree === 'string' && tree.trim() ? tree.trim() : null,
    };
}
