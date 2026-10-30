import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective } from './rt-toolbar.component';

/** Ширина места подменяется: отборы решают по признаку узкого места службы кита. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(true);
    public readonly phone: WritableSignal<boolean> = signal(true);
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);

    public registerPlace(): void {
        return;
    }
}

@Component({
    selector: 'rt-toolbar-filters-host',
    template: `
        <rt-toolbar [filtersActive]="active()" (filtersApply)="applied = applied + 1" (filtersReset)="resets = resets + 1">
            <ng-template rtToolbarFilters let-place>
                <span qa-dataid="slot-filter" [attr.data-place]="place">Статус</span>
            </ng-template>
            <ng-template rtToolbarRight><button type="button" qa-dataid="slot-right">Ещё</button></ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective],
})
class ToolbarFiltersHostComponent {
    public readonly active: WritableSignal<boolean> = signal(false);
    public applied: number = 0;
    public resets: number = 0;
}

function setup(narrow: boolean): { fixture: ComponentFixture<ToolbarFiltersHostComponent>; breakpoints: StubBreakpointsService } {
    const breakpoints: StubBreakpointsService = new StubBreakpointsService();
    breakpoints.narrow.set(narrow);
    breakpoints.phone.set(narrow);
    TestBed.configureTestingModule({
        providers: [...provideRtKitTesting(), { provide: BreakpointsService, useValue: breakpoints }],
    });
    const fixture: ComponentFixture<ToolbarFiltersHostComponent> = TestBed.createComponent(ToolbarFiltersHostComponent);
    fixture.detectChanges();

    return { fixture, breakpoints };
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function trigger(fixture: ComponentFixture<unknown>): HTMLElement | null {
    return root(fixture).querySelector('[qa-dataid="toolbar-filters-trigger"]');
}

function panel(): HTMLElement | null {
    return document.querySelector('.rt-toolbar-filters-aside');
}

function press(target: Element | null): void {
    (target?.querySelector('button') ?? (target as HTMLElement | null))?.click();
}

async function settle(fixture: ComponentFixture<unknown>, ms: number = 0): Promise<void> {
    fixture.detectChanges();
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, ms);
    });
    await fixture.whenStable();
    fixture.detectChanges();
}

async function openPanel(fixture: ComponentFixture<unknown>): Promise<void> {
    press(trigger(fixture));
    await settle(fixture);
}

describe('RtToolbarComponent — отборы за кнопкой', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1086 — на узком месте отборы стоят за одной кнопкой, первой в ряду кнопок', (): void => {
        const { fixture } = setup(true);
        const right: HTMLElement | null = root(fixture).querySelector('[data-slot="right"]');

        expect(root(fixture).querySelector('[qa-dataid="slot-filter"]')).toBeNull();
        expect(right?.firstElementChild?.getAttribute('qa-dataid')).toBe('toolbar-filters-trigger');
        expect(root(fixture).querySelector('rt-toolbar')?.classList).toContain('rt-toolbar--filters-collapsed');
    });

    it('SC-UKV-1087 — на широком месте отборы стоят в левой секции, кнопки нет', (): void => {
        const { fixture } = setup(false);
        const filter: HTMLElement | null = root(fixture).querySelector('[data-slot="left"] [qa-dataid="slot-filter"]');

        expect(filter?.getAttribute('data-place')).toBe('bar');
        expect(trigger(fixture)).toBeNull();
    });

    it('SC-UKV-1087 — смена ширины переносит отборы между полосой и кнопкой', (): void => {
        const { fixture, breakpoints } = setup(false);
        breakpoints.narrow.set(true);
        fixture.detectChanges();

        expect(root(fixture).querySelector('[qa-dataid="slot-filter"]')).toBeNull();
        expect(trigger(fixture)).not.toBeNull();
    });

    it('SC-UKV-1088 — включённый отбор ставит точку на кнопку фильтров', (): void => {
        const { fixture } = setup(true);
        expect(trigger(fixture)?.querySelector('.rt-icon-button__indicator')).toBeNull();

        fixture.componentInstance.active.set(true);
        fixture.detectChanges();

        expect(trigger(fixture)?.querySelector('.rt-icon-button__indicator')).not.toBeNull();
    });

    it('SC-UKV-1089 — кнопка открывает панель «Фильтры» со слотом отборов в ней', async (): Promise<void> => {
        const { fixture } = setup(true);
        await openPanel(fixture);

        expect(textOf(panel()?.querySelector('[qa-dataid="aside-title"]') ?? null)).toBe('Filters');
        expect(panel()?.querySelector('[qa-dataid="aside-back"]')).not.toBeNull();
        expect(panel()?.querySelector('[qa-dataid="aside-overline"]')).toBeNull();
        expect(panel()?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
        expect(textOf(panel()?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null)).toBe('Reset');
        expect(textOf(panel()?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null)).toBe('Apply');
    });

    it('SC-UKV-1090 — «Сбросить» сообщает и оставляет панель, «Применить» сообщает и закрывает', async (): Promise<void> => {
        const { fixture } = setup(true);
        await openPanel(fixture);

        press(panel()?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null);
        fixture.detectChanges();
        expect(fixture.componentInstance.resets).toBe(1);
        expect(panel()).not.toBeNull();

        press(panel()?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null);
        await settle(fixture, 300);
        expect(fixture.componentInstance.applied).toBe(1);
        expect(panel()).toBeNull();
    });

    it('SC-UKV-1090 — стрелка возврата закрывает панель молча', async (): Promise<void> => {
        const { fixture } = setup(true);
        await openPanel(fixture);

        press(panel()?.querySelector('[qa-dataid="aside-back"]') ?? null);
        await settle(fixture, 300);

        expect(panel()).toBeNull();
        expect(fixture.componentInstance.applied).toBe(0);
        expect(fixture.componentInstance.resets).toBe(0);
    });

    it('SC-UKV-1092 — подвал панели на телефоне оставляет «Сбросить», а не «Закрыть»', async (): Promise<void> => {
        const { fixture } = setup(true);
        await openPanel(fixture);

        expect(textOf(panel()?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null)).toBe('Reset');
    });

    it('без слота отборов кнопки фильтров нет', (): void => {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        const fixture: ComponentFixture<RtToolbarComponent> = TestBed.createComponent(RtToolbarComponent);
        fixture.detectChanges();

        expect(qa(fixture, 'toolbar-filters-trigger')).toBeNull();
    });
});
