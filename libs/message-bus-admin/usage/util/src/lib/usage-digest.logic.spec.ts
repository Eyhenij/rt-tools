import { IRtBarList } from '@rt-tools/ui-kit-v2';

import { deniedSkillRows, IUsageChartBar, kindRows, quickPeriod, quickPeriodOf, topSkillRows, usageChartBars } from './usage-digest.logic';
import { UsageDigestMapper } from './usage.mapper';
import { ESkillKind, IUsage } from './usage.model';

const NOW: Date = new Date('2026-09-15T10:00:00.000Z');

function row(patch: Partial<IUsage.Row.State> = {}): IUsage.Row.State {
    return { skill: 'testing', kind: ESkillKind.Rule, loads: 4, sessions: 2, denials: 1, ...patch };
}

describe('сводка периода', () => {
    it('SC-MB-357 — столбики графика: высота от самого высокого дня, день без загрузок — ноль, подпись число и месяц', () => {
        const bars: readonly IUsageChartBar[] = usageChartBars([
            { day: '2026-08-12', loads: 4, sessions: 2, denials: 1 },
            { day: '2026-08-13', loads: 1, sessions: 1, denials: 0 },
            { day: '2026-08-14', loads: 0, sessions: 0, denials: 0 },
        ]);

        expect(bars.map((bar: IUsageChartBar): number => bar.heightPercent)).toEqual([100, 25, 0]);
        expect(bars[0].label).toBe('12.08');
        expect(bars[0].hint).toContain('Загрузок 4');
        expect(bars[0].hint).toContain('Отказов 1');
    });

    it('SC-MB-357 — строки списков: доля от лидера, род подписью словаря, значение строкой', () => {
        const top: readonly IRtBarList.Row[] = topSkillRows([row(), row({ skill: 'lists', kind: ESkillKind.Pattern, loads: 1 })]);
        const kinds: readonly IRtBarList.Row[] = kindRows([{ kind: ESkillKind.Own, loads: 2 }]);
        const denied: readonly IRtBarList.Row[] = deniedSkillRows([row({ denials: 3 })]);

        expect(top.map((entry: IRtBarList.Row): number => entry.sharePercent)).toEqual([100, 25]);
        expect(top[1]).toMatchObject({ id: 'lists', meta: 'паттерн', value: '1' });
        expect(kinds[0]).toMatchObject({ title: 'свой скил проекта', value: '2', sharePercent: 100 });
        expect(denied[0]).toMatchObject({ id: 'testing', value: '3' });
    });

    it('SC-MB-358 — быстрый период считается от сегодняшнего дня включительно и узнаётся в адресе', () => {
        expect(quickPeriod(7, NOW)).toEqual({ from: '2026-09-09', to: '2026-09-15' });
        expect(quickPeriod(30, NOW)).toEqual({ from: '2026-08-17', to: '2026-09-15' });
        expect(quickPeriodOf({ from: '2026-08-17', to: '2026-09-15' }, NOW)).toBe(30);
        expect(quickPeriodOf({ from: '2026-08-12', to: '2026-08-13' }, NOW)).toBeUndefined();
    });

    it('сводка ответа переводится целиком, а список не списком читается пустым', () => {
        const digest: IUsage.Digest.State = new UsageDigestMapper().mapFrom({
            from: '2026-08-12',
            to: '2026-08-13',
            days: [{ day: '2026-08-12', loads: 1, sessions: 1, denials: 0 }],
            kinds: [{ kind: 'rule', loads: 1 }],
            top: [{ skill: 'testing', kind: 'rule', loads: 1, sessions: 1, denials: 0 }],
            denied: undefined as unknown as [],
        });

        expect(digest.days[0].loads).toBe(1);
        expect(digest.kinds[0].kind).toBe(ESkillKind.Rule);
        expect(digest.top[0].skill).toBe('testing');
        expect(digest.denied).toEqual([]);
    });
});
