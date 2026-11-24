import { InteractivityChecker } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OutputRef,
    OutputRefSubscription,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BreakpointsService } from '../../../platform';
import { provideRtKitTesting } from '../../../../testing/rt-kit-testing';
import { RtContainerComponent } from '../../container/rt-container.component';
import { RtToolbarComponent, RtToolbarFiltersDirective } from '../rt-toolbar.component';
import { RtToolbarFiltersRouteAsideComponent } from './rt-toolbar-filters-route-aside.component';

/** Ширина места подменяется: отборы решают по признаку «уже порога» службы кита. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(true);
    public readonly belowNarrow: Signal<boolean> = this.narrow;
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly phone: WritableSignal<boolean> = signal(false);
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);
    /** Ширина места: `null`, пока каркас его не измерил. */
    public readonly placeWidth: WritableSignal<number | null> = signal<number | null>(1000);

    public registerPlace(): void {
        return;
    }
}

function outputStub(): OutputRef<void> {
    return {
        subscribe: (): OutputRefSubscription => ({ unsubscribe: (): void => undefined }),
    };
}

/**
 * Двойник каркаса: панель ждёт у него готовности перекрытия и закрывается через него. Готовность
 * подаётся вручную — на перезагрузке страницы перекрытие появляется позже маршрута панели.
 */
class ContainerDouble {
    public readonly backdropClick: OutputRef<void> = outputStub();
    public readonly rightOpened: OutputRef<void> = outputStub();
    public readonly rightClosed: OutputRef<void> = outputStub();
    public readonly rightOverlayReady: WritableSignal<boolean> = signal<boolean>(false);
    public readonly rightOpen: Signal<boolean> = signal<boolean>(false);

    public closed: number = 0;
    /** Адрес в момент каждого закрытия: закрытие, пришедшее раньше перехода приложения, его отменило бы. */
    public readonly closedAt: string[] = [];
    public url: () => string = (): string => '';

    public openRight(): void {
        return;
    }

    public closeRight(): void {
        this.closed += 1;
        this.closedAt.push(this.url());
    }
}

