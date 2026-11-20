import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RtMenuComponent } from './rt-menu.component';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-menu-sheet-focus-host',
    template: `
        <rt-menu ariaLabel="Действия">
            <rt-menu-item label="Открыть" icon="ico-eye" />
            <rt-menu-item label="Удалить" icon="ico-trash" />
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuItemComponent],
})
class MenuSheetFocusHostComponent {}

function settle(fixture: ComponentFixture<MenuSheetFocusHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

describe('RtMenuComponent — фокус в нижней шторке', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1493 — фокус на первый пункт встаёт, когда шторка уже открыта и не inert', (): void => {
        const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];
        const fixture: ComponentFixture<MenuSheetFocusHostComponent> = createRtFixture(MenuSheetFocusHostComponent, {}, { providers });
        fixture.detectChanges();
        // В браузере `focus()` в узел под `inert` молча ничего не делает; jsdom атрибут хранит, и по нему видно момент.
        const inertAtFocus: Array<boolean | null> = [];
        jest.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement): void {
            if (this.getAttribute('role') === 'menuitem') {
                inertAtFocus.push(this.closest('rt-bottom-sheet')?.hasAttribute('inert') ?? null);
            }
        });

        ((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="menu-trigger"] button') as HTMLButtonElement).click();
        settle(fixture);

        expect(inertAtFocus.length).toBeGreaterThan(0);
        expect(inertAtFocus).toEqual(inertAtFocus.map((): boolean => false));
        expect(document.querySelector('.rt-popover-sheet rt-bottom-sheet')?.hasAttribute('inert')).toBe(false);
    });
});
