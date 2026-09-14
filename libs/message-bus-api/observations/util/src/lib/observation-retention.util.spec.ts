import { describe, expect, it } from 'vitest';

import { keepSince, nextSweepAt } from './observation-retention.util';

describe('срок хранения строк наблюдений', () => {
    it('SC-MB-342 — граница хранения — день год назад по всемирному времени', () => {
        expect(keepSince(new Date('2026-09-14T12:00:00Z'))).toBe('2025-09-14');
        expect(keepSince(new Date('2026-09-14T12:00:00Z'), 30)).toBe('2026-08-15');
    });

    it('SC-MB-342 — ближайшее снятие — сегодня до его часа, завтра после', () => {
        expect(nextSweepAt(new Date('2026-09-14T01:00:00Z')).toISOString()).toBe('2026-09-14T03:10:00.000Z');
        expect(nextSweepAt(new Date('2026-09-14T03:10:00Z')).toISOString()).toBe('2026-09-15T03:10:00.000Z');
        expect(nextSweepAt(new Date('2026-09-14T23:59:00Z')).toISOString()).toBe('2026-09-15T03:10:00.000Z');
    });
});
