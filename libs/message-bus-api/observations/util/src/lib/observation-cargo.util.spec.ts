import { describe, expect, it } from 'vitest';

import { TCargoBody } from '@rt/message-bus-common';

import {
    EObservationsFault,
    IObservationsFault,
    IParsedObservations,
    isObservationsFault,
    observationLinesOf,
    observationsFaultMessage,
    parseObservationsCargo,
} from './observation-cargo.util';

const CAP: number = 10;

function line(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { t: '2026-08-12T10:00:00Z', ev: 'skill-load', res: 'testing', sid: '1', v: '0.27.0', skill: 'rule', ...overrides };
}

function cargo(days: readonly { day: string; lines: readonly unknown[] }[]): TCargoBody {
    return { schema: '2', tree: 'own-tree', origin: 'abc123', days };
}

/** Отказ из разбора — либо спека падает: положительная половина проверки отсутствия. */
function faultOf(body: TCargoBody): IObservationsFault {
    const parsed: IParsedObservations | IObservationsFault = parseObservationsCargo(body, CAP);

    if (!isObservationsFault(parsed)) {
        throw new Error('разбор принял груз, а ожидался отказ');
    }

    return parsed;
}

function parsedOf(body: TCargoBody): IParsedObservations {
    const parsed: IParsedObservations | IObservationsFault = parseObservationsCargo(body, CAP);

    if (isObservationsFault(parsed)) {
        throw new Error(`разбор отбил груз: ${observationsFaultMessage(parsed)}`);
    }

    return parsed;
}

describe('разбор груза наблюдений', () => {
    it('SC-MB-337 — дни и строки читаются как есть, с признаком копии', () => {
        const parsed: IParsedObservations = parsedOf(
            cargo([
                { day: '2026-08-12', lines: [line(), line({ ev: 'gate-deny', kind: 'ext', skill: undefined })] },
                { day: '2026-08-13', lines: [line({ res: 'task-flow', sid: '2' })] },
            ])
        );

        expect(parsed.origin).toBe('abc123');
        expect(parsed.days.map((day: { day: string }): string => day.day)).toEqual(['2026-08-12', '2026-08-13']);
        expect(parsed.days[0].rows[1]).toEqual({
            day: '2026-08-12',
            t: new Date('2026-08-12T10:00:00Z'),
            ev: 'gate-deny',
            res: 'testing',
            kind: 'ext',
            skill: null,
            sid: '1',
            v: '0.27.0',
        });
        expect(observationLinesOf(cargo([{ day: '2026-08-12', lines: [line(), line()] }]))).toBe(2);
    });

    it('SC-MB-340 — незнакомое событие отбивает груз целиком и называет место', () => {
        const found: IObservationsFault = faultOf(cargo([{ day: '2026-08-12', lines: [line(), line({ ev: 'unknown' })] }]));

        expect(found.kind).toBe(EObservationsFault.Event);
        expect(observationsFaultMessage(found)).toContain('день 2026-08-12, строка 2');
        expect(observationsFaultMessage(found)).toContain('«unknown»');
    });

    it('SC-MB-340 — строка без признака сессии отбивает груз', () => {
        const found: IObservationsFault = faultOf(cargo([{ day: '2026-08-12', lines: [line({ sid: '' })] }]));

        expect(found.kind).toBe(EObservationsFault.Fields);
        expect(observationsFaultMessage(found)).toContain('sid');
    });

    it('SC-MB-341 — строк больше предела — отказ по числу, до разбора строк', () => {
        const found: IObservationsFault = faultOf(
            cargo([{ day: '2026-08-12', lines: Array.from({ length: CAP + 1 }, (): unknown => line({ ev: 'unknown' })) }])
        );

        expect(found.kind).toBe(EObservationsFault.Lines);
        expect(observationsFaultMessage(found)).toBe(`в грузе рода «наблюдения» строк ${CAP + 1}, а предел ${CAP}`);
    });

    it('SC-MB-341 — поле длиннее предела отбивает груз, а не обрезается', () => {
        const found: IObservationsFault = faultOf(cargo([{ day: '2026-08-12', lines: [line({ res: 'ж'.repeat(101) })] }]));

        expect(found.kind).toBe(EObservationsFault.Length);
        expect(observationsFaultMessage(found)).toContain('res');
    });

    it('SC-MB-340 — день без имени или с чужой формой дня отбивается', () => {
        expect(faultOf(cargo([{ day: '12.08.2026', lines: [] }])).kind).toBe(EObservationsFault.Days);
        expect(faultOf({ schema: '2', tree: 'own-tree', origin: 'abc', days: 'нет' }).kind).toBe(EObservationsFault.Days);
        expect(faultOf(cargo([{ day: '2026-08-12', lines: [line({ t: 'вчера' })] }])).kind).toBe(EObservationsFault.Time);
    });
});
