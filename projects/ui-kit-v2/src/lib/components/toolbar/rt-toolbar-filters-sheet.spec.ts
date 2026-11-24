import { InteractivityChecker } from '@angular/cdk/a11y';
import { ApplicationRef, ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtToolbarComponent, RtToolbarFiltersDirective } from './rt-toolbar.component';

/** Телефон: место узкое, окно 375 точек. */
class PhoneBreakpointsService {
    public readonly narrow: Signal<boolean> = signal(true);
    public readonly phone: Signal<boolean> = signal(true);
    public readonly viewportNarrow: Signal<boolean> = this.narrow;
    public readonly belowNarrow: Signal<boolean> = this.narrow;
    public readonly mobile: Signal<boolean> = this.phone;
    public readonly tablet: Signal<boolean> = signal(false);
    public readonly desktop: Signal<boolean> = signal(false);

    public registerPlace(): void {
        return;
    }
}

@Component({
    selector: 'rt-toolbar-filters-sheet-host',
    template: `
        <rt-toolbar (filtersApply)="applied.set(applied() + 1)" (filtersReset)="resets.set(resets() + 1)">
            <ng-template rtToolbarFilters let-place>
                <input qa-dataid="slot-filter" [attr.data-place]="place" />
            </ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarFiltersDirective],
})
class ToolbarFiltersSheetHostComponent {
    public readonly applied: WritableSignal<number> = signal(0);
    public readonly resets: WritableSignal<number> = signal(0);
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

async function openFilters(): Promise<ComponentFixture<ToolbarFiltersSheetHostComponent>> {
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            { provide: BreakpointsService, useClass: PhoneBreakpointsService },
            // jsdom не раскладывает страницу, и ловушка фокуса без подмены не видит ни одного поля
            {
                provide: InteractivityChecker,
                useValue: {
                    isDisabled: (): boolean => false,
                    isVisible: (): boolean => true,
                    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
                    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
                },
            },
        ],
    });
    const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = TestBed.createComponent(ToolbarFiltersSheetHostComponent);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="toolbar-filters-trigger"] button')?.click();
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();

    return fixture;
}

describe('Отборы полосы на телефоне — шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
    });

    it('SC-UKV-1806 — отборы поднимаются шторкой: «Применить» справа в шапке, «Сбросить» в подвале', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersSheetHostComponent> = await openFilters();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--full');
        expect(node('toolbar-filters-apply')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
        expect(node('toolbar-filters-reset')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(node('slot-filter')?.getAttribute('data-place')).toBe('panel');

        node('toolbar-filters-apply')?.click();

        expect(fixture.componentInstance.applied()).toBe(1);
    });
});
