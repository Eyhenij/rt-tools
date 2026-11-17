import { rtChartIsEmpty } from './rt-chart.empty';
import { IRtChartColors, rtChartColorsKey, rtChartReadColors, rtChartTheme } from './rt-chart.theme';

function styleWith(values: Readonly<Record<string, string>>): CSSStyleDeclaration {
    return { getPropertyValue: (name: string): string => values[name] ?? '' } as CSSStyleDeclaration;
}

const SERIES: Readonly<Record<string, string>> = {
    '--rt-color-chart-series-1': ' #155dfc',
    '--rt-color-chart-series-2': '#eb6834',
    '--rt-color-text-primary': '#111',
    '--rt-color-text-muted': '#666',
    '--rt-color-border-subtle': '#ddd',
    '--rt-color-bg-surface': '#fff',
    '--rt-font-family-sans': 'Inter',
};

describe('rtChartIsEmpty', (): void => {
    it('SC-UKV-1333 — опция без серий пуста', (): void => {
        expect(rtChartIsEmpty({ xAxis: {} })).toBe(true);
    });

    it('SC-UKV-1333 — серии без единой точки пусты', (): void => {
        expect(rtChartIsEmpty({ series: [{ type: 'line', data: [] }, { type: 'bar' }] })).toBe(true);
    });

    it('SC-UKV-1333 — одна точка в одной серии — уже не пусто', (): void => {
        expect(
            rtChartIsEmpty({
                series: [
                    { type: 'line', data: [] },
                    { type: 'bar', data: [2] },
                ],
            })
        ).toBe(false);
    });

    it('SC-UKV-1333 — серия без data берёт точки из набора данных', (): void => {
        expect(rtChartIsEmpty({ dataset: { source: [['a', 1]] }, series: { type: 'bar' } })).toBe(false);
        expect(rtChartIsEmpty({ dataset: { source: [] }, series: { type: 'bar' } })).toBe(true);
    });
});

describe('rtChartReadColors', (): void => {
    it('SC-UKV-1336 — берёт восемь цветов серий и цвета подписей с узла, без пробелов', (): void => {
        const colors: IRtChartColors = rtChartReadColors(styleWith(SERIES));

        expect(colors.series.length).toBe(8);
        expect(colors.series.slice(0, 2)).toEqual(['#155dfc', '#eb6834']);
        expect(colors.surface).toBe('#fff');
    });

    it('SC-UKV-1336 — ключ расходится, когда разошёлся хоть один цвет', (): void => {
        const light: IRtChartColors = rtChartReadColors(styleWith(SERIES));
        const dark: IRtChartColors = rtChartReadColors(styleWith({ ...SERIES, '--rt-color-chart-series-1': '#4e84f2' }));

        expect(rtChartColorsKey(light)).toBe(rtChartColorsKey(rtChartReadColors(styleWith(SERIES))));
        expect(rtChartColorsKey(light)).not.toBe(rtChartColorsKey(dark));
    });
});

describe('rtChartTheme', (): void => {
    it('SC-UKV-1331 — палитра серий идёт в цвета темы по порядку', (): void => {
        const theme: Record<string, unknown> = rtChartTheme(rtChartReadColors(styleWith(SERIES)));

        expect((theme['color'] as string[]).slice(0, 2)).toEqual(['#155dfc', '#eb6834']);
        expect(theme['backgroundColor']).toBe('transparent');
    });
});
