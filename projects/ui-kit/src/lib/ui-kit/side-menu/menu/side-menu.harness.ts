import { DEFAULT_MENU_ID } from '../settings/side-menu-settings.logic';
import { ChangeDetectionStrategy, Component, EnvironmentProviders, Provider, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BreakpointService } from '@rt-tools/core';

import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { RtuiSideMenuComponent } from './rtui-side-menu.component';
import { RtuiSubMenuHoldService } from './rtui-sub-menu-hold.service';

/**
 * Двойник набора шрифтов документа. Значок кита спрашивает у него, доехал ли шрифт значков, а в
 * среде спек `document.fonts` нет вовсе: без подмены падает всё, что рисует готовую кнопку.
 */
export function installFontsStub(): void {
    if (!('fonts' in document)) {
        Object.defineProperty(document, 'fonts', {
            configurable: true,
            value: { check: (): boolean => true, ready: Promise.resolve() },
        });
    }
}

/** Двойник службы точек перелома: сценарий сам решает, узкий экран или нет. */
export class BreakpointServiceStub {
    public readonly narrow: WritableSignal<boolean> = signal(false);

    public get isMobile(): Signal<boolean> {
        return this.narrow.asReadonly();
    }
}

const SEARCH_FIELD: string = '[qa-dataid="side-menu-search"]';

export const ITEMS: ISideMenu.Item[] = [
    {
        id: 'refs',
        name: 'Справочники',
        icon: 'menu_book',
        submenu: [
            { id: 'rates', name: 'Курсы валют', link: '/rates' },
            { id: 'taxes', name: 'Налоги', link: '/taxes' },
        ],
    },
    { id: 'reports', name: 'Отчёты', icon: 'insights', link: '/reports' },
];

/**
 * Набор с папкой внутри подменю: потребитель кладёт то, что человек ищет по имени, именно туда, и
 * без такого набора спуск отбора внутрь папок проверить нечем.
 */
export const NESTED_ITEMS: ISideMenu.Item[] = [
    {
        id: 'refs',
        name: 'Справочники',
        icon: 'menu_book',
        submenu: [
            { id: 'rates', name: 'Курсы валют', link: '/rates' },
            {
                id: 'saved',
                name: 'Сохранённое',
                submenu: [
                    { id: 'pie', name: 'Круговая диаграмма', link: '/saved/pie' },
                    { id: 'bars', name: 'Столбцы по месяцам', link: '/saved/bars' },
                ],
            },
        ],
    },
    { id: 'reports', name: 'Отчёты', icon: 'insights', link: '/reports' },
];

