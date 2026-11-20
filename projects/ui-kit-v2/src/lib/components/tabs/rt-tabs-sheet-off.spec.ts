import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { RtTabsContextMenuComponent } from './rt-tabs-context-menu.component';
import { RtTabsMoreComponent } from './rt-tabs-more.component';

/** Телефон: узкое окно и узкая полоса. */
class PhoneBreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-tabs-sheet-off-host',
    template: `
        <rt-tabs activeId="a" overflow="more" [sheet]="false">
            <ng-template rtTab="a" label="Брони" [contextMenu]="tabMenu">A</ng-template>
            <ng-template rtTab="b" label="Гости">B</ng-template>
        </rt-tabs>
        <ng-template #tabMenu let-id>
            <button type="button" qa-dataid="tab-menu-rename">Переименовать</button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsSheetOffHostComponent {}

function settle(fixture: ComponentFixture<TabsSheetOffHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

describe('Вкладки со шторкой выключенной', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1461 — rt-tabs со шторкой выключенной оставляет меню вкладки и «Ещё» у вкладок на телефоне', (): void => {
        const providers: Provider[] = [{ provide: BreakpointsService, useValue: new PhoneBreakpointsStub() }];
        const fixture: ComponentFixture<TabsSheetOffHostComponent> = createRtFixture(TabsSheetOffHostComponent, {}, { providers });
        settle(fixture);

        const tab: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-tabid="a"]');
        tab?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 30 }));
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelectorAll('[qa-dataid="tabs-context-menu"]').length).toBe(1);
        expect(document.querySelector('[qa-dataid="tabs-context-menu"]')?.closest('.rt-popover-sheet')).toBeNull();

        expect(fixture.debugElement.query(By.directive(RtTabsContextMenuComponent)).componentInstance.sheet()).toBe(false);
        expect(fixture.debugElement.query(By.directive(RtTabsMoreComponent))?.componentInstance.sheet()).toBe(false);
    });
});
