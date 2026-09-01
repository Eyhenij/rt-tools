import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BreakpointService } from '@rt-tools/core';

import { SUB_MENU_WIDTH_MAX } from '../side-menu.logic';
import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { RtuiSideMenuComponent } from './rtui-side-menu.component';

/**
 * Двойник набора шрифтов документа. Значок кита спрашивает у него, доехал ли шрифт значков, а в
 * среде спек `document.fonts` нет вовсе: без подмены падает всё, что рисует готовую кнопку.
 */
beforeAll((): void => {
    if (!('fonts' in document)) {
        Object.defineProperty(document, 'fonts', {
            configurable: true,
            value: { check: (): boolean => true, ready: Promise.resolve() },
        });
    }
});

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
class HostComponent {
    public readonly items: ISideMenu.Item[] = ITEMS;
    public readonly active: WritableSignal<Array<string | number>> = signal([]);
    public readonly mode: WritableSignal<ISideMenu.SubMenuMode> = signal('hover');
    public readonly width: WritableSignal<number | null> = signal(null);
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

function pin(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"]') as HTMLElement;
}

function pinButton(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('[qa-dataid="side-menu-pin"] button') as HTMLElement;
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
        pinButton(fixture).click();
        fixture.detectChanges();

        expect(asked).toHaveBeenCalledTimes(1);
        expect(asked).toHaveBeenCalledWith('hover');
        expect(host.mode()).toBe('pinned');
    });

    it('SC-UK-30 — закрепление не меняет того, что видно', () => {
        // Промах, найденный владельцем в витрине: содержимое бралось только из входа
        // активности, и нажатие переключателя схлопывало открытое наведением подменю.
        const { fixture, host }: ISetup = setup();

        hoverFirstItem(fixture);

        expect(subItems(fixture).length).toBe(2);

        pinButton(fixture).click();
        host.mode.set('pinned');
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);
    });

    it('SC-UK-22 — активного пункта нет и не открыто ничего — закреплённого подменю нет', () => {
        const { fixture }: ISetup = setup('pinned', []);

        expect(subItems(fixture).length).toBe(0);
    });

    it('SC-UK-21 — закреплённое подменю показывает активный пункт', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const text: string = subItems(fixture)
            .map((node: HTMLElement): string => node.textContent ?? '')
            .join(' ');

        expect(text).toContain('Курсы валют');
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
    it('SC-UK-31 — закреплённое и незакреплённое подменю помечены разным видом кнопки', () => {
        // Промах, найденный владельцем в витрине: пара значков держалась на оси переменного
        // шрифта, а показ грузит статический набор — ось он не читает вовсе, и оба состояния
        // рисовались одним залитым глифом. Состояние поэтому показывает цвет значка кнопки,
        // который ведёт вход готового кита, а не заливка глифа.
        const { fixture, host }: ISetup = setup();

        hoverFirstItem(fixture);

        const loose: string = pin(fixture).className;

        host.mode.set('pinned');
        fixture.detectChanges();

        const held: string = pin(fixture).className;

        expect(loose).not.toBe(held);
        expect(loose).toContain('rtui-button--variant-default');
        expect(held).toContain('rtui-button--variant-primary');
    });
});

function resizer(fixture: ComponentFixture<HostComponent>): HTMLElement | null {
    return fixture.nativeElement.querySelector('[qa-dataid="side-menu-resize"]') as HTMLElement | null;
}

/** Тяга края: нажатие на ручке, ведение и отпускание идут документом, а не самой ручкой. */
function drag(fixture: ComponentFixture<HostComponent>, from: number, to: number): void {
    const handle: HTMLElement = resizer(fixture) as HTMLElement;

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: from }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: to }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: to }));
    fixture.detectChanges();
}

describe('SC-UK-35 — край закреплённого подменю тянется указателем', () => {
    it('тяга отдаёт наружу новую ширину', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 260);

        expect(host.width()).toBe(260);
    });

    // Натянутая ширина кладётся своим свойством: панель берёт наибольшее из неё и той, что задало
    // оформление, и заданная оформлением ширина остаётся нижним пределом сама по себе.
    it('панель становится той ширины, которую вернул потребитель', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 260);

        const menuElement: HTMLElement = fixture.nativeElement.querySelector('rtui-side-menu') as HTMLElement;

        expect(menuElement.style.getPropertyValue('--rt-side-menu-sub-menu-dragged-width')).toBe('260px');
        expect(menuElement.style.getPropertyValue('--rt-side-menu-sub-menu-width')).toBe('');
    });

    it('тяга за предел отдаёт предельную ширину', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 5000);

        expect(host.width()).toBe(SUB_MENU_WIDTH_MAX);
    });

    it('у незакреплённого подменю края не тянут', () => {
        const { fixture }: ISetup = setup();

        hoverFirstItem(fixture);

        expect(resizer(fixture)).toBeNull();
    });
});

/** Отмеченные куски подписей: подсветка помечена своим элементом, а не разметкой браузера. */
function highlights(fixture: ComponentFixture<HostComponent>): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.rtui-side-menu-sub-item-title__match')).map(
        (node: unknown): string => (node as HTMLElement).textContent?.trim() ?? ''
    );
}

describe('SC-UK-36 — в отобранной подписи отмечено то, чем она совпала', () => {
    it('отмечено ровно набранное', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        typeInSearch(fixture, 'курс');

        expect(highlights(fixture)).toEqual(['Курс']);
    });

    it('пустой запрос ничего не отмечает', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        expect(highlights(fixture)).toEqual([]);
    });

    it('подпись остаётся целой: отмечен кусок, а не подменён текст', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        typeInSearch(fixture, 'курс');

        const title: HTMLElement = fixture.nativeElement.querySelector('.rtui-side-menu-sub-item-title__text') as HTMLElement;

        expect(title.textContent?.replace(/\s+/g, ' ').trim()).toBe('Курсы валют');
    });
});

describe('SC-UK-37 — поле поиска подменю рисуется готовым кита', () => {
    it('поле стоит в оболочке поля кита, а не голым вводом', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        const field: HTMLElement | null = fixture.nativeElement.querySelector('[qa-dataid="side-menu-search"]');

        expect(field?.closest('mat-form-field')).not.toBeNull();
    });

    it('при пустом запросе кнопка очистки не видна', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        // Готовое прячет кнопку модификатором, а не снятием узла: проверяется то, что оно делает.
        const clear: HTMLElement | null = fixture.nativeElement.querySelector('rtui-clear-button button');

        expect(clear).not.toBeNull();
        expect(clear?.classList.contains('rtui-clear-button--invisible')).toBe(true);
    });

    it('кнопка очистки возвращает полный список', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        typeInSearch(fixture, 'курс');
        expect(subItems(fixture).length).toBe(1);

        const clear: HTMLElement = fixture.nativeElement.querySelector('rtui-clear-button button') as HTMLElement;

        expect(clear.classList.contains('rtui-clear-button--invisible')).toBe(false);

        clear.click();
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);
    });
});