@Component({
    template: `
        <rtui-side-menu
            [menuItems]="items()"
            [activeMenuIds]="active()"
            [subMenuMode]="mode()"
            [subMenuWidth]="width()"
            [menuId]="menuId()"
            [favoriteActionsReserve]="reserve()"
            [favoritesCount]="count()"
            (subMenuWidthChange)="width.set($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiSideMenuComponent],
})
export class HostComponent {
    public readonly items: WritableSignal<ISideMenu.Item[]> = signal(ITEMS);
    public readonly active: WritableSignal<Array<string | number>> = signal([]);
    public readonly mode: WritableSignal<ISideMenu.SubMenuMode | undefined> = signal('hover');
    public readonly width: WritableSignal<number | null | undefined> = signal(null);
    public readonly menuId: WritableSignal<string> = signal(DEFAULT_MENU_ID);
    public readonly reserve: WritableSignal<string | undefined> = signal(undefined);
    public readonly count: WritableSignal<string | undefined> = signal(undefined);
}

export interface ISetup {
    fixture: ComponentFixture<HostComponent>;
    host: HostComponent;
}

export function setup(
    mode: ISideMenu.SubMenuMode | undefined = 'hover',
    active: Array<string | number> = [],
    narrow: boolean = false,
    items: ISideMenu.Item[] = ITEMS,
    extraProviders: Array<Provider | EnvironmentProviders> = []
): ISetup {
    const breakpoints: BreakpointServiceStub = new BreakpointServiceStub();

    breakpoints.narrow.set(narrow);

    TestBed.configureTestingModule({
        imports: [HostComponent],
        // Ловящий маршрут: пункт полосы уводит по своему адресу настоящим переходом, и пустой
        // набор маршрутов роняет на нём весь прогон отказом «нечему сопоставить адрес».
        providers: [provideRouter([{ path: '**', children: [] }]), provideNoopAnimations(), ...extraProviders],
    });
    // Замена набора провайдеров идёт целиком, поэтому токен меню объявляется здесь заново:
    // без него подпункт не находит хозяина и падает на подъёме.
    TestBed.overrideComponent(RtuiSideMenuComponent, {
        set: {
            providers: [
                { provide: BreakpointService, useValue: breakpoints },
                RtuiSubMenuHoldService,
                { provide: RTUI_SIDE_MENU, useExisting: RtuiSideMenuComponent },
            ],
        },
    });

    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

    fixture.componentInstance.items.set(items);
    fixture.componentInstance.mode.set(mode);
    fixture.componentInstance.active.set(active);
    fixture.detectChanges();

    return { fixture, host: fixture.componentInstance };
}

export function menu(fixture: ComponentFixture<HostComponent>): RtuiSideMenuComponent {
    return fixture.debugElement.children[0].componentInstance as RtuiSideMenuComponent;
}

export function subItems(fixture: ComponentFixture<HostComponent>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('rtui-side-menu-sub-item'));
}

export function hoverFirstItem(fixture: ComponentFixture<HostComponent>): void {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('.rtui-side-menu-item') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
}

export function typeInSearch(fixture: ComponentFixture<HostComponent>, query: string): void {
    const field: HTMLInputElement = fixture.nativeElement.querySelector(SEARCH_FIELD) as HTMLInputElement;

    expect(field).not.toBeNull();

    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
}

/** Уход указателя с панели: незакреплённое подменю живёт наведением и на этом закрывается. */
export function leavePanel(fixture: ComponentFixture<HostComponent>): void {
    const panel: HTMLElement = fixture.nativeElement.querySelector('mat-drawer') as HTMLElement;

    panel.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
}

/** Нажатие в поле поиска — то самое, с которого человек начинает набор. */
export function focusSearch(fixture: ComponentFixture<HostComponent>): void {
    const field: HTMLInputElement = fixture.nativeElement.querySelector(SEARCH_FIELD) as HTMLInputElement;

    expect(field).not.toBeNull();

    field.dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();
}

export function pin(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"]') as HTMLElement;
}

export function pinButton(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"] button') as HTMLElement;
}

/** Нажатие пункта полосы значков: у закреплённой моды это единственный способ сменить раздел. */
export function clickRailItem(fixture: ComponentFixture<HostComponent>, index: number): void {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rtui-side-menu-item'));

    items[index].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
}

/** Подписи пунктов подменю в том порядке, в каком они стоят на экране. */
export function subItemTitles(fixture: ComponentFixture<HostComponent>): string[] {
    const titles: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.rtui-side-menu-sub-item-title__text, .rtui-side-menu-expand-sub-item-header__title')
    );

    return titles.map((node: HTMLElement): string => (node.textContent ?? '').trim());
}

/** Заголовки раскрытых папок подменю: раскрытость видно по признаку самой панели. */
export function expandedFolderTitles(fixture: ComponentFixture<HostComponent>): string[] {
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rtui-side-menu-expand-sub-item'));

    return panels
        .filter((panel: HTMLElement): boolean => panel.classList.contains('mat-expanded'))
        .map((panel: HTMLElement): string => {
            const title: HTMLElement | null = panel.querySelector('.rtui-side-menu-expand-sub-item-header__title');

            return (title?.textContent ?? '').trim();
        });
}

/** Нажатие клавиши в поле поиска. Отдаёт само событие: съедена клавиша или нет, видно по нему. */
export function pressKeyInSearch(fixture: ComponentFixture<HostComponent>, key: string): KeyboardEvent {
    const field: HTMLInputElement = fixture.nativeElement.querySelector(SEARCH_FIELD) as HTMLInputElement;
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    field.dispatchEvent(event);
    fixture.detectChanges();

    return event;
}

/** Подписи пунктов под подсветкой клавиатуры. */
export function highlightedTitles(fixture: ComponentFixture<HostComponent>): string[] {
    const marked: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('.rtui-side-menu-sub-item--highlighted, .rtui-side-menu-expand-sub-item-header--highlighted')
    );

    return marked.map((node: HTMLElement): string => {
        const title: HTMLElement | null = node.querySelector(
            '.rtui-side-menu-sub-item-title__text, .rtui-side-menu-expand-sub-item-header__title'
        );

        return (title?.textContent ?? '').trim();
    });
}
