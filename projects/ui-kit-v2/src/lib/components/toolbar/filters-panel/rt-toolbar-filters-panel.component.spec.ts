import { InteractivityChecker } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, Signal, signal, TemplateRef, viewChild, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRtKitTesting, textOf } from '../../../../testing/rt-kit-testing';
import { IRtToolbar } from '../rt-toolbar.model';
import { RtToolbarFiltersPanelComponent } from './rt-toolbar-filters-panel.component';

/** Панель кита отдаёт отборы входом `filters`: шаблон полей и два нажатия подвала. */
@Component({
    selector: 'rt-toolbar-filters-panel-host',
    template: `
        <ng-template #fields let-place>
            <span qa-dataid="slot-filter" [attr.data-place]="place">Статус</span>
        </ng-template>
        @if (data(); as filters) {
            <rt-toolbar-filters-panel [filters]="filters" (dismiss)="dismisses = dismisses + 1" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarFiltersPanelComponent],
})
class ToolbarFiltersPanelHostComponent {
    public readonly fields: Signal<TemplateRef<IRtToolbar.IFiltersContext>> =
        viewChild.required<TemplateRef<IRtToolbar.IFiltersContext>>('fields');
    public readonly data: WritableSignal<IRtToolbar.IFiltersPanelData | null> = signal<IRtToolbar.IFiltersPanelData | null>(null);
    public resets: number = 0;
    public applies: number = 0;
    public dismisses: number = 0;
}

/** jsdom не раскладывает страницу, и ловушка фокуса без подмены не видит ни одной кнопки. */
const INTERACTIVITY: Partial<InteractivityChecker> = {
    isFocusable: (): boolean => true,
    isVisible: (): boolean => true,
    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
};

async function setup(): Promise<ComponentFixture<ToolbarFiltersPanelHostComponent>> {
    TestBed.configureTestingModule({
        providers: [...provideRtKitTesting(), { provide: InteractivityChecker, useValue: INTERACTIVITY }],
    });
    const fixture: ComponentFixture<ToolbarFiltersPanelHostComponent> = TestBed.createComponent(ToolbarFiltersPanelHostComponent);
    fixture.detectChanges();
    const host: ToolbarFiltersPanelHostComponent = fixture.componentInstance;
    host.data.set({
        template: host.fields(),
        reset: (): void => {
            host.resets += 1;
        },
        apply: (): void => {
            host.applies += 1;
        },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

function find(fixture: ComponentFixture<unknown>, id: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"]`);
}

describe('RtToolbarFiltersPanelComponent', (): void => {
    it('SC-UKV-1090 — панель рисует поля отборов с контекстом panel, шапку и подвал', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersPanelHostComponent> = await setup();

        expect(find(fixture, 'slot-filter')?.getAttribute('data-place')).toBe('panel');
        expect(textOf(find(fixture, 'aside-title'))).toBe('Filters');
        expect(textOf(find(fixture, 'toolbar-filters-reset'))).toBe('Reset');
        expect(textOf(find(fixture, 'toolbar-filters-apply'))).toBe('Apply');
    });

    it('SC-UKV-1090 — «Сбросить» оставляет панель открытой, «Применить» просит её закрыть', async (): Promise<void> => {
        const fixture: ComponentFixture<ToolbarFiltersPanelHostComponent> = await setup();
        const host: ToolbarFiltersPanelHostComponent = fixture.componentInstance;

        find(fixture, 'toolbar-filters-reset')?.click();
        fixture.detectChanges();
        expect(host.resets).toBe(1);
        expect(host.dismisses).toBe(0);

        find(fixture, 'toolbar-filters-apply')?.click();
        fixture.detectChanges();
        expect(host.applies).toBe(1);
        expect(host.dismisses).toBe(1);
    });
});
