import { ApplicationRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsContextMenuComponent } from './rt-tabs-context-menu.component';
import { RtTabsComponent } from './rt-tabs.component';

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
        return { width, height: 30, top: 10, left: 20, right: 20 + width, bottom: 40, x: 20, y: 10, toJSON: (): string => '' };
    });
}

@Component({
    selector: 'rt-tabs-menu-keys-host',
    template: `
        <rt-tabs overflow="more" activeId="a">
            <ng-template rtTab="a" label="A" [contextMenu]="tabMenu">A</ng-template>
            <ng-template rtTab="b" label="B">B</ng-template>
            <ng-template rtTab="c" label="C">C</ng-template>
            <ng-template rtTab="d" label="D">D</ng-template>
        </rt-tabs>
        <ng-template #tabMenu let-id>
            <button type="button" qa-dataid="tab-menu-rename">Переименовать {{ id }}</button>
            <button type="button" qa-dataid="tab-menu-close">Закрыть {{ id }}</button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsMenuKeysHostComponent {}

function render(fixture: ComponentFixture<TabsMenuKeysHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
}

function setup(): ComponentFixture<TabsMenuKeysHostComponent> {
    stubWidths();
    const fixture: ComponentFixture<TabsMenuKeysHostComponent> = createRtFixture(TabsMenuKeysHostComponent);
    render(fixture);
    return fixture;
}

function focused(): string | null {
    const active: Element | null = document.activeElement;
    return active?.getAttribute('data-id') ?? active?.getAttribute('qa-dataid') ?? null;
}

/** Коды клавиш: `FocusKeyManager` читает `keyCode`, который браузер ставит сам. */
const KEY_CODES: Readonly<Record<string, number>> = { ArrowDown: 40, Home: 36 };

function press(key: string): void {
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: KEY_CODES[key], bubbles: true }));
}

describe('RtTabsComponent — клавиатура в меню вкладок', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelector('.cdk-overlay-container')?.replaceChildren();
    });

    it('SC-UKV-1223 — the «More» menu takes focus, arrows move it, and a pick returns it to the trigger', (): void => {
        const fixture: ComponentFixture<TabsMenuKeysHostComponent> = setup();
        const trigger: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="tabs-more"]');

        trigger?.focus();
        trigger?.click();
        render(fixture);
        expect(focused()).toBe('c');

        press('ArrowDown');
        expect(focused()).toBe('d');
        press('Home');
        expect(focused()).toBe('c');

        (document.activeElement as HTMLElement).click();
        render(fixture);

        expect(document.querySelector('[qa-dataid="tabs-more-menu"]')).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it('SC-UKV-1223 — the tab menu opened by the menu key stands under the tab and takes focus', (): void => {
        const fixture: ComponentFixture<TabsMenuKeysHostComponent> = setup();
        const tab: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-tabid="a"]');

        const menuKey: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

        tab?.focus();
        tab?.dispatchEvent(menuKey);
        render(fixture);
        // У клавиши меню нет точки нажатия: меню встаёт у левого нижнего угла вкладки (20, 40).
        expect(RtTabsContextMenuComponent.pointOf(menuKey)).toEqual({ x: 20, y: 40 });
        expect(focused()).toBe('tab-menu-rename');

        press('ArrowDown');
        expect(focused()).toBe('tab-menu-close');

        (document.activeElement as HTMLElement).click();
        render(fixture);

        expect(document.querySelector('[qa-dataid="tabs-context-menu"]')).toBeNull();
        expect(document.activeElement).toBe(tab);
    });
});
