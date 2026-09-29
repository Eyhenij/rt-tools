import { DebugElement, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { provideRtSideMenuSettings, RtSideMenuSettingsService } from './rt-side-menu-settings.service';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { IRtSideMenu } from './rt-side-menu.model';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(false);
}

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'home', icon: 'home', name: 'Главная', link: '/home' },
    {
        id: 'reports',
        icon: 'chart-bar',
        name: 'Отчёты',
        submenu: [
            { id: 'sales', name: 'Продажи', link: '/reports/sales' },
            {
                id: 'finance',
                name: 'Финансы',
                submenu: [{ id: 'revenue', name: 'Выручка', link: '/reports/finance/revenue' }],
            },
            { id: 'stock', name: 'Склад', link: '/reports/stock', iconButton: { icon: 'plus', data: 'new-stock' } },
        ],
    },
];

interface ISetup {
    fixture: ComponentFixture<RtSideMenuComponent>;
    breakpoints: StubBreakpointsService;
    storage: Storage;
}

function memoryStorage(): Storage {
    const values: Map<string, string> = new Map();

    return {
        get length(): number {
            return values.size;
        },
        clear: (): void => values.clear(),
        getItem: (key: string): string | null => values.get(key) ?? null,
        key: (index: number): string | null => [...values.keys()][index] ?? null,
        removeItem: (key: string): void => {
            values.delete(key);
        },
        setItem: (key: string, value: string): void => {
            values.set(key, value);
        },
    };
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ISetup {
    const breakpoints: StubBreakpointsService = new StubBreakpointsService();
    const storage: Storage = memoryStorage();
    const fixture: ComponentFixture<RtSideMenuComponent> = createRtFixture(
        RtSideMenuComponent,
        { menuItems: ITEMS, activeMenuIds: [], ...inputs },
        {
            providers: [
                provideRouter([{ path: '**', children: [] }]),
                provideRtSideMenuSettings(),
                { provide: LOCAL_STORAGE, useValue: storage },
                { provide: BreakpointsService, useValue: breakpoints },
            ],
        }
    );

    return { fixture, breakpoints, storage };
}

function railItem(fixture: ComponentFixture<RtSideMenuComponent>, index: number): HTMLElement {
    return qaAll(fixture, 'side-menu-item')[index].nativeElement as HTMLElement;
}

function hoverReports(fixture: ComponentFixture<RtSideMenuComponent>): void {
    railItem(fixture, 1).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
}

function search(fixture: ComponentFixture<RtSideMenuComponent>, query: string): void {
    const input: HTMLInputElement = (qa(fixture, 'side-menu-search')?.nativeElement as HTMLElement).querySelector(
        'input'
    ) as HTMLInputElement;

    input.value = query;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function rowTitles(fixture: ComponentFixture<RtSideMenuComponent>): string[] {
    return [...qaAll(fixture, 'side-menu-sub-item'), ...qaAll(fixture, 'side-menu-folder')].map((row: DebugElement): string => textOf(row));
}

describe('RtSideMenuComponent', (): void => {
    it('рисует пункты полосы: ссылку — ссылкой, раздел без адреса — кнопкой', (): void => {
        const { fixture } = setup();

        expect(railItem(fixture, 0).tagName).toBe('A');
        expect(railItem(fixture, 0).getAttribute('href')).toBe('/home');
        expect(railItem(fixture, 1).tagName).toBe('BUTTON');
    });

    it('активный пункт полосы помечен для диктора', (): void => {
        const { fixture } = setup({ activeMenuIds: ['home'] });

        expect(railItem(fixture, 0).getAttribute('aria-current')).toBe('page');
    });

    it('наведение на раздел открывает подменю, уход указателя закрывает', (): void => {
        const { fixture } = setup();

        expect(qa(fixture, 'side-menu-panel')).toBeNull();

        hoverReports(fixture);
        expect(qa(fixture, 'side-menu-panel')).not.toBeNull();

        (qa(fixture, 'side-menu-panel')?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();
        expect(qa(fixture, 'side-menu-panel')).toBeNull();
    });

    it('SC-UKV-406 — поиск спускается в папку и отмечает совпавшее', (): void => {
        const { fixture } = setup();

        hoverReports(fixture);
        search(fixture, 'выр');

        expect(rowTitles(fixture)).toEqual(['Выручка', 'Финансы']);
        expect(textOf(fixture.debugElement.nativeElement.querySelector('.rt-side-menu-sub-item__match'))).toBe('Выр');
    });

    it('поиск без совпадений говорит, что ничего не найдено', (): void => {
        const { fixture } = setup();

        hoverReports(fixture);
        search(fixture, 'нет такого');

        expect(qa(fixture, 'side-menu-empty')).not.toBeNull();
    });

    it('подменю, взятое полем поиска, уход указателя не закрывает, а подложка закрывает', (): void => {
        const { fixture } = setup();

        hoverReports(fixture);
        search(fixture, 'про');
        (qa(fixture, 'side-menu-panel')?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();
        expect(qa(fixture, 'side-menu-panel')).not.toBeNull();

        (qa(fixture, 'side-menu-backdrop')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(qa(fixture, 'side-menu-panel')).toBeNull();
    });

    it('нажатие на папку раскрывает её, повторное сворачивает', (): void => {
        const { fixture } = setup();

        hoverReports(fixture);
        const folder: HTMLElement = qa(fixture, 'side-menu-folder')?.nativeElement as HTMLElement;

        folder.click();
        fixture.detectChanges();
        expect(rowTitles(fixture)).toContain('Выручка');

        folder.click();
        fixture.detectChanges();
        expect(rowTitles(fixture)).not.toContain('Выручка');
    });

    it('нажатие на пункт подменю уходит наружу и закрывает незакреплённое подменю', (): void => {
        const { fixture } = setup();
        const clicked: IRtSideMenu.Item[] = [];

        fixture.componentInstance.clickSubMenuAction.subscribe((payload: { item: IRtSideMenu.Item }): number => clicked.push(payload.item));
        hoverReports(fixture);
        (qaAll(fixture, 'side-menu-sub-item')[0].nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(clicked.map((item: IRtSideMenu.Item): string | number => item.id)).toEqual(['sales']);
        expect(qa(fixture, 'side-menu-panel')).toBeNull();
    });

    it('кнопка строки уходит наружу со своими данными и не нажимает строку', (): void => {
        const { fixture } = setup();
        const data: unknown[] = [];
        const clicked: unknown[] = [];

        fixture.componentInstance.clickSubMenuAdditionalAction.subscribe((payload: { data: unknown }): number => data.push(payload.data));
        fixture.componentInstance.clickSubMenuAction.subscribe((payload: unknown): number => clicked.push(payload));
        hoverReports(fixture);
        (qa(fixture, 'side-menu-sub-item-action')?.nativeElement.querySelector('button') as HTMLElement).click();

        expect(data).toEqual(['new-stock']);
        expect(clicked).toEqual([]);
    });

    it('SC-UKV-408 — стрелка вниз в поле поиска подсвечивает первую строку', (): void => {
        const { fixture } = setup();

        hoverReports(fixture);
        const input: HTMLInputElement = (qa(fixture, 'side-menu-search')?.nativeElement as HTMLElement).querySelector(
            'input'
        ) as HTMLInputElement;

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.highlightedMenuId()).toBe('sales');
    });

    it('SC-UKV-409 — закрепление пишется в настройки и уходит наружу', (): void => {
        const { fixture } = setup({ menuId: 'main' });
        const modes: IRtSideMenu.SubMenuMode[] = [];

        fixture.componentInstance.subMenuModeChange.subscribe((mode: IRtSideMenu.SubMenuMode): number => modes.push(mode));
        hoverReports(fixture);
        (qa(fixture, 'side-menu-pin')?.nativeElement.querySelector('button') as HTMLElement).click();
        fixture.detectChanges();

        expect(modes).toEqual(['pinned']);
        expect(fixture.debugElement.injector.get(RtSideMenuSettingsService).subMenuMode('main')()).toBe('pinned');
    });

    it('закреплённое подменю показывает раздел активного адреса и не закрывается уходом указателя', (): void => {
        const { fixture } = setup({ subMenuMode: 'pinned', activeMenuIds: ['reports', 'sales'] });

        expect(qa(fixture, 'side-menu-panel')).not.toBeNull();
        (qa(fixture, 'side-menu-panel')?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();
        expect(qa(fixture, 'side-menu-panel')).not.toBeNull();
        expect(qa(fixture, 'side-menu-resize')).not.toBeNull();
    });

    it('SC-UKV-411 — стрелка на ручке ширины шагает и просит ширину наружу', (): void => {
        const { fixture } = setup({ subMenuMode: 'pinned', subMenuWidth: 470, activeMenuIds: ['reports'] });
        const widths: number[] = [];

        fixture.componentInstance.subMenuWidthChange.subscribe((width: number): number => widths.push(width));
        (qa(fixture, 'side-menu-resize')?.nativeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

        expect(widths).toEqual([480]);
    });

    it('без своей ширины свойство панели не ставится: ширину берёт оформление', (): void => {
        const { fixture } = setup();

        expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--rt-side-menu-panel-dragged-width')).toBe('');

        setInputs(fixture, { subMenuWidth: 300 });
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--rt-side-menu-panel-dragged-width')).toBe('300px');
    });

    it('узкий экран рисует столбец: раздел открывает подменю с кнопкой назад', (): void => {
        const { fixture, breakpoints } = setup();

        breakpoints.narrow.set(true);
        fixture.detectChanges();
        railItem(fixture, 1).click();
        fixture.detectChanges();

        expect(qa(fixture, 'side-menu-back')).not.toBeNull();
        expect(rowTitles(fixture)).toContain('Продажи');

        (qa(fixture, 'side-menu-back')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        expect(qa(fixture, 'side-menu-back')).toBeNull();
    });

    it('на узком экране переход по пункту просит закрыть мобильное меню', (): void => {
        const { fixture, breakpoints } = setup();
        let closed: number = 0;

        fixture.componentInstance.closeMobileMenuAction.subscribe((): number => (closed += 1));
        breakpoints.narrow.set(true);
        fixture.detectChanges();
        railItem(fixture, 0).click();

        expect(closed).toBe(1);
    });
});
