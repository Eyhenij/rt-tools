/**
 * Данные блока секции, как их прислала модель, приведённые к виду, который можно рисовать.
 *
 * Секция держит другие блоки и раскладывает их сеткой. Здесь только то, что не зависит от
 * отрисовки: какие элементы списка считаются блоками, сколько места в ряду занимает блок и
 * каков заголовок. Сами вложенные блоки приводит лента ответа — каждый по своим правилам.
 */

/** Имя типа блока секции. */
export type TRtSectionBlockType = 'section';

/** Тип блока секции. */
export const RT_SECTION_BLOCK_TYPE: TRtSectionBlockType = 'section';

/** Сколько места в ряду сетки занимает вложенный блок. */
export enum ERtSectionSpan {
    /** Вся строка. */
    Full = 'full',
    /** Один столбец. */
    Column = 'column',
}

/** Элемент списка секции, признанный блоком: объект со строковым `type`. */
export interface IRtSectionItem {
    readonly type: string;
    readonly [field: string]: unknown;
}

const SPANS: readonly ERtSectionSpan[] = Object.values(ERtSectionSpan);

/**
 * Типы, которые без своего `span` занимают всю строку: текст, уведомление, ряд KPI и таблица
 * читаются во всю ширину. Остальные — график, блок приложения, неизвестный тип — один столбец.
 */
const FULL_ROW_TYPES: ReadonlySet<string> = new Set<string>(['markdown', 'notice', 'kpi', 'table']);

function isSectionItem(value: unknown): value is IRtSectionItem {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && typeof Reflect.get(value, 'type') === 'string';
}

/**
 * Блоки секции по порядку. Элемент, который не объект со строковым `type`, выпадает.
 * `null` — `blocks` не список или блоков не осталось: вместо секции показывается плашка.
 */
export function rtSectionItems(blocks: unknown): IRtSectionItem[] | null {
    if (!Array.isArray(blocks)) {
        return null;
    }

    const kept: IRtSectionItem[] = blocks.filter((item: unknown): item is IRtSectionItem => isSectionItem(item));

    return kept.length > 0 ? kept : null;
}

/**
 * Место блока в ряду. Свой `span` блока сильнее умолчания; любое другое значение `span` не
 * считается. Умолчание идёт от объявленного типа, а не от того, что нарисовано: блок KPI без
 * карточек показан плашкой, но всё равно занимает строку.
 */
export function rtSectionSpan(type: string, span: unknown): ERtSectionSpan {
    const own: ERtSectionSpan | undefined = SPANS.find((value: ERtSectionSpan): boolean => value === span);

    if (own !== undefined) {
        return own;
    }

    return FULL_ROW_TYPES.has(type) ? ERtSectionSpan.Full : ERtSectionSpan.Column;
}

/** Заголовок секции без пробелов по краям; `null` — не строка или пусто. */
export function rtSectionTitle(title: unknown): string | null {
    if (typeof title !== 'string') {
        return null;
    }

    const trimmed: string = title.trim();

    return trimmed === '' ? null : trimmed;
}
