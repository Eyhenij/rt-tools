import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RT_POPOVER_SHEET } from '../popover/rt-popover-sheet.token';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';

/** Телефон: узкое окно и узкая полоса. */
class PhoneBreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-tabs-context-sheet-host',
    template: `
        <rt-tabs activeId="a">
            <ng-template rtTab="a" label="Брони" [contextMenu]="tabMenu">A</ng-template>
            <ng-template rtTab="b" label="Гости">B</ng-template>
        </rt-tabs>
        <ng-template #tabMenu let-id>
            <button type="button" qa-dataid="tab-menu-rename" (click)="renamed = id">Переименовать</button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsContextSheetHostComponent {
    public renamed: string | null = null;
}

function settle(fixture: ComponentFixture<TabsContextSheetHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

let lastStub: PhoneBreakpointsStub;

function setup(extra: Provider[] = []): ComponentFixture<TabsContextSheetHostComponent> {
    lastStub = new PhoneBreakpointsStub();
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: lastStub }, ...extra];
    const fixture: ComponentFixture<TabsContextSheetHostComponent> = createRtFixture(TabsContextSheetHostComponent, {}, { providers });
    settle(fixture);
    return fixture;
}

/** Долгое нажатие на телефоне браузер шлёт тем же событием, что и правую кнопку. */
function longPress(fixture: ComponentFixture<TabsContextSheetHostComponent>): void {
    const tab: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-tabid="a"]');
    tab?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 30 }));
    settle(fixture);
}

describe('Меню вкладки в нижней шторке', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1573 — на телефоне меню вкладки открывается в нижней шторке с названием вкладки', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup();

        longPress(fixture);

        expect(document.querySelector('.rt-popover-sheet [qa-dataid="tabs-context-menu"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).toBe('Брони');
        expect(document.querySelectorAll('[qa-dataid="tabs-context-menu"]').length).toBe(1);
    });

    it('SC-UKV-1574 — пункт меню вкладки в шторке делает своё и закрывает шторку', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup();
        longPress(fixture);

        (document.querySelector('.rt-popover-sheet [qa-dataid="tab-menu-rename"]') as HTMLElement).click();
        settle(fixture);

        expect(fixture.componentInstance.renamed).toBe('a');
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });
    it('SC-UKV-1594: токен RT_POPOVER_SHEET со значением false оставляет меню вкладки у точки нажатия на телефоне', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup([{ provide: RT_POPOVER_SHEET, useValue: false }]);

        longPress(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelectorAll('[qa-dataid="tabs-context-menu"]').length).toBe(1);
    });

    it('SC-UKV-1590: порог ширины, пересечённый при открытом в шторке меню вкладки, не рисует вторую панель', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup();
        longPress(fixture);

        lastStub.viewportNarrow.set(false);
        settle(fixture);

        expect(document.querySelectorAll('[qa-dataid="tabs-context-menu"]').length).toBe(1);
        expect(document.querySelector('.rt-popover-sheet [qa-dataid="tabs-context-menu"]')).not.toBeNull();
    });

    it('SC-UKV-1590: в шторке меню вкладки берёт фокус на первый пункт, как панель у точки нажатия', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup();

        longPress(fixture);

        expect(document.activeElement).toBe(document.querySelector('.rt-popover-sheet [qa-dataid="tab-menu-rename"]'));
    });

    it('SC-UKV-1616 — фокус на первый пункт меню вкладки встаёт, когда шторка уже не inert', (): void => {
        const fixture: ComponentFixture<TabsContextSheetHostComponent> = setup();
        const inertAtFocus: Array<boolean | null> = [];
        jest.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement): void {
            if (this.getAttribute('qa-dataid') === 'tab-menu-rename') {
                inertAtFocus.push(this.closest('rt-bottom-sheet')?.hasAttribute('inert') ?? null);
            }
        });

        longPress(fixture);

        expect(inertAtFocus.length).toBeGreaterThan(0);
        expect(inertAtFocus).toEqual(inertAtFocus.map((): boolean => false));
        jest.restoreAllMocks();
    });
});
