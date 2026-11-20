/**
 * Данные блока источников цифр ответа, как их прислала модель, приведённые к виду, который можно
 * рисовать.
 *
 * Модель ошибается в форме: присылает уточнение числом, адрес пустой строкой, значок чужим словом.
 * Блок от этого не ломается — испорченная необязательная часть пропадает. Источник без названия
 * отбрасывается; блок без единого источника показывается плашкой.
 */

/** Один источник после приведения. */
export interface IRtSourceItem {
    readonly title: string;
    /** Страница, период, фильтры — то, что уточняет источник. */
    readonly detail: string | null;
    /** Имя значка кита; без присланного — `file`. */
    readonly icon: string;
    /** Адрес, который открывает приложение. `null` — строка не нажимается. */
    readonly url: string | null;
}

/** Блок источников после приведения: непустой список. */
export interface IRtSourcesData {
    readonly items: readonly IRtSourceItem[];
}

const DEFAULT_ICON: string = 'file';

/** Пустая строка или одни невидимые знаки: пробелы, пробелы нулевой ширины, соединитель слов, метка порядка байтов. */
const INVISIBLE_ONLY: RegExp = /^[\s\u200B-\u200D\u2060\uFEFF]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed: string = value.trim();

    return INVISIBLE_ONLY.test(trimmed) ? null : trimmed;
}

/** Источник из присланного. `null` — не объект или нет названия: источник отбрасывается. */
export function rtSourceItem(value: unknown): IRtSourceItem | null {
    if (!isRecord(value)) {
        return null;
    }

    const title: string | null = text(value['title']);

    if (title === null) {
        return null;
    }

    return {
        title,
        detail: text(value['detail']),
        icon: text(value['icon']) ?? DEFAULT_ICON,
        url: text(value['url']),
    };
}

/** Блок источников из присланного. `null` — `items` не список или в нём не осталось ни одного источника. */
export function rtSourcesData(value: unknown): IRtSourcesData | null {
    if (!isRecord(value) || !Array.isArray(value['items'])) {
        return null;
    }

    const items: IRtSourceItem[] = value['items']
        .map((item: unknown): IRtSourceItem | null => rtSourceItem(item))
        .filter((item: IRtSourceItem | null): item is IRtSourceItem => item !== null);

    return items.length === 0 ? null : { items };
}
