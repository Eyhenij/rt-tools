import { ComponentFixture } from '@angular/core/testing';

import { ThemeService } from '../../platform';
import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtChartComponent } from './rt-chart.component';
import { IRtChart } from './rt-chart.model';

const SLOT_1: string = 'var(--rt-color-chart-series-1)';

const LINE: IRtChart.Cartesian = {
    kind: 'cartesian',
    categories: ['Пн', 'Вт', 'Ср'],
    series: [{ name: 'Выручка', type: 'line', values: [3, 5, 4] }],
};

const THREE: IRtChart.Cartesian = {
    kind: 'cartesian',
    categories: ['Пн', 'Вт'],
    series: [
        { name: 'План', type: 'bar', values: [3, 5] },
        { name: 'Факт', type: 'bar', values: [2, 4] },
        { name: 'Прогноз', type: 'line', values: [4, 6], mark: 'line' },
    ],
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
    const widthOf: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    const heightOf: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: (): number => width });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: (): number => (width ? 188 : 0) });
    Object.defineProperty(window, 'ResizeObserver', { value: ResizeDouble, configurable: true, writable: true });

    return (): void => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', widthOf ?? { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', heightOf ?? { configurable: true, value: 0 });
        ResizeDouble.all = [];
        document.documentElement.removeAttribute('data-theme');
    };
}

async function settle(fixture: ComponentFixture<RtChartComponent>): Promise<void> {
    for (let round: number = 0; round < 2; round++) {
        fixture.detectChanges();
        await fixture.whenStable();
    }
}

function svgOf(fixture: ComponentFixture<RtChartComponent>): SVGSVGElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="chart-plot"] svg');
}

function pathsOf(fixture: ComponentFixture<RtChartComponent>): SVGPathElement[] {
    return Array.from(svgOf(fixture)?.querySelectorAll<SVGPathElement>('path') ?? []);
}

/** Линии серий: путь без заливки с обводкой. */
function strokesOf(fixture: ComponentFixture<RtChartComponent>): SVGPathElement[] {
    return pathsOf(fixture).filter((path: SVGPathElement): boolean => path.style.fill === 'none' && path.style.stroke !== 'none');
}

