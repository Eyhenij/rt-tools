import { InteractivityChecker } from '@angular/cdk/a11y';
import { Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';

import { BreakpointsService } from '../../../../platform';
import { provideRtKitTesting } from '../../../../../testing/rt-kit-testing';
import { TestRtToolbarFiltersRouteComponent, TOOLBAR_FILTERS_ROUTES } from './test-rt-toolbar-filters-route.component';

/** Узкое место: отборы стоят за кнопкой фильтров. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(true);
    public readonly belowNarrow: Signal<boolean> = this.narrow;
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly phone: WritableSignal<boolean> = signal(true);
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);
    public readonly placeWidth: WritableSignal<number | null> = signal<number | null>(375);

    /** Каркас снимает своё место при уничтожении той функцией, что вернул учёт. */
    public registerPlace(): () => void {
        return (): void => undefined;
    }
}

const INTERACTIVITY: Pick<InteractivityChecker, 'isDisabled' | 'isVisible' | 'isFocusable' | 'isTabbable'> = {
    isDisabled: (): boolean => false,
    isVisible: (): boolean => true,
    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
};

async function setup(): Promise<{ fixture: ComponentFixture<TestRtToolbarFiltersRouteComponent>; router: Router }> {
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            provideRouter([]),
            { provide: BreakpointsService, useValue: new StubBreakpointsService() },
            { provide: InteractivityChecker, useValue: INTERACTIVITY },
        ],
    });
    const fixture: ComponentFixture<TestRtToolbarFiltersRouteComponent> = TestBed.createComponent(TestRtToolbarFiltersRouteComponent);
    const router: Router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, router };
}

describe('TestRtToolbarFiltersRouteComponent', (): void => {
    it('SC-UKV-1773 — витрина объявляет маршрут панели в аутлете ro и открывается без панели', async (): Promise<void> => {
        const { router } = await setup();

        expect(router.config.map(({ path, outlet }: Route): string => `${outlet}:${path}`)).toEqual(
            TOOLBAR_FILTERS_ROUTES.map(({ path, outlet }: Route): string => `${outlet}:${path}`)
        );
        expect(router.config[0]?.outlet).toBe('ro');
        expect(router.url).toBe('/');
    });

    it('SC-UKV-1773 — кнопка фильтров переводит витрину на маршрут панели', async (): Promise<void> => {
        const { fixture, router } = await setup();

        (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="toolbar-filters-trigger"] button')?.click();
        await fixture.whenStable();

        expect(router.url).toBe('/(ro:filters)');
    });
});
