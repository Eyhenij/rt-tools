import { InteractivityChecker } from '@angular/cdk/a11y';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { provideRtKitTesting, textOf } from '../../../testing/rt-kit-testing';
import { RtToolbarFiltersPanelComponent } from './filters-panel/rt-toolbar-filters-panel.component';
import { RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective } from './rt-toolbar.component';
import { IRtToolbar } from './rt-toolbar.model';

/** Ширина места подменяется: отборы решают по признаку «уже порога» службы кита. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(true);
    public readonly belowNarrow: Signal<boolean> = this.narrow;
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly phone: WritableSignal<boolean> = signal(false);
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);

    public registerPlace(): void {
        return;
    }
}

/** Страница приложения: полоса списка и панель отборов в маршруте приложения — два разных места. */
@Component({
    selector: 'rt-toolbar-filters-app-host',
    template: `
        @if (toolbarShown()) {
            <rt-toolbar
                [filtersPanel]="mode()"
                (filtersOpen)="opens = opens + 1"
                (filtersApply)="applied = applied + 1"
                (filtersReset)="resets = resets + 1">
                <ng-template rtToolbarFilters let-place>
                    <span qa-dataid="slot-filter" tabindex="0" [attr.data-place]="place">Статус</span>
                </ng-template>
                <ng-template rtToolbarRight><button type="button" qa-dataid="slot-right">Ещё</button></ng-template>
            </rt-toolbar>
        }
        @if (panelShown()) {
            <section qa-dataid="app-route">
                <rt-toolbar-filters-panel (dismiss)="dismisses = dismisses + 1" />
            </section>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective, RtToolbarFiltersPanelComponent],
})
class ToolbarFiltersAppHostComponent {
    public readonly mode: WritableSignal<IRtToolbar.TFiltersPanel> = signal<IRtToolbar.TFiltersPanel>('app');
    public readonly toolbarShown: WritableSignal<boolean> = signal(true);
    public readonly panelShown: WritableSignal<boolean> = signal(false);
    public opens: number = 0;
    public applied: number = 0;
    public resets: number = 0;
    public dismisses: number = 0;
}

const INTERACTIVITY: Pick<InteractivityChecker, 'isDisabled' | 'isVisible' | 'isFocusable' | 'isTabbable'> = {
    isDisabled: (): boolean => false,
    isVisible: (): boolean => true,
    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
};

function setup(narrow: boolean = true): { fixture: ComponentFixture<ToolbarFiltersAppHostComponent>; breakpoints: StubBreakpointsService } {
    const breakpoints: StubBreakpointsService = new StubBreakpointsService();
    breakpoints.narrow.set(narrow);
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            { provide: BreakpointsService, useValue: breakpoints },
            // jsdom не раскладывает страницу, и ловушка фокуса без подмены не видит ни одной кнопки
            { provide: InteractivityChecker, useValue: INTERACTIVITY },
        ],
    });
    const fixture: ComponentFixture<ToolbarFiltersAppHostComponent> = TestBed.createComponent(ToolbarFiltersAppHostComponent);
    fixture.detectChanges();

    return { fixture, breakpoints };
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function trigger(fixture: ComponentFixture<unknown>): HTMLElement | null {
    return root(fixture).querySelector('[qa-dataid="toolbar-filters-trigger"]');
}

function route(fixture: ComponentFixture<unknown>): HTMLElement | null {
    return root(fixture).querySelector('[qa-dataid="app-route"]');
}

function press(target: Element | null): void {
    (target?.querySelector('button') ?? (target as HTMLElement | null))?.click();
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

async function openRoute(fixture: ComponentFixture<ToolbarFiltersAppHostComponent>): Promise<void> {
    fixture.componentInstance.panelShown.set(true);
    await settle(fixture);
}

describe('RtToolbarComponent — панель отборов у приложения', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1711 — при filtersPanel="app" кнопка сообщает filtersOpen и своей панели не открывает', async (): Promise<void> => {
        const { fixture } = setup();

        press(trigger(fixture));
        await settle(fixture);

        expect(fixture.componentInstance.opens).toBe(1);
        expect(document.querySelector('.rt-toolbar-filters-aside')).toBeNull();
    });

    it('SC-UKV-1715 — без входа полоса открывает панель кита и filtersOpen не сообщает', async (): Promise<void> => {
        const { fixture } = setup();
        fixture.componentInstance.mode.set('kit');
        await settle(fixture);

        press(trigger(fixture));
        await settle(fixture);

        expect(fixture.componentInstance.opens).toBe(0);
        expect(document.querySelector('.rt-toolbar-filters-aside')).not.toBeNull();
    });

    it('SC-UKV-1712 — панель в маршруте приложения рисует поля из шаблона полосы, шапку и подвал', async (): Promise<void> => {
        const { fixture } = setup();
        await openRoute(fixture);

        expect(textOf(route(fixture)?.querySelector('[qa-dataid="aside-title"]') ?? null)).toBe('Filters');
        expect(route(fixture)?.querySelector('[qa-dataid="aside-back"]')).not.toBeNull();
        expect(route(fixture)?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
        expect(textOf(route(fixture)?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null)).toBe('Reset');
        expect(textOf(route(fixture)?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null)).toBe('Apply');
    });

    it('SC-UKV-1712 — «Сбросить» и «Применить» панели приложения доходят до выходов полосы', async (): Promise<void> => {
        const { fixture } = setup();
        await openRoute(fixture);

        press(route(fixture)?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null);
        await settle(fixture);
        expect(fixture.componentInstance.resets).toBe(1);
        expect(fixture.componentInstance.dismisses).toBe(0);

        press(route(fixture)?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null);
        await settle(fixture);
        expect(fixture.componentInstance.applied).toBe(1);
        expect(fixture.componentInstance.dismisses).toBe(1);
    });

    it('SC-UKV-1714 — стрелка панели приложения просит закрыть её молча', async (): Promise<void> => {
        const { fixture } = setup();
        await openRoute(fixture);

        press(route(fixture)?.querySelector('[qa-dataid="aside-back"]') ?? null);
        await settle(fixture);

        expect(fixture.componentInstance.dismisses).toBe(1);
        expect(fixture.componentInstance.applied).toBe(0);
        expect(fixture.componentInstance.resets).toBe(0);
    });

    it('SC-UKV-1713 — отборы вернулись в полосу на широком месте: панель приложения просит закрыть её', async (): Promise<void> => {
        const { fixture, breakpoints } = setup();
        await openRoute(fixture);
        expect(fixture.componentInstance.dismisses).toBe(0);

        breakpoints.narrow.set(false);
        await settle(fixture);

        expect(fixture.componentInstance.dismisses).toBe(1);
    });

    it('SC-UKV-1713 — полоса ушла со страницы: панель приложения просит закрыть её', async (): Promise<void> => {
        const { fixture } = setup();
        await openRoute(fixture);

        fixture.componentInstance.toolbarShown.set(false);
        await settle(fixture);

        expect(fixture.componentInstance.dismisses).toBe(1);
    });

    it('SC-UKV-1713 — маршрут панели, вставший раньше полосы, не закрывается и берёт её отборы', async (): Promise<void> => {
        const { fixture } = setup();
        fixture.componentInstance.toolbarShown.set(false);
        await openRoute(fixture);
        expect(fixture.componentInstance.dismisses).toBe(0);

        fixture.componentInstance.toolbarShown.set(true);
        await settle(fixture);

        expect(fixture.componentInstance.dismisses).toBe(0);
        expect(route(fixture)?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
    });
});

/** Двойник наблюдателя размера: смена ширины места подаётся вызовом `resize`. */
class ResizeDouble {
    public static last: ResizeDouble | null = null;

    constructor(public readonly callback: ResizeObserverCallback) {
        ResizeDouble.last = this;
    }

    public observe(): void {}

    public unobserve(): void {}

    public resize(): void {
        this.callback([], this as unknown as ResizeObserver);
    }
}

/** Окно широкое: решает ширина объявленного места. */
const WIDE_WINDOW: Pick<BreakpointObserver, 'observe'> = {
    observe: (): Observable<BreakpointState> => of({ matches: false, breakpoints: {} }),
};

@Component({
    selector: 'rt-toolbar-filters-width-host',
    template: `
        <rt-toolbar>
            <ng-template rtToolbarFilters><span qa-dataid="slot-filter">Статус</span></ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarFiltersDirective],
})
class ToolbarFiltersWidthHostComponent {}

