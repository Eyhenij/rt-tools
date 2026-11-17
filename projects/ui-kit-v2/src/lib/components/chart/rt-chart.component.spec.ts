import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { EChartsCoreOption } from 'echarts/core';

import { ThemeService } from '../../platform';
import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtChartComponent } from './rt-chart.component';
import { RT_CHART_ECHARTS } from './rt-chart.registry';

const LIGHT_FIRST: string = '#155dfc';
const DARK_FIRST: string = '#4e84f2';

/** Цвета кита на узле графика: светлая тема и тёмная. В jsdom нет собранного набора токенов. */
const TOKENS_CSS: string = `
    .rt-chart { --rt-color-chart-series-1: ${LIGHT_FIRST}; --rt-color-chart-series-2: #eb6834; --rt-color-bg-surface: #ffffff; }
    [data-theme='dark'] .rt-chart { --rt-color-chart-series-1: ${DARK_FIRST}; --rt-color-chart-series-2: #d95926; --rt-color-bg-surface: #222629; }
`;

const LINE: EChartsCoreOption = {
    animation: false,
    xAxis: { type: 'category', data: ['Пн', 'Вт', 'Ср'] },
    yAxis: {},
    series: [{ type: 'line', data: [3, 5, 4] }],
};

/** Наблюдатель размеров: срабатывает по вызову теста, а не по раскладке, которой в jsdom нет. */
class ResizeDouble implements ResizeObserver {
    public static all: ResizeDouble[] = [];

    constructor(private readonly callback: ResizeObserverCallback) {
        ResizeDouble.all.push(this);
    }

    public observe(): void {}

    public unobserve(): void {}

    public disconnect(): void {
        ResizeDouble.all = ResizeDouble.all.filter((watch: ResizeDouble): boolean => watch !== this);
    }

    public static resize(): void {
        ResizeDouble.all.forEach((watch: ResizeDouble): void => watch.callback([], watch));
    }
}

let width: number = 600;

function stubLayout(): () => void {
    const style: HTMLStyleElement = document.createElement('style');
    style.textContent = TOKENS_CSS;
    document.head.appendChild(style);

    const widthOf: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    const heightOf: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: (): number => width });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: (): number => (width ? 320 : 0) });
    Object.defineProperty(window, 'ResizeObserver', { value: ResizeDouble, configurable: true, writable: true });

    return (): void => {
        style.remove();
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', widthOf ?? { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', heightOf ?? { configurable: true, value: 0 });
        ResizeDouble.all = [];
        document.documentElement.removeAttribute('data-theme');
    };
}

/** Директива создаёт график в отложенном вызове: ждём его и перерисовку. */
async function settle(fixture: ComponentFixture<RtChartComponent>): Promise<void> {
    for (let round: number = 0; round < 3; round++) {
        fixture.detectChanges();
        await new Promise((resolve: (value: unknown) => void): unknown => setTimeout(resolve, 0));
        await fixture.whenStable();
    }
}

/** SVG самого графика; у заглушки своя иконка в SVG, она сюда не попадает. */
function svgOf(fixture: ComponentFixture<RtChartComponent>): SVGSVGElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="chart-plot"] svg');
}

describe('RtChartComponent', (): void => {
    let restore: () => void;

    beforeAll((): void => {
        RT_CHART_ECHARTS.setPlatformAPI({ measureText: (text: string): { width: number } => ({ width: text.length * 7 }) });
    });

    beforeEach((): void => {
        width = 600;
        restore = stubLayout();
    });

    afterEach((): void => restore());

    it('SC-UKV-1331 — рисует серию путём SVG в первом цвете палитры', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { option: LINE });
        await settle(fixture);

        expect(qa(fixture, 'chart-plot')).not.toBeNull();
        expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${LIGHT_FIRST}"`);
    });

    it('SC-UKV-1332 — новая опция сливается с нарисованным графиком без пересоздания', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { option: LINE });
        await settle(fixture);
        const before: SVGSVGElement | null = svgOf(fixture);

        fixture.componentRef.setInput('option', { series: [{ type: 'line', data: [9, 1, 7] }] });
        await settle(fixture);

        expect(before).not.toBeNull();
        expect(svgOf(fixture)).toBe(before);
        expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${LIGHT_FIRST}"`);
    });

    it('SC-UKV-1333 — опция без точек показывает заглушку вместо осей', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, {
            option: { xAxis: { type: 'category' }, yAxis: {}, series: [{ type: 'bar', data: [] }] },
        });
        await settle(fixture);

        expect(qa(fixture, 'chart-plot')).toBeNull();
        expect(svgOf(fixture)).toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data for the chart');
        expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Data appears once the period has records');
    });

    it('SC-UKV-1334 — PNG: null до отрисовки, адрес данных PNG после', async (): Promise<void> => {
        width = 0;
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { option: LINE });
        await settle(fixture);

        await expect(fixture.componentInstance.toPng()).resolves.toBeNull();

        const context: Partial<CanvasRenderingContext2D> = { fillRect: jest.fn(), drawImage: jest.fn(), fillStyle: '' };
        const getContext: jest.SpyInstance = jest
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValue(context as CanvasRenderingContext2D);
        const toDataURL: jest.SpyInstance = jest
            .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
            .mockReturnValue('data:image/png;base64,AAAA');
        const src: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            configurable: true,
            set(this: HTMLImageElement): void {
                setTimeout((): void => this.onload?.(new Event('load')));
            },
        });

        try {
            width = 600;
            ResizeDouble.resize();
            await settle(fixture);

            await expect(fixture.componentInstance.toPng()).resolves.toBe('data:image/png;base64,AAAA');
            expect(context.fillStyle).toBe('#ffffff');
        } finally {
            getContext.mockRestore();
            toDataURL.mockRestore();
            Object.defineProperty(HTMLImageElement.prototype, 'src', src ?? { configurable: true, value: '' });
        }
    });

    it('SC-UKV-1335 — в контейнере нулевой ширины график ждёт ширину и рисуется', async (): Promise<void> => {
        width = 0;
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { option: LINE });
        await settle(fixture);

        expect(qa(fixture, 'chart-plot')).toBeNull();

        width = 600;
        ResizeDouble.resize();
        await settle(fixture);

        expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${LIGHT_FIRST}"`);
    });

    it('SC-UKV-1336 — тёмное поддерево даёт тёмную палитру', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(
            RtChartComponent,
            { option: LINE },
            { skipInitialDetect: true }
        );
        const island: HTMLElement = document.createElement('div');
        island.setAttribute('data-theme', 'dark');
        island.appendChild(fixture.nativeElement as HTMLElement);
        document.body.appendChild(island);

        try {
            await settle(fixture);

            expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${DARK_FIRST}"`);
        } finally {
            island.remove();
        }
    });

    it('SC-UKV-1336 — смена темы перерисовывает график в цветах новой темы', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { option: LINE });
        await settle(fixture);
        expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${LIGHT_FIRST}"`);

        TestBed.inject(ThemeService).toggle();
        await settle(fixture);

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(svgOf(fixture)?.innerHTML).toContain(`stroke="${DARK_FIRST}"`);
    });
});
