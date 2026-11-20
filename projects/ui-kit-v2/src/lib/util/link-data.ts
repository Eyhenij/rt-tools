/**
 * Данные блока ссылки на страницу, как их прислала модель, приведённые к виду, который можно
 * рисовать.
 *
 * Модель ошибается в форме: присылает раздел числом, состояние чужим словом, причину без отказа.
 * Блок от этого не ломается — испорченная необязательная часть пропадает. Отказ один: нет названия
 * или адреса, тогда показывается плашка блока.
 */

/** Исход открытия страницы, как его назвало приложение. */
export enum ERtLinkState {
    Pending = 'pending',
    Opened = 'opened',
    Failed = 'failed',
}

/** Карточка ссылки после приведения. */
export interface IRtLinkData {
    readonly title: string;
    readonly url: string;
    /** Раздел приложения, в котором лежит страница. */
    readonly section: string | null;
    /** Имя значка кита; без присланного — `link`. */
    readonly icon: string;
    /** `null` — исход не назван или назван словом, которого кит не знает: строки статуса нет. */
    readonly state: ERtLinkState | null;
    /** Причина отказа; есть только при `failed`. */
    readonly reason: string | null;
}

const STATES: readonly ERtLinkState[] = Object.values(ERtLinkState);
const DEFAULT_ICON: string = 'link';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed: string = value.trim();

    return trimmed === '' ? null : trimmed;
}

function linkState(value: unknown): ERtLinkState | null {
    return STATES.find((state: ERtLinkState): boolean => state === value) ?? null;
}

/** Карточка из присланного. `null` — не объект, нет названия или нет адреса: плашка блока. */
export function rtLinkData(value: unknown): IRtLinkData | null {
    if (!isRecord(value)) {
        return null;
    }

    const title: string | null = text(value['title']);
    const url: string | null = text(value['url']);

    if (title === null || url === null) {
        return null;
    }

    const state: ERtLinkState | null = linkState(value['state']);

    return {
        title,
        url,
        state,
        section: text(value['section']),
        icon: text(value['icon']) ?? DEFAULT_ICON,
        reason: state === ERtLinkState.Failed ? text(value['reason']) : null,
    };
}
