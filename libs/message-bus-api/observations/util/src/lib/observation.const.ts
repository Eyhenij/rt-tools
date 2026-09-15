/**
 * Форма груза наблюдений: что в нём обязано быть и какие пределы держит приём.
 *
 * В отличие от сводки, строки приём разбирает: хранилище считает по ним, и строка, которую
 * нечем посчитать, отбивается. Роды событий берутся из объявления отправляющей стороны — второй
 * список разошёлся бы с первым молча.
 */

/** Обязательные поля головы груза наблюдений: голова, признак копии и дни. */
export const OBSERVATIONS_FIELDS: readonly string[] = ['schema', 'tree', 'origin', 'days'];

/** Обязательные поля одной строки: время, событие, ресурс, признак сессии, версия. */
export const OBSERVATION_LINE_FIELDS: readonly string[] = ['t', 'ev', 'res', 'sid', 'v'];

/** Текстовые поля строки, у которых есть предел длины. */
export const OBSERVATION_TEXT_FIELDS: readonly string[] = ['ev', 'res', 'kind', 'sid', 'v', 'skill'];

/** Предел длины текстового поля строки в байтах: имя ресурса — имя файла, длиннее не бывает. */
export const OBSERVATION_FIELD_BYTES: number = 200;

/** Предел строк в одном грузе, когда настройка его не назвала. */
export const DEFAULT_OBSERVATION_LINES_CAP: number = 5000;

/** Имя настройки предела строк. */
export const OBSERVATION_LINES_CAP_KEY: string = 'OBSERVATION_LINES_CAP';

/** День строки: `2026-09-14`, как назван файл дня у дерева. */
export const OBSERVATION_DAY: RegExp = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Предел строк в одном грузе: настройка, а без неё умолчание.
 *
 * Читается на каждом запросе, как предел веса: значение — состояние возможности, и секретом оно
 * не бывает — приёмник называет его дереву в самом отказе. В сводку подъёма попадает именем и
 * значением.
 */
export function observationLinesCap(): number {
    const named: number = Number(process.env[OBSERVATION_LINES_CAP_KEY]);

    return Number.isInteger(named) && named > 0 ? named : DEFAULT_OBSERVATION_LINES_CAP;
}