describe('RtToolbarComponent — порог отборов', (): void => {
    function placeOf(width: number): HTMLElement {
        const element: HTMLElement = document.createElement('div');
        element.getBoundingClientRect = (): DOMRect => ({ width }) as DOMRect;
        return element;
    }

    it('SC-UKV-1710 — на 1080 отборы в строке, на 1079 вместо них кнопка; общий narrow на 1080 узкий', (): void => {
        TestBed.configureTestingModule({
            providers: [
                ...provideRtKitTesting(),
                { provide: BreakpointObserver, useValue: WIDE_WINDOW },
                { provide: WINDOW, useValue: { ResizeObserver: ResizeDouble } },
            ],
        });
        const breakpoints: BreakpointsService = TestBed.inject(BreakpointsService);
        const place: HTMLElement = placeOf(1080);
        breakpoints.registerPlace(place);
        const fixture: ComponentFixture<ToolbarFiltersWidthHostComponent> = TestBed.createComponent(ToolbarFiltersWidthHostComponent);
        fixture.detectChanges();

        expect(root(fixture).querySelector('[data-slot="left"] [qa-dataid="slot-filter"]')).not.toBeNull();
        expect(trigger(fixture)).toBeNull();
        expect(breakpoints.narrow()).toBe(true);

        place.getBoundingClientRect = (): DOMRect => ({ width: 1079 }) as DOMRect;
        ResizeDouble.last?.resize();
        fixture.detectChanges();

        expect(root(fixture).querySelector('[qa-dataid="slot-filter"]')).toBeNull();
        expect(trigger(fixture)).not.toBeNull();
    });
});
