/**
 * Выборка списка: страница, размер, порядок и отборы — и её жизнь в адресе раздела.
 *
 * Живёт в адресе, а не в состоянии экрана: перезагрузка на второй странице отобранного списка
 * иначе возвращает на первую, а ссылка на увиденное не передаётся никому.
 *
 * Отбор «без версии» стоит в адресе тем же словом, каким его читает приёмник: перевода между
 * адресом и запросом здесь нет ни у одного отбора.
 *
 * Разбор чистый и отказа не бросает. Значение, которое не читается, заменяется умолчанием: адрес
 * правит человек руками, и отказ на опечатку в нём означал бы пустой экран вместо списка. Тем же
 * решается и адрес, пришедший из прошлой редакции экрана.
 *
 * Умолчания живут здесь, а не у каждого раздела: разошедшись, они дали бы разным спискам разный
 * первый экран при одном и том же пустом адресе.
 */
import { ECargoState, PAGE_SIZE_DEFAULT, TPageDirection } from '@rt/message-bus-common';

/** Выборка, как её читает экран. Пустой отбор — груз всех деревьев во всех состояниях. */
export interface IAdminListQuery {
    readonly page: number;
    readonly size: number;
    /** Поле порядка — одно из тех, что раздел объявил сортируемыми. */
    readonly sort: string;
    readonly dir: TPageDirection;
    /** Признак дерева. Пусто — не сужено. */
    readonly tree: string;
    /**
     * Состояние записи, которым сужен список. Пусто — все состояния.
     *
     * Держится строкой, а не значением набора: разделу сводок состояние не приезжает вовсе, а в
     * адрес и в запрос выборка уходит строками — переводить её туда и обратно было бы незачем.
     */
    readonly state: string;
    /**
     * Версия выпуска, которой сужен список. Пусто — все версии.
     *
     * Слово «без версии» стоит здесь тем же полем, а не своим признаком: набор версий открыт, и
     * отличить его от версии всё равно некому, кроме приёмника, — он и отличает. Своё поле
     * означало бы, что в адресе законна пара «версия и без версии сразу», а такого списка нет.
     */
    readonly version: string;
    /**
     * Первый и последний день периода, `ГГГГ-ММ-ДД`, оба включительно. Пусто — период не назван,
     * и его подставляет приёмник.
     *
     * Период есть у одного раздела — использования; остальным он не приезжает и в запрос от них
     * не уходит. Лежит в общей выборке по тому же доводу, что и состояние: у выборки одна форма
     * на все разделы, и второй основы списка ради двух полей не бывает.
     */
    readonly from: string;
    readonly to: string;
}

/** Имена параметров адреса. Названы здесь, чтобы разбор и сборка не расходились строками. */
export const LIST_QUERY_PARAMS: Readonly<Record<'page' | 'size' | 'sort' | 'dir' | 'tree' | 'state' | 'version' | 'from' | 'to', string>> =
    Object.freeze({
        page: 'page',
        size: 'size',
        sort: 'sort',
        dir: 'dir',
        tree: 'tree',
        state: 'state',
        version: 'version',
        from: 'from',
        to: 'to',
    });

/** Форма дня в адресе. Та же, какой день читает приёмник. */
const DAY_FORM: RegExp = /^\d{4}-\d{2}-\d{2}$/;

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
 * Состояние из адреса. Слово вне набора читается как несказанное — список не сужен.
 *
 * Отбить его отказом здесь нельзя: адрес правит человек руками, и опечатка в нём оставила бы
 * пустой экран вместо списка. Приёмнику такое слово не посылается вовсе — его отбивает уже он,
 * а сюда оно не доходит.
 */
function state(raw: unknown): string {
    const asked: string = plain(raw);

    return Object.values(ECargoState).some((known: ECargoState): boolean => known === asked) ? asked : '';
}

/**
 * Версия из адреса. Читается как есть — набора версий заранее не существует.
 *
 * Слово вне набора здесь отбросить нечем: версии называет дерево при выпуске, и вчерашняя,
 * уехавшая вместе с вычищенными записями, от опечатки неотличима. Приёмник отвечает на такую
 * версию пустым списком, а не отказом, и человек видит пустоту с объяснением.
 */
function version(raw: unknown): string {
    return plain(raw);
}

/**
 * День периода из адреса. Слово не в форме дня читается как несказанное: приёмник отбивает
 * полупериод отказом, а адрес правит человек руками, и опечатка в нём дала бы отказ вместо списка.
 */
function day(raw: unknown): string {
    const asked: string = plain(raw);

    return DAY_FORM.test(asked) ? asked : '';
}

/**
 * Период из адреса: оба дня или ни одного.
 *
 * Один день из двух читается как период не названный: приёмник на полупериод отвечает отказом,
 * а экран с одним выбранным днём ещё не сказал, чего хочет.
 */
function period(params: Readonly<Record<string, unknown>>): { from: string; to: string } {
    const from: string = day(params[LIST_QUERY_PARAMS.from]);
    const to: string = day(params[LIST_QUERY_PARAMS.to]);

    return from && to ? { from, to } : { from: '', to: '' };
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
        state: state(params[LIST_QUERY_PARAMS.state]),
        version: version(params[LIST_QUERY_PARAMS.version]),
        ...period(params),
    };
}

/** Отбор в параметр адреса: пустой снимается пустотой, названный едет как есть. */
function named(value: string): string | null {
    return value === '' ? null : value;
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
        [LIST_QUERY_PARAMS.tree]: named(query.tree),
        [LIST_QUERY_PARAMS.state]: named(query.state),
        [LIST_QUERY_PARAMS.version]: named(query.version),
        [LIST_QUERY_PARAMS.from]: named(query.from),
        [LIST_QUERY_PARAMS.to]: named(query.to),
    };
}

/** Та же выборка или другая. Сравнивается по значениям: по ней экран решает, читать ли заново. */
export function sameListQuery(one: IAdminListQuery, other: IAdminListQuery): boolean {
    const samePlace: boolean = one.page === other.page && one.size === other.size;
    const sameOrder: boolean = one.sort === other.sort && one.dir === other.dir;
    const sameFilters: boolean = one.tree === other.tree && one.state === other.state && one.version === other.version;
    const samePeriod: boolean = one.from === other.from && one.to === other.to;

    return samePlace && sameOrder && sameFilters && samePeriod;
}
