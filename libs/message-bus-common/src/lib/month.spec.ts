import { describe, expect, it } from 'vitest';

import { monthOf } from './month';

describe('месяц записи', () => {
    it('SC-MB-3 — месяц берётся по часам приёмника, а не по поясу дерева', () => {
        // Первое сентября в поясе дерева (UTC+8) — это ещё август у приёмника.
        expect(monthOf(new Date('2026-09-01T00:30:00+08:00'))).toBe('2026-08');
    });

    it('SC-MB-3 — граница месяца проходит по всемирному времени', () => {
        expect(monthOf(new Date('2026-08-31T23:59:59Z'))).toBe('2026-08');
        expect(monthOf(new Date('2026-09-01T00:00:00Z'))).toBe('2026-09');
    });
});
