import { describe, expect, it } from 'vitest';

import { ENROLL_LIMIT, ENROLL_WINDOW_MS, IRateVerdict, rateVerdict, TRateMarks } from './rate-limit.util';

/** Момент, от которого считается окно: он приходит доводом, а не читается часами машины. */
const NOW: Date = new Date('2026-08-17T10:00:00.000Z');

/** Отметки о том, что с ключа уже приходило: `count` штук, все внутри окна. */
function marks(count: number): TRateMarks {
    return Array.from({ length: count }, (unused: unknown, at: number): number => NOW.getTime() - at * 1000);
}

describe('rateVerdict', () => {
    it('SC-MB-124 — первое обращение с ключа принимается, и отметка о нём остаётся', () => {
        const verdict: IRateVerdict = rateVerdict([], NOW);

        expect(verdict.allowed).toBe(true);
        expect(verdict.marks).toEqual([NOW.getTime()]);
    });

    it('SC-MB-124 — обращение сверх предела за окно отбивается', () => {
        const verdict: IRateVerdict = rateVerdict(marks(ENROLL_LIMIT), NOW);

        expect(verdict.allowed).toBe(false);
    });

    it('SC-MB-124 — отбитое обращение отметки о себе не оставляет: окно не растёт от отказов', () => {
        const verdict: IRateVerdict = rateVerdict(marks(ENROLL_LIMIT), NOW);

        expect(verdict.marks).toHaveLength(ENROLL_LIMIT);
    });

    it('SC-MB-124 — последнее обращение в пределе ещё принимается', () => {
        expect(rateVerdict(marks(ENROLL_LIMIT - 1), NOW).allowed).toBe(true);
    });

    it('SC-MB-124 — отметки старше окна выбрасываются, и ключ начинает счёт заново', () => {
        const later: Date = new Date(NOW.getTime() + ENROLL_WINDOW_MS + 1);
        const verdict: IRateVerdict = rateVerdict(marks(ENROLL_LIMIT), later);

        expect(verdict.allowed).toBe(true);
        expect(verdict.marks).toEqual([later.getTime()]);
    });

    it('SC-MB-124 — отметка ровно на границе окна уже не считается', () => {
        const edge: Date = new Date(NOW.getTime() + ENROLL_WINDOW_MS);

        expect(rateVerdict([NOW.getTime()], edge).marks).toEqual([edge.getTime()]);
    });
});
