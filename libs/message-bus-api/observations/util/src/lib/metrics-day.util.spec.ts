import { METRIC_KEYS, METRIC_KEYS_CAP, METRIC_RESOURCE_KEYS } from '@rt-tools/agent-kit/cargo';
import { TCargoBody } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { IMetricsDayFault, IParsedMetricsDay, isMetricsDayFault, parseMetricsDay } from './metrics-day.util';

function body(metrics: unknown, over: TCargoBody = {}): TCargoBody {
    return { origin: 'copy-1', day: '2026-11-07', version: '0.35.0', stamp: 1_700_000_000_000, metrics, ...over };
}

function faultOf(cargo: TCargoBody): string {
    const found: IParsedMetricsDay | IMetricsDayFault = parseMetricsDay(cargo);

    return isMetricsDayFault(found) ? found.field : '';
}

describe('parseMetricsDay', () => {
    it('принимает каждый ключ списка', () => {
        const metrics: Record<string, number> = {};

        for (const key of METRIC_KEYS) {
            metrics[key] = 1;
        }
        for (const key of METRIC_RESOURCE_KEYS) {
            metrics[`${key}:git-guard-push`] = 0;
        }

        expect(faultOf(body(metrics))).toBe('');
    });

    it('штамп становится моментом', () => {
        const found: IParsedMetricsDay | IMetricsDayFault = parseMetricsDay(body({ sessions: 2 }));

        expect(found).toMatchObject({ day: '2026-11-07', stamp: new Date(1_700_000_000_000), metrics: { sessions: 2 } });
    });

    it('SC-AK-1280 — чужой ключ отказывает всю строку и назван', () => {
        expect(faultOf(body({ sessions: 1, taskTitle: 3 }))).toBe('taskTitle');
    });

    it('SC-AK-1280 — путь в имени ресурса не проходит', () => {
        expect(faultOf(body({ 'guardRefusals:src/app/secret': 1 }))).toBe('guardRefusals:src/app/secret');
    });

    it('SC-AK-1280 — значение не целое или меньше нуля отказывается', () => {
        expect(faultOf(body({ sessions: 1.5 }))).toBe('sessions');
        expect(faultOf(body({ sessions: -1 }))).toBe('sessions');
        expect(faultOf(body({ sessions: '1' }))).toBe('sessions');
    });

    it('ключей больше предела — отказ по полю', () => {
        const metrics: Record<string, number> = {};

        for (let at: number = 0; at <= METRIC_KEYS_CAP; at += 1) {
            metrics[`runs:step-${at}`] = 1;
        }

        expect(faultOf(body(metrics))).toBe('metrics');
    });

    it('голова проверяется: день, штамп, версия, копия', () => {
        expect(faultOf(body({}, { day: '07.11.2026' }))).toBe('day');
        expect(faultOf(body({}, { stamp: 'вчера' }))).toBe('stamp');
        expect(faultOf(body({}, { version: '' }))).toBe('version');
        expect(faultOf(body({}, { origin: 'x'.repeat(201) }))).toBe('origin');
        expect(faultOf(body('числа'))).toBe('metrics');
    });
});
