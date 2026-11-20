import { ApplicationRef, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtChartComponent } from '../../../../lib/components/chart/rt-chart.component';
import { TRtKitTranslator } from '../../../../lib/i18n/rt-kit-labels.model';
import { RT_KIT_LOCALE, RT_KIT_TRANSLATOR } from '../../../../lib/i18n/rt-kit-labels.providers';
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

    describe('the data table', (): void => {
        function toggleOf(fixture: ComponentFixture<unknown>): HTMLButtonElement {
            return qa(fixture, 'ai-chat-chart-toggle')?.nativeElement as HTMLButtonElement;
        }

        function press(fixture: ComponentFixture<unknown>): void {
            toggleOf(fixture).click();
            fixture.detectChanges();
        }

        function tableOf(fixture: ComponentFixture<unknown>): HTMLTableElement | null {
            return (fixture.nativeElement as HTMLElement).querySelector('table');
        }

        it('SC-UKV-1531 — the table is hidden until the switch is pressed', async (): Promise<void> => {
            const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
            const toggle: HTMLButtonElement = toggleOf(fixture);

            expect(textOf(toggle)).toBe('View data');
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
            expect(toggle.getAttribute('aria-controls')).toMatch(/^rt-ai-chat-chart-data-\d+$/);
            expect(tableOf(fixture)).toBeNull();
        });

        it('SC-UKV-1532 — the switch shows and hides the table it controls', async (): Promise<void> => {
            const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);

            press(fixture);
            const table: HTMLTableElement | null = tableOf(fixture);

            expect(toggleOf(fixture).getAttribute('aria-expanded')).toBe('true');
            expect(textOf(toggleOf(fixture))).toBe('Hide data');
            expect(table?.id).toBe(toggleOf(fixture).getAttribute('aria-controls'));
            expect(table?.getAttribute('aria-label')).toBe('Revenue by month');
            expect(
                Array.from(table?.querySelectorAll('thead th') ?? []).map((cell: Element): string => cell.textContent?.trim() ?? '')
            ).toEqual(['Month', 'Revenue']);
            expect(table?.querySelectorAll('tbody tr')).toHaveLength(2);
            expect(table?.querySelector('tbody th')?.getAttribute('scope')).toBe('row');

            press(fixture);

            expect(tableOf(fixture)).toBeNull();
            expect(toggleOf(fixture).getAttribute('aria-expanded')).toBe('false');
        });

        it('SC-UKV-1385 — a new drawing of the block starts with the table hidden', async (): Promise<void> => {
            const first: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
            press(first);

            const again: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);

            expect(tableOf(again)).toBeNull();
            expect(toggleOf(again).getAttribute('aria-expanded')).toBe('false');
        });

        it('SC-UKV-1386 — the pending, the invalid and the empty block have no switch', async (): Promise<void> => {
            const pending: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE, true);
            const pendingHas: boolean = qa(pending, 'ai-chat-chart-toggle') !== null;
            const invalid: ComponentFixture<RtAiChatChartComponent> = await draw('{"kind":"line"');
            const invalidHas: boolean = qa(invalid, 'ai-chat-chart-toggle') !== null;
            const empty: ComponentFixture<RtAiChatChartComponent> = await draw({ ...REVENUE, series: [{ name: 'Revenue', points: [] }] });

            expect([pendingHas, invalidHas, qa(empty, 'ai-chat-chart-toggle') !== null]).toEqual([false, false, false]);
        });

        it('SC-UKV-1538 — another spec in the input closes the table, a re-render of the same one keeps it', async (): Promise<void> => {
            const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
            press(fixture);

            fixture.componentRef.setInput('block', chartBlock({ ...REVENUE }));
            fixture.detectChanges();
            const keptOpen: boolean = tableOf(fixture) !== null;

            fixture.componentRef.setInput('block', chartBlock({ ...REVENUE, title: 'Costs' }));
            fixture.detectChanges();

            expect(keptOpen).toBe(true);
            expect(tableOf(fixture)).toBeNull();
            expect(toggleOf(fixture).getAttribute('aria-expanded')).toBe('false');
        });

        it('SC-UKV-1536 — the open table follows a change of the kit locale', async (): Promise<void> => {
            const russian: Readonly<Record<string, string>> = { aiChartHideData: 'Скрыть данные', aiChartShowData: 'Показать данные' };
            const translator: WritableSignal<TRtKitTranslator> = signal<TRtKitTranslator>((): string => '');
            const locale: WritableSignal<string> = signal<string>('en');
            const spec: IRtAiChatChart.Spec = { ...REVENUE, series: [{ name: 'Revenue', points: [{ x: 'Jan', y: 1234.5 }] }] };
            const fixture: ComponentFixture<RtAiChatChartComponent> = createRtFixture(
                RtAiChatChartComponent,
                { block: chartBlock(spec) },
                {
                    providers: [
                        { provide: RT_KIT_TRANSLATOR, useValue: translator },
                        { provide: RT_KIT_LOCALE, useValue: locale },
                    ],
                }
            );
            await fixture.whenStable();
            fixture.detectChanges();
            press(fixture);
            const before: string = tableOf(fixture)?.querySelector('tbody td')?.textContent?.trim() ?? '';

            translator.set((key: string): string => russian[key] ?? '');
            locale.set('ru');
            fixture.detectChanges();

            expect(before).toBe(new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(1234.5));
            expect(tableOf(fixture)?.querySelector('tbody td')?.textContent?.trim()).toBe(
                new Intl.NumberFormat('ru', { maximumFractionDigits: 2 }).format(1234.5)
            );
            expect(textOf(toggleOf(fixture))).toBe('Скрыть данные');
        });

        it('SC-UKV-1537 — the full-screen dialog has neither the switch nor the table', async (): Promise<void> => {
            const fixture: ComponentFixture<RtAiChatChartComponent> = await draw(REVENUE);
            const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
            press(fixture);

            controlOf(fixture, 'ai-chat-chart-full-screen').click();
            appRef.tick();
            await fixture.whenStable();
            const dialog: Element | null =
                document.querySelector('[qa-dataid="ai-chat-chart-dialog-plot"]')?.closest('[role="dialog"]') ?? null;

            expect(dialog).not.toBeNull();
            expect(dialog?.querySelector('[qa-dataid="ai-chat-chart-toggle"]')).toBeNull();
            expect(dialog?.querySelector('table')).toBeNull();
        });

        it('SC-UKV-1535 — the copy of the answer is the same with the table open', async (): Promise<void> => {
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
            const closed: string | undefined = renderer?.toText?.(answer[0]);

            press(fixture);

            expect(tableOf(fixture)).not.toBeNull();
            expect(renderer?.toText?.(answer[0])).toBe(closed);
        });
    });
});
