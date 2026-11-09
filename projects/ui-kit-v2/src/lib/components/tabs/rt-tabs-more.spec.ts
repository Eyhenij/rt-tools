import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

const TAB_WIDTH: number = 100;
const MORE_WIDTH: number = 84;

/** В тестовой среде нет раскладки: ширины задаёт сам тест — полосе своя, вкладке и пункту свои. */
function stubWidths(stripWidth: () => number): void {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement): DOMRect {
        let width: number = 0;
        if (this.getAttribute('qa-dataid') === 'tabs-tab-list') {
            width = stripWidth();
        } else if (this.classList.contains('rt-tabs-more')) {
            width = MORE_WIDTH;
        } else if (this.hasAttribute('data-tabitem')) {
            width = TAB_WIDTH;
        }
        return { width, height: 30, top: 0, left: 0, right: width, bottom: 30, x: 0, y: 0, toJSON: (): string => '' };
    });
}

@Component({
    selector: 'rt-tabs-more-host',
    template: `
        <rt-tabs [overflow]="overflow()" [activeId]="activeId()" (tabClose)="closed.set($event)">
            <ng-template rtTab="a" label="A" [contextMenu]="tabMenu">A</ng-template>
            <ng-template rtTab="b" label="B">B</ng-template>
            <ng-template rtTab="c" label="C" closable>C</ng-template>
            <ng-template rtTab="d" label="D" [invalid]="invalid()">D</ng-template>
        </rt-tabs>
        <ng-template #tabMenu let-id>
            <button type="button" qa-dataid="tab-menu-item">Закрыть {{ id }}</button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsMoreHostComponent {
    public readonly overflow: WritableSignal<IRtTabs.Overflow> = signal<IRtTabs.Overflow>('more');
    public readonly activeId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>('a');
    public readonly invalid: WritableSignal<boolean> = signal<boolean>(false);
    public readonly closed: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);
}

function host(fixture: ComponentFixture<TabsMoreHostComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function hiddenTabs(fixture: ComponentFixture<TabsMoreHostComponent>): string[] {
    return Array.from(host(fixture).querySelectorAll<HTMLElement>('.rt-tab-item--in-more')).map(
        (node: HTMLElement): string => node.dataset['tabitem'] ?? ''
    );
}

function openMenu(fixture: ComponentFixture<TabsMoreHostComponent>): void {
    host(fixture).querySelector<HTMLElement>('[qa-dataid="tabs-more"]')?.click();
    fixture.detectChanges();
}

function setup(width: number): ComponentFixture<TabsMoreHostComponent> {
    stubWidths((): number => width);
    const fixture: ComponentFixture<TabsMoreHostComponent> = createRtFixture(TabsMoreHostComponent);
    fixture.detectChanges();
    return fixture;
}

describe('RtTabsComponent — режим «Ещё»', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelector('.cdk-overlay-container')?.replaceChildren();
    });

    it('SC-UKV-1206 — the open trigger shows its state', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(120);
        const trigger: HTMLElement | null = host(fixture).querySelector<HTMLElement>('[qa-dataid="tabs-more"]');

        expect(trigger?.classList.contains('rt-tab-item__trigger--open')).toBe(false);

        openMenu(fixture);

        expect(trigger?.classList.contains('rt-tab-item__trigger--open')).toBe(true);
    });

    it('SC-UKV-1183 — лишние вкладки стоят в меню, а не в ряду', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(300);

        expect(hiddenTabs(fixture)).toEqual(['c', 'd']);
        openMenu(fixture);
        const rows: string[] = Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="tabs-more-item"]')).map(
            (node: HTMLElement): string => node.dataset['id'] ?? ''
        );
        expect(rows).toEqual(['c', 'd']);
    });

    it('SC-UKV-1184 — всё встаёт, и пункт «Ещё» скрыт', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(800);

        expect(hiddenTabs(fixture)).toEqual([]);
        expect(host(fixture).querySelector('.rt-tabs-more')?.classList.contains('rt-tabs-more--idle')).toBe(true);
    });

    it('SC-UKV-1185 — выбор извне ставит вкладку в ряд и вытесняет соседа', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(300);

        fixture.componentInstance.activeId.set('d');
        fixture.detectChanges();

        expect(hiddenTabs(fixture)).toEqual(['b', 'c']);
        expect(host(fixture).querySelector<HTMLElement>('[data-tabitem="d"]')?.style.order).toBe('1');
    });

    it('SC-UKV-1187 — полоса без режима прокручивается, и пункта нет', (): void => {
        stubWidths((): number => 300);
        const fixture: ComponentFixture<TabsMoreHostComponent> = createRtFixture(TabsMoreHostComponent);
        fixture.componentInstance.overflow.set('scroll');
        fixture.detectChanges();

        expect(host(fixture).querySelector('[qa-dataid="tabs-tab-list"]')).not.toBeNull();
        expect(host(fixture).querySelector('[qa-dataid="tabs-more"]')).toBeNull();
        expect(host(fixture).querySelector('[qa-dataid="tabs-scroll-next"]')).not.toBeNull();
    });

    it('SC-UKV-1188 — ошибка в меню ставит точку на пункт', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(300);
        expect(host(fixture).querySelector('[qa-dataid="tabs-more"]')).not.toBeNull();
        expect(host(fixture).querySelector('[qa-dataid="tabs-more-dot"]')).toBeNull();

        fixture.componentInstance.invalid.set(true);
        fixture.detectChanges();

        expect(host(fixture).querySelector('[qa-dataid="tabs-more-dot"]')).not.toBeNull();
    });

    it('SC-UKV-1199 — правая кнопка открывает меню приложения вместо меню браузера', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(800);
        const event: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

        host(fixture).querySelector('[data-tabitem="a"]')?.dispatchEvent(event);
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
        expect(document.querySelector('[qa-dataid="tab-menu-item"]')?.textContent).toContain('Закрыть a');
    });

    it('SC-UKV-1199 — вкладка без шаблона оставляет меню браузера', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(800);
        const event: MouseEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

        host(fixture).querySelector('[data-tabitem="b"]')?.dispatchEvent(event);
        fixture.detectChanges();

        expect(host(fixture).querySelector('[data-tabitem="b"]')).not.toBeNull();
        expect(event.defaultPrevented).toBe(false);
    });

    it('SC-UKV-1189 — крестик в меню просит закрыть вкладку и не выбирает её', (): void => {
        const fixture: ComponentFixture<TabsMoreHostComponent> = setup(300);
        openMenu(fixture);

        document.querySelector<HTMLElement>('[qa-dataid="tabs-more-close"][data-id="c"]')?.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.closed()).toBe('c');
        expect(host(fixture).querySelector('[data-tabid="a"]')?.getAttribute('aria-selected')).toBe('true');
    });
});
