/**
 * Разбор строки дня: одной копии, одного дня, только числа.
 *
 * Список ключей объявляет пакет, потому что отправитель обязан выбросить то же самое, что приём
 * отказывает. Чужой ключ отказывает всю строку: половина дня читалась бы как весь день.
 */
import { isMetricKey, isMetricValue, METRIC_KEYS_CAP } from '@rt-tools/agent-kit/cargo';
import { isCargoBody, TCargoBody } from '@rt/message-bus-common';

import { OBSERVATION_DAY, OBSERVATION_FIELD_BYTES } from './observation.const';

/** Обязательные поля строки дня. */
export const METRICS_DAY_FIELDS: readonly string[] = ['schema', 'tree', 'origin', 'day', 'version', 'stamp', 'metrics'];

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

function textFault(body: TCargoBody, field: string): IMetricsDayFault | null {
    const value: unknown = body[field];

    return typeof value === 'string' && value !== '' && Buffer.byteLength(value) <= OBSERVATION_FIELD_BYTES ? null : { field };
}

function headFault(body: TCargoBody): IMetricsDayFault | null {
    const text: IMetricsDayFault | null = textFault(body, 'origin') ?? textFault(body, 'version');

    if (text) {
        return text;
    }
    if (typeof body['day'] !== 'string' || !OBSERVATION_DAY.test(body['day'])) {
        return { field: 'day' };
    }

    return isMetricValue(body['stamp']) ? null : { field: 'stamp' };
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
export function parseMetricsDay(body: TCargoBody): IParsedMetricsDay | IMetricsDayFault {
    const fault: IMetricsDayFault | null = headFault(body) ?? metricsFault(body['metrics']);

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
