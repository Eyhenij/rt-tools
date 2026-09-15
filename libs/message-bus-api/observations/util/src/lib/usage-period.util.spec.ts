import { describe, expect, it } from 'vitest';

import { defaultUsagePeriod, periodDays, usagePeriodFault, usagePeriodOf, usageTreeOf } from './usage-period.util';

const NOW: Date = new Date('2026-09-14T10:00:00.000Z');

describe('период чтения использования', () => {
    it('SC-MB-344 — период длиннее четырёхсот дней отбивается, ровно четыреста — годен', () => {
        expect(usagePeriodFault({ from: '2025-08-10', to: '2026-09-14' })).toContain('предела 400');
        expect(usagePeriodFault({ from: '2025-08-11', to: '2026-09-14' })).toBeNull();
        expect(periodDays({ from: '2025-08-11', to: '2026-09-14' })).toBe(400);
    });

    it('SC-MB-344 — период без дня, с чужой формой дня или перевёрнутый — отказ с именем параметра', () => {
        expect(usagePeriodFault({ from: '2026-09-01' })).toContain('`to`');
        expect(usagePeriodFault({ from: '01.09.2026', to: '2026-09-14' })).toContain('ГГГГ-ММ-ДД');
        expect(usagePeriodFault({ from: '2026-09-14', to: '2026-09-01' })).toContain('раньше');
        expect(usagePeriodFault({ from: '2026-09-01', to: '2026-09-01' })).toBeNull();
    });

    it('SC-MB-353 — период, которого запрос не назвал, — последние тридцать дней по часам приёмника', () => {
        expect(usagePeriodFault({})).toBeNull();
        expect(usagePeriodFault({ from: '', to: '' })).toBeNull();
        expect(usagePeriodOf({}, NOW)).toEqual({ from: '2026-08-16', to: '2026-09-14' });
        expect(defaultUsagePeriod(NOW)).toEqual({ from: '2026-08-16', to: '2026-09-14' });
        expect(periodDays(defaultUsagePeriod(NOW))).toBe(30);
    });

    it('SC-MB-353 — один день из двух — отказ, а не умолчание', () => {
        expect(usagePeriodFault({ to: '2026-09-14' })).toContain('`from`');
        expect(usagePeriodFault({ from: '2026-09-01', to: '' })).toContain('`to`');
    });

    it('SC-MB-343 — период и дерево читаются из запроса как есть', () => {
        expect(usagePeriodOf({ from: '2026-09-01', to: '2026-09-14' }, NOW)).toEqual({ from: '2026-09-01', to: '2026-09-14' });
        expect(usageTreeOf({ tree: ' own-tree ' })).toBe('own-tree');
        expect(usageTreeOf({})).toBe('');
    });
});
