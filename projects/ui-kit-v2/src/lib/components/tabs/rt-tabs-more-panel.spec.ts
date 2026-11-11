import { signal, ApplicationRef, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

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
    selector: 'rt-tabs-more-panel-host',
    template: `
        <rt-tabs overflow="more" activeId="a" (tabClose)="close($event)">
            @for (id of ids(); track id) {
                <ng-template closable [rtTab]="id" [label]="id.toUpperCase()">{{ id }}</ng-template>
            }
            <ng-template rtTab="t" [titleTemplate]="title">T</ng-template>
        </rt-tabs>
        <ng-template #title><b qa-dataid="custom-title">Свой заголовок</b></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsMorePanelHostComponent {
    public readonly ids: WritableSignal<string[]> = signal<string[]>(['a', 'b', 'c']);

    public close(id: IRtTabs.Id): void {
        this.ids.update((ids: string[]): string[] => ids.filter((one: string): boolean => one !== id));
    }
}

function render(fixture: ComponentFixture<TabsMorePanelHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
}

function setup(): ComponentFixture<TabsMorePanelHostComponent> {
    stubWidths();
    const fixture: ComponentFixture<TabsMorePanelHostComponent> = createRtFixture(TabsMorePanelHostComponent);
    render(fixture);
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[qa-dataid="tabs-more"]')?.click();
    render(fixture);
    return fixture;
}

function menuRows(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="tabs-more-item"]')).map(
        (row: HTMLElement): string => row.dataset['id'] ?? ''
    );
}

describe('RtTabsComponent — панель меню «Ещё»', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelector('.cdk-overlay-container')?.replaceChildren();
    });

    it('SC-UKV-1225 — a menu row of a tab with a title template shows that template', (): void => {
        setup();

        expect(menuRows()).toContain('t');
        expect(document.querySelector('[qa-dataid="tabs-more-item"][data-id="t"] [qa-dataid="custom-title"]')?.textContent).toBe(
            'Свой заголовок'
        );
    });

    it('SC-UKV-1225 — closing the last tab of the menu closes the panel', (): void => {
        const fixture: ComponentFixture<TabsMorePanelHostComponent> = setup();
        expect(menuRows()).toEqual(['c', 't']);

        // Без «c» три вкладки встают в полосу 300: «t» уходит в ряд, и меню пустеет.
        document.querySelector<HTMLElement>('[qa-dataid="tabs-more-close"][data-id="c"]')?.click();
        render(fixture);

        expect(fixture.componentInstance.ids()).toEqual(['a', 'b']);
        expect(document.querySelector('[qa-dataid="tabs-more-menu"]')).toBeNull();
    });
});
