import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BreakpointService } from '@rt-tools/core';

import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { RtuiSideMenuComponent } from './rtui-side-menu.component';

/** Двойник службы точек перелома: сценарий сам решает, узкий экран или нет. */
class BreakpointServiceStub {
    public readonly narrow: WritableSignal<boolean> = signal(false);

    public get isMobile(): Signal<boolean> {
        return this.narrow.asReadonly();
    }
}

const ITEMS: ISideMenu.Item[] = [
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
        <rtui-side-menu [menuItems]="items" [activeMenuIds]="active()" [subMenuMode]="mode()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiSideMenuComponent],
})
class HostComponent {
    public readonly items: ISideMenu.Item[] = ITEMS;
    public readonly active: WritableSignal<Array<string | number>> = signal([]);
    public readonly mode: WritableSignal<ISideMenu.SubMenuMode> = signal('hover');
}

interface ISetup {
    fixture: ComponentFixture<HostComponent>;
    host: HostComponent;
}

function setup(mode: ISideMenu.SubMenuMode = 'hover', active: Array<string | number> = [], narrow: boolean = false): ISetup {
    const breakpoints: BreakpointServiceStub = new BreakpointServiceStub();

    breakpoints.narrow.set(narrow);

    TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [provideRouter([]), provideNoopAnimations()],
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

function menu(fixture: ComponentFixture<HostComponent>): RtuiSideMenuComponent {
    return fixture.debugElement.children[0].componentInstance as RtuiSideMenuComponent;
}

function subItems(fixture: ComponentFixture<HostComponent>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('rtui-side-menu-sub-item'));
}

function hoverFirstItem(fixture: ComponentFixture<HostComponent>): void {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('.rtui-side-menu-item') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
}

function typeInSearch(fixture: ComponentFixture<HostComponent>, query: string): void {
    const field: HTMLInputElement = fixture.nativeElement.querySelector('[qa-dataid="side-menu-search"]') as HTMLInputElement;

    expect(field).not.toBeNull();

    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
}

describe('RtuiSideMenuComponent — мода подменю', () => {
    it('SC-UK-17 — потребитель, не назвавший моду, получает подменю на наведении', () => {
        const { fixture }: ISetup = setup();

        hoverFirstItem(fixture);

        expect(subItems(fixture).length).toBe(2);

        menu(fixture).toggleSubMenu();
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(0);
    });

    it('SC-UK-18 — закреплённое подменю не закрывается уходом указателя', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        expect(subItems(fixture).length).toBe(2);

        menu(fixture).toggleSubMenu();
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);
    });

    it('SC-UK-19 — закреплённое подменю не закрывается переходом по своему пункту', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const clicks: jest.Mock = jest.fn();

        menu(fixture).clickSubMenuAction.subscribe(clicks);
        menu(fixture).onClickSubMenu({ item: (ITEMS[0].submenu ?? [])[0], event: new MouseEvent('click') });
        fixture.detectChanges();

        expect(clicks).toHaveBeenCalledTimes(1);
        expect(subItems(fixture).length).toBe(2);
    });

    it('SC-UK-20 — нажатие переключателя моду не меняет, а просит её', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);
        const asked: jest.Mock = jest.fn();

        menu(fixture).subMenuModeChange.subscribe(asked);
        (fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(asked).toHaveBeenCalledTimes(1);
        expect(asked).toHaveBeenCalledWith('hover');
        expect(host.mode()).toBe('pinned');
    });

    it('SC-UK-21 — закреплённое подменю показывает активный пункт', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const text: string = subItems(fixture)
            .map((node: HTMLElement): string => node.textContent ?? '')
            .join(' ');

        expect(text).toContain('Курсы валют');
    });

    it('SC-UK-22 — активного пункта нет — закреплённого подменю нет', () => {
        const { fixture }: ISetup = setup('pinned', []);

        expect(subItems(fixture).length).toBe(0);
    });

    it('SC-UK-23 — под закреплённым подменю нет подложки', () => {
        // Подложка ловит нажатия и невидимой: у постоянно открытой панели она делает страницу
        // нерабочей, поэтому проверяется её отсутствие, а не прозрачность.
        const { fixture }: ISetup = setup('pinned', ['refs']);

        expect(fixture.nativeElement.querySelector('.mat-drawer-backdrop')).toBeNull();
    });

    it('SC-UK-24 — на узком экране переключателя нет', () => {
        const { fixture }: ISetup = setup('pinned', ['refs'], true);

        expect(fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"]')).toBeNull();
    });
});

describe('RtuiSideMenuComponent — поиск по подменю', () => {
    it('SC-UK-28 — совпадений нет — подменю говорит об этом строкой', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        typeInSearch(fixture, 'такого пункта нет');

        const empty: HTMLElement = fixture.nativeElement.querySelector('[qa-dataid="side-menu-empty"]') as HTMLElement;

        expect(subItems(fixture).length).toBe(0);
        expect(empty.textContent?.trim()).toBe('Nothing found');
    });

    it('SC-UK-28 — совпадение оставляет свой пункт', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        typeInSearch(fixture, 'курс');

        expect(subItems(fixture).length).toBe(1);
    });

    it('SC-UK-29 — закрытое подменю открывается с пустым запросом', () => {
        const { fixture }: ISetup = setup();

        hoverFirstItem(fixture);
        typeInSearch(fixture, 'курс');

        expect(subItems(fixture).length).toBe(1);

        menu(fixture).closeSubMenu();
        fixture.detectChanges();
        hoverFirstItem(fixture);

        expect(subItems(fixture).length).toBe(2);
    });
});