/** Страница приложения: полоса списка и маршрут панели отборов в правой зоне каркаса. */
@Component({
    selector: 'rt-toolbar-filters-route-host',
    template: `
        @if (toolbarShown()) {
            <rt-toolbar filtersPanel="app" (filtersApply)="onApply()" (filtersReset)="resets = resets + 1">
                <ng-template rtToolbarFilters let-place>
                    <span qa-dataid="slot-filter" tabindex="0" [attr.data-place]="place">Статус</span>
                </ng-template>
            </rt-toolbar>
        }
        @if (routeShown()) {
            <rt-toolbar-filters-route-aside />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarFiltersRouteAsideComponent],
})
class ToolbarFiltersRouteHostComponent {
    readonly #router: Router = inject(Router);

    public readonly toolbarShown: WritableSignal<boolean> = signal(true);
    public readonly routeShown: WritableSignal<boolean> = signal(true);
    /** Как приложение меняет адрес в ответ на «Применить»: сразу, из микрозадачи или никак. */
    public applyNavigates: 'no' | 'sync' | 'microtask' = 'no';
    public applied: number = 0;
    public resets: number = 0;

    public onApply(): void {
        this.applied += 1;
        if (this.applyNavigates === 'sync') {
            void this.#router.navigate([], { queryParams: { status: 'paid' } });
        }
        if (this.applyNavigates === 'microtask') {
            void Promise.resolve().then((): Promise<boolean> => this.#router.navigate([], { queryParams: { status: 'paid' } }));
        }
    }
}

const INTERACTIVITY: Pick<InteractivityChecker, 'isDisabled' | 'isVisible' | 'isFocusable' | 'isTabbable'> = {
    isDisabled: (): boolean => false,
    isVisible: (): boolean => true,
    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
};

interface ISetup {
    fixture: ComponentFixture<ToolbarFiltersRouteHostComponent>;
    breakpoints: StubBreakpointsService;
    container: ContainerDouble;
}

function setup(narrow: boolean = true): ISetup {
    const breakpoints: StubBreakpointsService = new StubBreakpointsService();
    breakpoints.narrow.set(narrow);
    const container: ContainerDouble = new ContainerDouble();
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            provideRouter([]),
            { provide: BreakpointsService, useValue: breakpoints },
            { provide: RtContainerComponent, useValue: container },
            { provide: InteractivityChecker, useValue: INTERACTIVITY },
        ],
    });
    const fixture: ComponentFixture<ToolbarFiltersRouteHostComponent> = TestBed.createComponent(ToolbarFiltersRouteHostComponent);
    const router: Router = TestBed.inject(Router);
    container.url = (): string => router.url;
    fixture.detectChanges();

    return { fixture, breakpoints, container };
}

function route(fixture: ComponentFixture<unknown>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('rt-toolbar-filters-route-aside');
}

function press(target: Element | null): void {
    (target?.querySelector('button') ?? (target as HTMLElement | null))?.click();
}

/** Отрисовка и одна макрозадача: решение о закрытии после «Применить» ждёт её. */
async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 0);
    });
    await fixture.whenStable();
    fixture.detectChanges();
}

async function ready(state: ISetup): Promise<void> {
    state.container.rightOverlayReady.set(true);
    await settle(state.fixture);
}

describe('RtToolbarFiltersRouteAsideComponent — панель отборов в маршруте приложения', (): void => {
    it('SC-UKV-1774 — маршрут рисует поля из шаблона полосы с контекстом panel', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);

        expect(route(state.fixture)?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
    });

    it('SC-UKV-1774 — «Сбросить» оставляет маршрут, «Применить» сообщает полосе и закрывает его', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);

        press(route(state.fixture)?.querySelector('[qa-dataid="toolbar-filters-reset"]') ?? null);
        await settle(state.fixture);
        expect(state.fixture.componentInstance.resets).toBe(1);
        expect(state.container.closed).toBe(0);

        press(route(state.fixture)?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null);
        await settle(state.fixture);
        expect(state.fixture.componentInstance.applied).toBe(1);
        expect(state.container.closed).toBe(1);
    });

    it('SC-UKV-1778 — «Применить», сменивший адрес, закрывает маршрут после этого перехода', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);
        state.fixture.componentInstance.applyNavigates = 'sync';

        press(route(state.fixture)?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null);
        expect(state.container.closed).toBe(0);

        await settle(state.fixture);
        expect(TestBed.inject(Router).url).toBe('/?status=paid');
        expect(state.container.closed).toBe(1);
    });

    it('SC-UKV-1778 — переход, начатый приложением из микрозадачи, панель тоже дожидается', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);
        state.fixture.componentInstance.applyNavigates = 'microtask';

        press(route(state.fixture)?.querySelector('[qa-dataid="toolbar-filters-apply"]') ?? null);
        await settle(state.fixture);

        expect(state.container.closedAt).toEqual(['/?status=paid']);
    });

    it('SC-UKV-1776 — стрелка закрывает маршрут молча', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);

        press(route(state.fixture)?.querySelector('[qa-dataid="aside-back"]') ?? null);
        await settle(state.fixture);

        expect(state.container.closed).toBe(1);
        expect(state.fixture.componentInstance.applied).toBe(0);
        expect(state.fixture.componentInstance.resets).toBe(0);
    });

    it('SC-UKV-1775 — отборы вернулись в полосу на широком месте: маршрут закрывается', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);
        expect(state.container.closed).toBe(0);

        state.breakpoints.narrow.set(false);
        await settle(state.fixture);

        expect(state.container.closed).toBe(1);
    });

    it('SC-UKV-1097 — маршрут, закрытый на широком месте с фокусом внутри, отдаёт фокус полю полосы', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);
        route(state.fixture)?.querySelector<HTMLElement>('[qa-dataid="toolbar-filters-fields"]')?.focus();
        expect(route(state.fixture)?.contains(document.activeElement)).toBe(true);

        state.breakpoints.narrow.set(false);
        await settle(state.fixture);

        expect(state.container.closed).toBe(1);
        const focused: Element | null = document.activeElement;
        expect(focused?.getAttribute('qa-dataid')).toBe('slot-filter');
        expect(focused?.getAttribute('data-place')).toBe('bar');
    });

    it('SC-UKV-1775 — до готовой панели широкое место маршрут не закрывает: место ещё не измерено', async (): Promise<void> => {
        const state: ISetup = setup(false);
        await settle(state.fixture);
        expect(state.container.closed).toBe(0);

        state.breakpoints.narrow.set(true);
        await ready(state);

        expect(state.container.closed).toBe(0);
    });

    it('SC-UKV-1775 — до замера места широкое окно маршрут не закрывает: перезагрузка с узким местом', async (): Promise<void> => {
        const state: ISetup = setup(false);
        state.breakpoints.placeWidth.set(null);
        await ready(state);
        expect(state.container.closed).toBe(0);

        state.breakpoints.placeWidth.set(1000);
        state.breakpoints.narrow.set(true);
        await settle(state.fixture);

        expect(state.container.closed).toBe(0);
        expect(route(state.fixture)?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
    });

    it('SC-UKV-1775 — отборы, уже стоявшие за кнопкой, закрывают маршрут возвратом в строку и до замера', async (): Promise<void> => {
        const state: ISetup = setup();
        state.breakpoints.placeWidth.set(null);
        await ready(state);
        expect(state.container.closed).toBe(0);

        state.breakpoints.narrow.set(false);
        await settle(state.fixture);

        expect(state.container.closed).toBe(1);
    });

    it('SC-UKV-1775 — полоса ушла со страницы: маршрут закрывается', async (): Promise<void> => {
        const state: ISetup = setup();
        await ready(state);

        state.fixture.componentInstance.toolbarShown.set(false);
        await settle(state.fixture);

        expect(state.container.closed).toBe(1);
    });

    it('SC-UKV-1775 — маршрут, вставший раньше полосы, не закрывается и берёт её отборы', async (): Promise<void> => {
        const state: ISetup = setup();
        state.fixture.componentInstance.toolbarShown.set(false);
        await ready(state);
        expect(state.container.closed).toBe(0);

        state.fixture.componentInstance.toolbarShown.set(true);
        await settle(state.fixture);

        expect(state.container.closed).toBe(0);
        expect(route(state.fixture)?.querySelector('[qa-dataid="slot-filter"]')?.getAttribute('data-place')).toBe('panel');
    });
});
