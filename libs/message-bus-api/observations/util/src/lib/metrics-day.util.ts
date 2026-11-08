/**
 * Разбор строки дня: одной копии, одного дня, только числа.
 *
 * Список ключей объявляет пакет, потому что отправитель обязан выбросить то же самое, что приём
 * отказывает. Чужой ключ отказывает всю строку: половина дня читалась бы как весь день.
 */
import { isMetricKey, isMetricOrigin, isMetricValue, isMetricVersion, METRIC_KEYS_CAP } from '@rt-tools/agent-kit/cargo';
import { isCargoBody, TCargoBody } from '@rt/message-bus-common';

import { OBSERVATION_DAY } from './observation.const';

/** Обязательные поля строки дня. */
export const METRICS_DAY_FIELDS: readonly string[] = ['schema', 'tree', 'origin', 'day', 'version', 'stamp', 'metrics'];

/** Запас на часы машины и пояс дерева: день и штамп дальше него ещё не наступили. */
const AHEAD_MS: number = 86_400_000;

/** Строка дня, готовая лечь в хранилище: дерево добавляет приём из токена. */
export interface IParsedMetricsDay {
    readonly origin: string;
    readonly day: string;
    readonly version: string;
    readonly stamp: Date;
    readonly metrics: Readonly<Record<string, number>>;
}

/** Что не сошлось: имя поля или ключа. */
export interface IMetricsDayFault {
    readonly field: string;
}

export function isMetricsDayFault(found: IParsedMetricsDay | IMetricsDayFault): found is IMetricsDayFault {
    return 'field' in found;
}

/** Календарный день не позже завтрашнего: `2026-02-30` и `9999-12-31` срок хранения не снимет. */
function dayOk(value: unknown, now: Date): boolean {
    if (typeof value !== 'string' || !OBSERVATION_DAY.test(value)) {
        return false;
    }
    const moment: number = Date.parse(`${value}T00:00:00Z`);

    return !Number.isNaN(moment) && new Date(moment).toISOString().slice(0, 10) === value && moment <= now.getTime() + AHEAD_MS;
}

/** Штамп из будущего закрыл бы день для всех следующих строк копии. */
function stampOk(value: unknown, now: Date): boolean {
    return isMetricValue(value) && Number(value) <= now.getTime() + AHEAD_MS;
}

function headFault(body: TCargoBody, now: Date): IMetricsDayFault | null {
    if (!isMetricOrigin(body['origin'])) {
        return { field: 'origin' };
    }
    if (!isMetricVersion(body['version'])) {
        return { field: 'version' };
    }
    if (!dayOk(body['day'], now)) {
        return { field: 'day' };
    }

    return stampOk(body['stamp'], now) ? null : { field: 'stamp' };
}

function metricsFault(metrics: unknown): IMetricsDayFault | null {
    if (!isCargoBody(metrics) || Object.keys(metrics).length > METRIC_KEYS_CAP) {
        return { field: 'metrics' };
    }
    const wrong: string | undefined = Object.keys(metrics).find(
        (key: string): boolean => !isMetricKey(key) || !isMetricValue(metrics[key])
    );

    return wrong === undefined ? null : { field: wrong };
}

/** Строка дня или поле, из-за которого она не принята. */
export function parseMetricsDay(body: TCargoBody, now: Date): IParsedMetricsDay | IMetricsDayFault {
    const fault: IMetricsDayFault | null = headFault(body, now) ?? metricsFault(body['metrics']);

    if (fault) {
        return fault;
    }

    return {
        origin: body['origin'] as string,
        day: body['day'] as string,
        version: body['version'] as string,
        stamp: new Date(body['stamp'] as number),
        metrics: body['metrics'] as Readonly<Record<string, number>>,
    };
}
