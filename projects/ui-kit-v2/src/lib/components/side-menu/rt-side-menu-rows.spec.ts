import { signal, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qaAll } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtScrollAreaComponent } from '../scroll-area/rt-scroll-area.component';
import { provideRtSideMenuSettings, RtSideMenuSettingsService } from './rt-side-menu-settings.service';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { IRtSideMenu } from './rt-side-menu.model';

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'home', icon: 'users', name: 'Главная', link: '/home' },
    {
        id: 'reports',
        icon: 'chart-bar',
        name: 'Отчёты',
        favorites: true,
        submenu: [
            { id: 'all', icon: 'users', name: 'Все отчёты', link: '/reports' },
            { id: 'finance', icon: 'folder', name: 'Финансы', submenu: [{ id: 'revenue', name: 'Выручка', link: '/reports/revenue' }] },
        ],
    },
];

type TClick = { item: IRtSideMenu.Item; event: MouseEvent };

function menu(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSideMenuComponent> {
    return createRtFixture(
        RtSideMenuComponent,
        { menuItems: ITEMS, activeMenuIds: [], ...inputs },
        {
            providers: [
                provideRouter([{ path: '**', children: [] }]),
                provideRtSideMenuSettings(),
                { provide: LOCAL_STORAGE, useValue: window.localStorage },
                { provide: BreakpointsService, useValue: { narrow: signal(false) } },
            ] as never[],
        }
    );
}

function hover<T>(fixture: ComponentFixture<T>, index: number): void {
    (qaAll(fixture, 'side-menu-item')[index].nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
}

function panel<T>(fixture: ComponentFixture<T>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.rt-side-menu__panel');
}

function rows<T>(fixture: ComponentFixture<T>): HTMLAnchorElement[] {
    return qaAll(fixture, 'side-menu-sub-item').map((node: DebugElement): HTMLAnchorElement => node.nativeElement as HTMLAnchorElement);
}

function press(row: HTMLElement, init: MouseEventInit = {}): MouseEvent {
    const event: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    row.dispatchEvent(event);
    return event;
}

describe('Строки и панель бокового меню', (): void => {
    afterEach((): void => {
        window.localStorage.clear();
        jest.useRealTimers();
    });

    it('SC-UKV-794 — значки строки и папки залиты только входом', (): void => {
        const fills: (fixture: ComponentFixture<RtSideMenuComponent>) => boolean[] = (
            fixture: ComponentFixture<RtSideMenuComponent>
        ): boolean[] =>
            fixture.debugElement
                .queryAll(By.directive(RtIconComponent))
                .filter((node: DebugElement): boolean =>
                    (node.nativeElement as HTMLElement).classList.contains('rt-side-menu-sub-item__icon')
                )
                .map((node: DebugElement): boolean => node.injector.get(RtIconComponent).fill());

        const plain: ComponentFixture<RtSideMenuComponent> = menu();
        hover(plain, 1);
        expect(fills(plain)).toEqual([false, false]);

        const filled: ComponentFixture<RtSideMenuComponent> = menu({ subItemIconFill: true });
        hover(filled, 1);
        expect(fills(filled)).toEqual([true, true]);
    });

    it('SC-UKV-806 — значок кнопки потребителя в строке залит тем же входом, что и значки строк', (): void => {
        const withButton: IRtSideMenu.Item[] = [
            ITEMS[0],
            { ...ITEMS[1], submenu: [{ id: 'all', name: 'Все отчёты', link: '/reports', iconButton: { icon: 'plus' } }] },
        ];
        const fill: (fixture: ComponentFixture<RtSideMenuComponent>) => boolean = (
            fixture: ComponentFixture<RtSideMenuComponent>
        ): boolean => qaAll(fixture, 'side-menu-sub-item-action')[0].injector.get(RtIconButtonComponent).iconFill();

        const plain: ComponentFixture<RtSideMenuComponent> = menu({ menuItems: withButton });
        hover(plain, 1);
        expect(fill(plain)).toBe(false);

        const filled: ComponentFixture<RtSideMenuComponent> = menu({ menuItems: withButton, subItemIconFill: true });
        hover(filled, 1);
        expect(fill(filled)).toBe(true);
    });

    it('SC-UKV-795 — нажатие строки сначала у потребителя; отменённое не переходит, с клавишей остаётся браузеру', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu();
        const navigate: jest.SpyInstance = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
        let prevent: boolean = false;
        const seen: string[] = [];
        fixture.componentInstance.clickSubMenuAction.subscribe(({ item, event }: TClick): void => {
            seen.push(`${item.id}:${navigate.mock.calls.length}`);
            if (prevent) {
                event.preventDefault();
            }
        });
        hover(fixture, 1);
        const row: HTMLAnchorElement = rows(fixture)[0];
        expect(row.getAttribute('href')).toBe('/reports');

        expect(press(row).defaultPrevented).toBe(true);
        expect(seen).toEqual(['all:0']);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(TestBed.inject(Router).serializeUrl(navigate.mock.calls[0][0])).toBe('/reports');

        hover(fixture, 1);
        prevent = true;
        press(rows(fixture)[0]);
        expect(navigate).toHaveBeenCalledTimes(1);

        hover(fixture, 1);
        prevent = false;
        expect(press(rows(fixture)[0], { metaKey: true }).defaultPrevented).toBe(false);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(seen.length).toBe(3);
    });

    it('SC-UKV-795 — строка блока избранного отдаёт нажатие потребителю так же', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu();
        TestBed.inject(RtSideMenuSettingsService).toggleFavorite(fixture.componentInstance.menuId(), 'all');
        const navigate: jest.SpyInstance = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
        fixture.componentInstance.clickSubMenuAction.subscribe(({ event }: TClick): void => event.preventDefault());
        hover(fixture, 1);

        const favorite: HTMLAnchorElement | undefined = rows(fixture).find(
            (row: HTMLAnchorElement): boolean => row.closest('.rt-side-menu-favorites__row') !== null
        );
        expect(favorite?.getAttribute('href')).toBe('/reports');
        press(favorite as HTMLAnchorElement);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('SC-UKV-796 — подменю наведения закрывается через задержку, возврат держит его открытым', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtSideMenuComponent> = menu({ subMenuCloseDelay: 500 });
        const leave: () => void = (): void => {
            panel(fixture)?.dispatchEvent(new MouseEvent('mouseleave'));
            fixture.detectChanges();
        };
        hover(fixture, 1);

        leave();
        jest.advanceTimersByTime(400);
        fixture.detectChanges();
        expect(panel(fixture)).not.toBeNull();
        panel(fixture)?.dispatchEvent(new MouseEvent('mouseenter'));
        jest.advanceTimersByTime(600);
        fixture.detectChanges();
        expect(panel(fixture)).not.toBeNull();

        hover(fixture, 0);
        jest.advanceTimersByTime(400);
        fixture.detectChanges();
        expect(panel(fixture)).not.toBeNull();
        hover(fixture, 1);
        jest.advanceTimersByTime(600);
        fixture.detectChanges();
        expect(panel(fixture)).not.toBeNull();

        leave();
        jest.advanceTimersByTime(500);
        fixture.detectChanges();
        expect(panel(fixture)).toBeNull();
    });

    it('SC-UKV-796 — без задержки уход с панели закрывает подменю сразу', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu();
        hover(fixture, 1);

        panel(fixture)?.dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();
        expect(panel(fixture)).toBeNull();
    });

    it('SC-UKV-797 — подсказка прокрутки у панели только по входу', (): void => {
        const hint: (fixture: ComponentFixture<RtSideMenuComponent>) => boolean | undefined = (
            fixture: ComponentFixture<RtSideMenuComponent>
        ): boolean | undefined =>
            fixture.debugElement
                .queryAll(By.directive(RtScrollAreaComponent))
                .find((node: DebugElement): boolean => (node.nativeElement as HTMLElement).classList.contains('rt-side-menu__panel-body'))
                ?.injector.get(RtScrollAreaComponent)
                .isScrollHintShown();

        const plain: ComponentFixture<RtSideMenuComponent> = menu();
        hover(plain, 1);
        expect(hint(plain)).toBe(false);

        const shown: ComponentFixture<RtSideMenuComponent> = menu({ panelScrollHintShown: true });
        hover(shown, 1);
        expect(hint(shown)).toBe(true);
    });
});
