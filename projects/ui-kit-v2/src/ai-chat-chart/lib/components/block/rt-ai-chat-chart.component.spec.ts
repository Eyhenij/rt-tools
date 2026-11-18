import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtChartComponent } from '../../../../lib/components/chart/rt-chart.component';
import { RtAiChatBlocksComponent } from '../../../../rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.component';
import { RT_AI_CHAT_BLOCK_RENDERERS } from '../../../../rich-editor/lib/components/ai-chat/blocks/rt-ai-chat-blocks.providers';
import { IRtAiChat } from '../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { ERtAiChatChartKind } from '../../ai-chat-chart.enum';
import { IRtAiChatChart } from '../../ai-chat-chart.model';
import { provideRtAiChatChart } from '../../ai-chat-chart.providers';
import { RtAiChatChartComponent } from './rt-ai-chat-chart.component';

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

let width: number = 0;

const REVENUE: IRtAiChatChart.Spec = {
    kind: ERtAiChatChartKind.LINE,
    title: 'Revenue by month',
    subtitle: 'October 2026',
    xLabel: 'Month',
    yLabel: 'Revenue',
    series: [
        {
            name: 'Revenue',
            points: [
                { x: 'Jan', y: 3 },
                { x: 'Feb', y: 5 },
            ],
        },
    ],
};

function chartBlock(spec: unknown, pending?: boolean): IRtAiChatChart.Block {
    return pending ? { type: 'chart', spec, pending } : { type: 'chart', spec };
}

