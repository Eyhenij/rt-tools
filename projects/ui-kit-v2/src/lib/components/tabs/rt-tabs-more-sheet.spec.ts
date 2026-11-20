import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';

/** Телефон: узкое окно и узкая полоса. */
class PhoneBreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

/** Полоса 300 вмещает две вкладки по 100 и пункт «Ещё»: остальные уходят в меню. */
function stubWidths(): void {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement): DOMRect {
        let width: number = 0;
        if (this.getAttribute('qa-dataid') === 'tabs-tab-list') {
            width = 300;
        } else if (this.classList.contains('rt-tabs-more')) {
            width = 84;
        } else if (this.hasAttribute('data-tabitem')) {
            width = 100;
        }
        return { width, height: 30, top: 0, left: 0, right: width, bottom: 30, x: 0, y: 0, toJSON: (): string => '' };
    });
}

@Component({
    selector: 'rt-tabs-more-sheet-host',
    template: `
        <rt-tabs overflow="more" activeId="a">
            <ng-template rtTab="a" label="A">a</ng-template>
            <ng-template rtTab="b" label="B">b</ng-template>
            <ng-template rtTab="c" label="C">c</ng-template>
            <ng-template rtTab="d" label="D">d</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsMoreSheetHostComponent {}

function settle(fixture: ComponentFixture<TabsMoreSheetHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

describe('Меню «Ещё» вкладок в нижней шторке', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1593: на телефоне «Ещё» открывает перечень вкладок в нижней шторке с подписью «Ещё»', (): void => {
        stubWidths();
        const providers: Provider[] = [{ provide: BreakpointsService, useValue: new PhoneBreakpointsStub() }];
        const fixture: ComponentFixture<TabsMoreSheetHostComponent> = createRtFixture(TabsMoreSheetHostComponent, {}, { providers });
        settle(fixture);

        (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="tabs-more"]')?.click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet [qa-dataid="tabs-more-menu"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).not.toBe('');
        expect(document.querySelector('.rt-popover-panel')).toBeNull();
    });
});
