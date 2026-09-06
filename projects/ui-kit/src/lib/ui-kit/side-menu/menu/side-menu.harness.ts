import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BreakpointService } from '@rt-tools/core';

import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { RtuiSideMenuComponent } from './rtui-side-menu.component';

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

@Component({
    template: `
        <rtui-side-menu
            [menuItems]="items"
            [activeMenuIds]="active()"
            [subMenuMode]="mode()"
            [subMenuWidth]="width()"
            (subMenuWidthChange)="width.set($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiSideMenuComponent],
})
export class HostComponent {
    public readonly items: ISideMenu.Item[] = ITEMS;
    public readonly active: WritableSignal<Array<string | number>> = signal([]);
    public readonly mode: WritableSignal<ISideMenu.SubMenuMode> = signal('hover');
    public readonly width: WritableSignal<number | null> = signal(null);
}

export interface ISetup {
    fixture: ComponentFixture<HostComponent>;
    host: HostComponent;
}

export function setup(mode: ISideMenu.SubMenuMode = 'hover', active: Array<string | number> = [], narrow: boolean = false): ISetup {
    const breakpoints: BreakpointServiceStub = new BreakpointServiceStub();

    breakpoints.narrow.set(narrow);

    TestBed.configureTestingModule({
        imports: [HostComponent],
        // Ловящий маршрут: пункт полосы уводит по своему адресу настоящим переходом, и пустой
        // набор маршрутов роняет на нём весь прогон отказом «нечему сопоставить адрес».
        providers: [provideRouter([{ path: '**', children: [] }]), provideNoopAnimations()],
    });
    // Замена набора провайдеров идёт целиком, поэтому токен меню объявляется здесь заново:
    // без него подпункт не находит хозяина и падает на подъёме.
    TestBed.overrideComponent(RtuiSideMenuComponent, {
        set: {
            providers: [
                { provide: BreakpointService, useValue: breakpoints },
                { provide: RTUI_SIDE_MENU, useExisting: RtuiSideMenuComponent },
            ],
        },
    });

    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

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
    const field: HTMLInputElement = fixture.nativeElement.querySelector('[qa-dataid="side-menu-search"]') as HTMLInputElement;

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
    const field: HTMLInputElement = fixture.nativeElement.querySelector('[qa-dataid="side-menu-search"]') as HTMLInputElement;

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