async function draw(spec: unknown, pending?: boolean): Promise<ComponentFixture<RtAiChatChartComponent>> {
    const fixture: ComponentFixture<RtAiChatChartComponent> = createRtFixture(RtAiChatChartComponent, { block: chartBlock(spec, pending) });
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

function layOut(fixture: ComponentFixture<unknown>): void {
    width = 386;
    ResizeDouble.resize();
    fixture.detectChanges();
}

function controlOf(fixture: ComponentFixture<unknown>, id: string): HTMLButtonElement {
    return (qa(fixture, id)?.nativeElement as HTMLElement).querySelector('[qa-dataid="icon-button-control"]') as HTMLButtonElement;
}

describe('RtAiChatChartComponent', (): void => {
    let widthOf: PropertyDescriptor | undefined;
    let heightOf: PropertyDescriptor | undefined;

    beforeEach((): void => {
        width = 0;
        widthOf = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
        heightOf = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: (): number => width });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: (): number => (width ? 188 : 0) });
        Object.defineProperty(window, 'ResizeObserver', { value: ResizeDouble, configurable: true, writable: true });
    });

    afterEach((): void => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', widthOf ?? { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', heightOf ?? { configurable: true, value: 0 });
        ResizeDouble.all = [];
        jest.restoreAllMocks();
    });

    it('SC-UKV-1350 — a pending block shows the placeholder, never the notice', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw('{"kind":"line","series":[{"na', true);

        expect(textOf(qa(fixture, 'ai-chat-chart-placeholder'))).toBe('Drawing the chart…');
        expect(qa(fixture, 'ai-chat-chart-invalid')).toBeNull();
    });

    it('SC-UKV-1348 — a spec that does not parse shows the notice in place of the chart', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw('{"kind":"line","series":[{"na');

        expect(textOf(qa(fixture, 'ai-chat-chart-invalid'))).toBe('The chart could not be drawn');
        expect(qa(fixture, 'ai-chat-chart-plot')).toBeNull();
    });

    it('SC-UKV-1349 — a spec of an unknown kind shows the notice', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw({ kind: 'radar', series: [] });

        expect(textOf(qa(fixture, 'ai-chat-chart-invalid'))).toBe('The chart could not be drawn');
    });

    it('SC-UKV-1351 — the title, the subtitle and both axis names stand around the chart', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
        const plot: HTMLElement = qa(fixture, 'ai-chat-chart-plot')?.nativeElement as HTMLElement;
        const order: string[] = Array.from(plot.children).map((node: Element): string => node.getAttribute('qa-dataid') ?? '');

        expect(textOf(qa(fixture, 'ai-chat-chart-title'))).toBe('Revenue by month');
        expect(textOf(qa(fixture, 'ai-chat-chart-subtitle'))).toBe('October 2026');
        expect(order).toEqual(['ai-chat-chart-y-label', 'ai-chat-chart-chart', 'ai-chat-chart-x-label']);
        expect(textOf(qa(fixture, 'ai-chat-chart-y-label'))).toBe('Revenue');
        expect(textOf(qa(fixture, 'ai-chat-chart-x-label'))).toBe('Month');
    });

    it('SC-UKV-1351 — a pie draws neither axis name', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw({ ...REVENUE, kind: ERtAiChatChartKind.PIE });

        expect(qa(fixture, 'ai-chat-chart-chart')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-chart-y-label')).toBeNull();
        expect(qa(fixture, 'ai-chat-chart-x-label')).toBeNull();
    });

    it('SC-UKV-1363 — a spec without values shows the empty state under the title, without buttons', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw({ ...REVENUE, series: [{ name: 'Revenue', points: [] }] });

        expect(textOf(qa(fixture, 'ai-chat-chart-title'))).toBe('Revenue by month');
        expect(qa(fixture, 'chart-empty')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-chart-full-screen')).toBeNull();
        expect(qa(fixture, 'ai-chat-chart-download')).toBeNull();
    });

    it('SC-UKV-1364 — no title and no subtitle leave only the two buttons in the row', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw({ kind: ERtAiChatChartKind.BAR, series: REVENUE.series });

        expect(qa(fixture, 'ai-chat-chart-full-screen')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-chart-download')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-chart-title')).toBeNull();
        expect(qa(fixture, 'ai-chat-chart-subtitle')).toBeNull();
    });

    it('SC-UKV-1365 — «Download PNG» is disabled until the chart is drawn', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);

        expect(controlOf(fixture, 'ai-chat-chart-download').disabled).toBe(true);

        layOut(fixture);

        expect(controlOf(fixture, 'ai-chat-chart-download').disabled).toBe(false);
    });

    it('SC-UKV-1357 — «Download PNG» saves the picture under the title', async (): Promise<void> => {
        const saved: string[] = [];
        jest.spyOn(RtChartComponent.prototype, 'toPng').mockResolvedValue('data:image/png;base64,AA==');
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement): void {
            saved.push(this.download);
        });
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
        layOut(fixture);

        controlOf(fixture, 'ai-chat-chart-download').click();
        await fixture.whenStable();

        expect(saved).toEqual(['Revenue-by-month.png']);
    });

    it('SC-UKV-1371 — the chart is named by the title, and by the kit label without one', async (): Promise<void> => {
        const titled: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
        layOut(titled);
        const named: string | null | undefined = (titled.nativeElement as HTMLElement)
            .querySelector('[qa-dataid="chart-plot"] svg')
            ?.getAttribute('aria-label');

        const untitled: ComponentFixture<RtAiChatChartComponent> = await draw({ ...REVENUE, title: undefined });
        layOut(untitled);

        expect(named).toBe('Revenue by month');
        expect((untitled.nativeElement as HTMLElement).querySelector('[qa-dataid="chart-plot"] svg')?.getAttribute('aria-label')).toBe(
            'Chart'
        );
    });

    it('SC-UKV-1356 — «Open full screen» opens the dialog, «Close» returns focus to the button', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
        const open: HTMLButtonElement = controlOf(fixture, 'ai-chat-chart-full-screen');

        open.focus();
        open.click();
        appRef.tick();
        await fixture.whenStable();

        expect(document.querySelector('[qa-dataid="dialog-title"]')?.textContent?.trim()).toBe('Revenue by month');
        expect(document.querySelector('[qa-dataid="ai-chat-chart-dialog-download"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="ai-chat-chart-dialog-plot"]')).not.toBeNull();

        (document.querySelector('[qa-dataid="dialog-close"] [qa-dataid="icon-button-control"]') as HTMLButtonElement).click();
        appRef.tick();
        await fixture.whenStable();

        expect(document.querySelector('[qa-dataid="dialog-title"]')).toBeNull();
        expect(document.activeElement).toBe(open);
    });

    it('SC-UKV-1373 — one provider draws the block in the answer feed and gives its copy text', async (): Promise<void> => {
        const answer: readonly IRtAiChat.Block[] = [{ type: 'chart', spec: JSON.stringify(REVENUE) }];
        const fixture: ComponentFixture<RtAiChatBlocksComponent> = createRtFixture(
            RtAiChatBlocksComponent,
            { blocks: answer },
            { providers: [provideRtAiChatChart()] }
        );
        await fixture.whenStable();
        fixture.detectChanges();
        const renderer: IRtAiChat.BlockRenderer | undefined = TestBed.inject(RT_AI_CHAT_BLOCK_RENDERERS).find(
            (one: IRtAiChat.BlockRenderer): boolean => one.type === 'chart'
        );

        expect(qa(fixture, 'ai-chat-chart-chart')).not.toBeNull();
        expect(qa(fixture, 'ai-chat-block-unsupported')).toBeNull();
        expect(renderer?.toText?.(answer[0])).toBe('Revenue by month\nOctober 2026\nRevenue: Jan — 3; Feb — 5');
    });
});
