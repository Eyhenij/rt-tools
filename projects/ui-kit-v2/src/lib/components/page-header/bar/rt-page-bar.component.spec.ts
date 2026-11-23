import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../../platform';
import { RT_POPOVER_SHEET } from '../../popover/rt-popover-sheet.token';
import { RtPageBarFilterDirective, RtPageBarSearchDirective } from './rt-page-bar-slots.directive';
import { RtPageBarComponent } from './rt-page-bar.component';
import { IRtPageBar } from './rt-page-bar.model';

let resize: (() => void) | null = null;
let hostWidth: number = 1390;

class ResizeDouble {
    constructor(callback: () => void) {
        resize = callback;
    }

    public observe(): void {}

    public disconnect(): void {}
}

function windowDouble(): Window & typeof globalThis {
    return { ResizeObserver: ResizeDouble } as unknown as Window & typeof globalThis;
}

@Component({
    selector: 'rt-page-bar-host',
    template: `
        <rt-page-bar
            [pageTitle]="title()"
            [actions]="actions"
            [filtersActive]="active()"
            [sheet]="sheet()"
            (actionClick)="clicked = $event"
            (filtersApply)="applied = true">
            <ng-template rtPageBarSearch><input qa-dataid="demo-search" /></ng-template>
            <ng-template rtPageBarFilter><span qa-dataid="demo-filter"></span></ng-template>
            <ng-template rtPageBarFilter><span qa-dataid="demo-filter"></span></ng-template>
        </rt-page-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageBarComponent, RtPageBarFilterDirective, RtPageBarSearchDirective],
})
class PageBarHostComponent {
    public actions: ReadonlyArray<IRtPageBar.Action> = [{ id: 'new', label: 'Новая', icon: 'plus-circle' }];
    public active: WritableSignal<boolean> = signal<boolean>(false);
    public title: WritableSignal<string> = signal<string>('Все брони');
    public sheet: WritableSignal<boolean> = signal<boolean>(true);
    public clicked: string = '';
    public applied: boolean = false;
}

/** Новая ширина шапки: наблюдатель размеров сообщает её, как в браузере. */
function resizeTo(fixture: ComponentFixture<PageBarHostComponent>, width: number): void {
    hostWidth = width;
    resize?.();
    fixture.detectChanges();
}

/** Подмена наблюдателя ширины окна: телефон или окно шире него, узкий вид кита включён. */
function breakpoints(phone: boolean): Partial<BreakpointsService> {
    return { phone: signal<boolean>(phone), viewportNarrow: signal<boolean>(true), narrow: signal<boolean>(true) };
}

function setup(width: number, phone: boolean = true, sheetAllowed: boolean = true): ComponentFixture<PageBarHostComponent> {
    hostWidth = width;
    const fixture: ComponentFixture<PageBarHostComponent> = createRtFixture(
        PageBarHostComponent,
        {},
        {
            providers: [
                { provide: WINDOW, useFactory: windowDouble },
                { provide: BreakpointsService, useValue: breakpoints(phone) },
                { provide: RT_POPOVER_SHEET, useValue: sheetAllowed },
            ],
        }
    );
    const host: HTMLElement = fixture.nativeElement.querySelector('rt-page-bar');
    jest.spyOn(host, 'getBoundingClientRect').mockImplementation((): DOMRect => ({ width: hostWidth }) as DOMRect);
    resize?.();
    fixture.detectChanges();
    return fixture;
}

describe('rt-page-bar', (): void => {
    it('SC-UKV-1194 — a wide bar draws filters and actions in a row', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(1390);

        expect(qaAll(fixture, 'demo-filter')).toHaveLength(2);
        expect(qaAll(fixture, 'page-bar-action')).toHaveLength(1);
        expect(qa(fixture, 'page-bar-filters')).toBeNull();
    });

    it('SC-UKV-1194 — a bar of 768 hides filters and actions behind buttons', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(768);

        expect(qaAll(fixture, 'demo-filter')).toHaveLength(0);
        expect(qaAll(fixture, 'page-bar-action')).toHaveLength(0);
        expect(qa(fixture, 'page-bar-filters')).not.toBeNull();
        expect(qa(fixture, 'page-bar-actions-menu')).not.toBeNull();
    });

    it('SC-UKV-1197 — the filters button opens the bottom sheet with search and all filters', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).not.toBeNull();
        expect(qaAll(fixture, 'demo-filter')).toHaveLength(2);
        expect(qa(fixture, 'demo-search')).not.toBeNull();
    });

    it('SC-UKV-1200 — the apply button closes the bottom sheet', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        (qa(fixture, 'page-bar-apply')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
    });

    it('SC-UKV-1629 — wider than a phone the filters open in a panel by the button', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(768, false);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        const panel: Element | null = document.querySelector('[qa-dataid="page-bar-filters-panel"]');
        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
        expect(panel?.querySelectorAll('[qa-dataid="demo-filter"]')).toHaveLength(2);
        expect(panel?.querySelector('[qa-dataid="demo-search"]')).not.toBeNull();
        expect(document.activeElement).toBe(panel);

        (document.querySelector('[qa-dataid="page-bar-panel-apply"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.applied).toBe(true);
        expect(document.querySelector('[qa-dataid="page-bar-filters-panel"]')).toBeNull();
    });

    it('SC-UKV-1630 — the sheet switched off keeps the panel on a phone', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);
        fixture.componentInstance.sheet.set(false);
        fixture.detectChanges();

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="page-bar-filters-panel"]')).not.toBeNull();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1638 — the application setting switches the filters sheet off on a phone', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375, true, false);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="page-bar-filters-panel"]')).not.toBeNull();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1197 — applied filters light the dot on the button', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);
        expect(qa(fixture, 'page-bar-filters-dot')).toBeNull();

        fixture.componentInstance.active.set(true);
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-filters-dot')).not.toBeNull();
    });

    it('SC-UKV-1219 — a disabled action in the phone menu looks and acts disabled', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);
        fixture.componentInstance.actions = [
            { id: 'new', label: 'Новая', icon: 'plus-circle' },
            { id: 'off', label: 'Нельзя', icon: 'plus-circle', disabled: true },
        ];
        fixture.detectChanges();

        (
            qa(fixture, 'page-bar-actions-menu')?.nativeElement.querySelector(
                '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]'
            ) as HTMLElement
        ).click();
        fixture.detectChanges();
        const items: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>('rt-menu-item'));
        const off: HTMLElement | undefined = items.find((item: HTMLElement): boolean => item.textContent?.includes('Нельзя') ?? false);

        expect(items).toHaveLength(2);
        expect(off?.getAttribute('aria-disabled')).toBe('true');
        expect(off?.classList).toContain('rt-menu-item--disabled');
        off?.click();
        expect(fixture.componentInstance.clicked).toBe('');
    });

    it('SC-UKV-1221 — a title changed in the narrow view is measured again in the wide one', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(1390);
        const bar: HTMLElement = fixture.nativeElement.querySelector('rt-page-bar');
        // В узком виде заголовок растянут на всю строку, в широком — по тексту.
        Object.defineProperty(qa(fixture, 'page-bar-title')?.nativeElement, 'scrollWidth', {
            get: (): number => (bar.classList.contains('rt-page-bar--narrow') ? 900 : 113),
        });

        resizeTo(fixture, 375);
        fixture.componentInstance.title.set('Брони за месяц');
        fixture.detectChanges();
        resizeTo(fixture, 1390);
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-second-row')).toBeNull();
        expect(qaAll(fixture, 'demo-filter')).toHaveLength(2);
    });

    it('SC-UKV-1222 — the filters sheet does not open by itself on return to the narrow view', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(qa(fixture, 'page-bar-sheet')).not.toBeNull();

        resizeTo(fixture, 1390);
        resizeTo(fixture, 375);

        expect(qa(fixture, 'page-bar-filters')).not.toBeNull();
        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
    });

    it('a pressed action reports its id', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(1390);

        (qa(fixture, 'page-bar-action')?.nativeElement as HTMLElement).click();

        expect(fixture.componentInstance.clicked).toBe('new');
    });
});
