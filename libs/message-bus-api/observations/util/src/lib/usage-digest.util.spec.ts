import { describe, expect, it } from 'vitest';

import { IUsageDayRow } from '@rt/message-bus-common';

import { usageDaysOf } from './usage-digest.util';

describe('дни сводки периода', () => {
    it('SC-MB-355 — каждый день периода получает строку, дни без строк — нули, порядок по дням', () => {
        const days: readonly IUsageDayRow[] = usageDaysOf({ from: '2026-08-11', to: '2026-08-14' }, [
            { day: '2026-08-13', loads: 1, sessions: 1, denials: 0 },
            { day: '2026-08-12', loads: 4, sessions: 2, denials: 2 },
        ]);

        expect(days.map((row: IUsageDayRow): string => row.day)).toEqual(['2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14']);
        expect(days[0]).toEqual({ day: '2026-08-11', loads: 0, sessions: 0, denials: 0 });
        expect(days[1]).toEqual({ day: '2026-08-12', loads: 4, sessions: 2, denials: 2 });
        expect(days[3].loads).toBe(0);
    });

    it('SC-MB-355 — период в один день — одна строка', () => {
        expect(usageDaysOf({ from: '2026-08-12', to: '2026-08-12' }, [])).toEqual([
            { day: '2026-08-12', loads: 0, sessions: 0, denials: 0 },
        ]);
    });
});