describe('RtChartComponent', (): void => {
    let restore: () => void;

    beforeEach((): void => {
        width = 600;
        restore = stubLayout();
    });

    afterEach((): void => restore());

    it('SC-UKV-1331 — линия стоит путём SVG в цвете первого слота', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: LINE });
        await settle(fixture);

        const lines: SVGPathElement[] = strokesOf(fixture);

        expect(lines).toHaveLength(1);
        expect(lines[0].style.stroke).toBe(SLOT_1);
        expect(lines[0].getAttribute('d')).toMatch(/^M/);
    });

    it('SC-UKV-1332 — новые данные меняют путь, а узел SVG остаётся тем же', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: LINE });
        await settle(fixture);
        const svg: SVGSVGElement | null = svgOf(fixture);
        const before: string | null = strokesOf(fixture)[0].getAttribute('d');

        fixture.componentRef.setInput('data', { ...LINE, series: [{ ...LINE.series[0], values: [1, 9, 2] }] });
        await settle(fixture);

        expect(svg).not.toBeNull();
        expect(svgOf(fixture)).toBe(svg);
        expect(strokesOf(fixture)[0].getAttribute('d')).not.toBe(before);
    });

    it('SC-UKV-1333 — данные без значений показывают заглушку вместо поля', async (): Promise<void> => {
        const empty: IRtChart.Cartesian = { ...LINE, series: [{ ...LINE.series[0], values: [null, null, null] }] };
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: empty });
        await settle(fixture);

        expect(qa(fixture, 'chart-empty')).not.toBeNull();
        expect(qa(fixture, 'chart-plot')).toBeNull();
    });

    it('SC-UKV-1334 — PNG: null до отрисовки, адрес данных PNG после', async (): Promise<void> => {
        width = 0;
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: LINE });
        await settle(fixture);

        await expect(fixture.componentInstance.toPng()).resolves.toBeNull();

        const context: Partial<CanvasRenderingContext2D> = {
            fillRect: jest.fn(),
            drawImage: jest.fn(),
            scale: jest.fn(),
            beginPath: jest.fn(),
            roundRect: jest.fn(),
            fill: jest.fn(),
            fillText: jest.fn(),
            fillStyle: '',
        };
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
            expect(context.drawImage).toHaveBeenCalled();
            expect(context.fillText).toHaveBeenCalledWith('Выручка', expect.any(Number), expect.any(Number));
        } finally {
            getContext.mockRestore();
            toDataURL.mockRestore();
            Object.defineProperty(HTMLImageElement.prototype, 'src', src ?? { configurable: true, writable: true, value: '' });
        }
    });

    it('SC-UKV-1335 — в контейнере нулевой ширины поле пусто, с шириной — рисуется', async (): Promise<void> => {
        width = 0;
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: LINE });
        await settle(fixture);

        expect(svgOf(fixture)).not.toBeNull();
        expect(pathsOf(fixture)).toHaveLength(0);

        width = 600;
        ResizeDouble.resize();
        await settle(fixture);

        expect(strokesOf(fixture)).toHaveLength(1);
    });

    it('SC-UKV-1336 — цвета серий — токены палитры, смена темы узел SVG не пересоздаёт', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: LINE });
        const island: HTMLElement = document.createElement('div');
        island.setAttribute('data-theme', 'dark');
        document.body.appendChild(island);
        island.appendChild(fixture.nativeElement as HTMLElement);
        await settle(fixture);
        const svg: SVGSVGElement | null = svgOf(fixture);

        expect(strokesOf(fixture)[0].style.stroke).toBe(SLOT_1);

        fixture.debugElement.injector.get(ThemeService).toggle();
        await settle(fixture);

        expect(svg).not.toBeNull();
        expect(svgOf(fixture)).toBe(svg);
        expect(strokesOf(fixture)[0].style.stroke).toBe(SLOT_1);
        island.remove();
    });

    it('SC-UKV-1338 — указатель над категорией показывает её значения во всех сериях', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: THREE });
        await settle(fixture);
        const hits: SVGPathElement[] = pathsOf(fixture).filter((path: SVGPathElement): boolean => path.style.fill === 'transparent');

        expect(hits).toHaveLength(2);
        expect(qa(fixture, 'chart-tip')).toBeNull();

        hits[1].dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }));
        await settle(fixture);

        expect(textOf(qa(fixture, 'chart-tip'))).toBe('Вт\nПлан: 5\nФакт: 4\nПрогноз: 6');
    });

    it('SC-UKV-1339 — легенда: пункт на серию с именем и значком её цвета', async (): Promise<void> => {
        const fixture: ComponentFixture<RtChartComponent> = createRtFixture(RtChartComponent, { data: THREE });
        await settle(fixture);
        const items: HTMLElement[] = Array.from(
            (qa(fixture, 'chart-legend')?.nativeElement as HTMLElement | undefined)?.querySelectorAll<HTMLElement>('li') ?? []
        );
        const marks: HTMLElement[] = items.map((item: HTMLElement): HTMLElement => item.firstElementChild as HTMLElement);

        expect(items.map((item: HTMLElement): string => textOf(item))).toEqual(['План', 'Факт', 'Прогноз']);
        expect(marks.map((mark: HTMLElement): string => mark.style.backgroundColor)).toEqual([
            SLOT_1,
            'var(--rt-color-chart-series-2)',
            'var(--rt-color-chart-series-3)',
        ]);
        expect(marks[2].classList).toContain('rt-chart__mark--line');
        expect(marks[0].classList).not.toContain('rt-chart__mark--line');
    });
});
