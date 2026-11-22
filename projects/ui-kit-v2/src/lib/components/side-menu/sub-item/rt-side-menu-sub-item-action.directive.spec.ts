import { signal, ChangeDetectionStrategy, Component, DebugElement, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../../platform';
import { createRtFixture, qaAll } from '../../../../testing/rt-kit-testing';
import { provideRtSideMenuSettings, RtSideMenuSettingsService } from '../rt-side-menu-settings.service';
import { RtSideMenuComponent } from '../rt-side-menu.component';
import { IRtSideMenu } from '../rt-side-menu.model';
import { IRtSideMenuHost, RT_SIDE_MENU } from '../rt-side-menu.tokens';
import { RtSideMenuSubItemActionDirective } from './rt-side-menu-sub-item-action.directive';
import { RtSideMenuSubItemComponent } from './rt-side-menu-sub-item.component';

const FOLDER: IRtSideMenu.Item = {
    id: 'finance',
    name: 'Финансы',
    submenu: [
        { id: 'revenue', name: 'Выручка', link: '/reports/revenue' },
        { id: 'costs', name: 'Расходы', link: '/reports/costs' },
    ],
};
const LINK: IRtSideMenu.Item = { id: 'all', name: 'Все отчёты', link: '/reports' };

/** Меню над строкой: папка раскрыта, остального строке не нужно. */
function menuHost(): IRtSideMenuHost {
    return {
        activeMenuIds: signal<ReadonlyArray<string | number>>([]),
        expandedMenuIds: signal<ReadonlyArray<string | number>>(['finance']),
        highlightedMenuId: signal<string | number | null>(null),
        subMenuQuery: signal(''),
        menuId: signal('menu'),
        menuItems: signal<ReadonlyArray<IRtSideMenu.Item>>([]),
        shownSubMenu: signal<IRtSideMenu.Item[]>([]),
        favoritesCount: signal<IRtSideMenu.FavoritesCount>('collapsed'),
        isFavoritesSearchShown: signal(true),
        ownIconTpl: signal(undefined),
        subMenuTooltipsShown: signal(false),
        subItemIconFill: signal(false),
        toggleFolder: (): void => undefined,
        toggleSubMenu: (): void => undefined,
        holdSubMenu: (): void => undefined,
    };
}

/** Строка подменю с шаблоном действия владельца. */
@Component({
    selector: 'rt-side-menu-sub-item-action-host',
    template: `
        <rt-side-menu-sub-item [item]="item()">
            <ng-template rtSideMenuSubItemAction><button type="button" qa-dataid="row-action">Ручка</button></ng-template>
        </rt-side-menu-sub-item>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSideMenuSubItemComponent, RtSideMenuSubItemActionDirective],
})
class SubItemActionHostComponent {
    public readonly item: WritableSignal<IRtSideMenu.Item> = signal<IRtSideMenu.Item>(LINK);
}

function row(item: IRtSideMenu.Item): ComponentFixture<SubItemActionHostComponent> {
    const fixture: ComponentFixture<SubItemActionHostComponent> = createRtFixture(
        SubItemActionHostComponent,
        {},
        {
            providers: [
                provideRouter([]),
                { provide: RT_SIDE_MENU, useFactory: menuHost },
                { provide: BreakpointsService, useValue: { narrow: signal(false) } },
            ] as never[],
        }
    );
    fixture.componentInstance.item.set(item);
    fixture.detectChanges();
    return fixture;
}

const FAVORITES_ITEMS: IRtSideMenu.Item[] = [
    {
        id: 'reports',
        icon: 'chart-bar',
        name: 'Отчёты',
        favorites: true,
        submenu: [
            { id: 'all', name: 'Все отчёты', link: '/reports' },
            { id: 'sales', name: 'Продажи', link: '/reports/sales' },
        ],
    },
];

function favoritesMenu(): ComponentFixture<RtSideMenuComponent> {
    const fixture: ComponentFixture<RtSideMenuComponent> = createRtFixture(
        RtSideMenuComponent,
        { menuItems: FAVORITES_ITEMS, activeMenuIds: [] },
        {
            providers: [
                provideRouter([{ path: '**', children: [] }]),
                provideRtSideMenuSettings(),
                { provide: LOCAL_STORAGE, useValue: window.localStorage },
                { provide: BreakpointsService, useValue: { narrow: signal(false) } },
            ] as never[],
        }
    );
    const settings: RtSideMenuSettingsService = TestBed.inject(RtSideMenuSettingsService);
    settings.toggleFavorite(fixture.componentInstance.menuId(), 'all');
    settings.toggleFavorite(fixture.componentInstance.menuId(), 'sales');
    (qaAll(fixture, 'side-menu-item')[0].nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    return fixture;
}

function favoriteNames(fixture: ComponentFixture<RtSideMenuComponent>): string[] {
    return Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.rt-side-menu-favorites__row .rt-side-menu-sub-item__title')
    ).map((node: Element): string => node.textContent?.trim() ?? '');
}

function handleButtons(fixture: ComponentFixture<RtSideMenuComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'side-menu-favorite-handle').map(
        (node: DebugElement): HTMLButtonElement => (node.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement
    );
}

describe('Действие строки подменю', (): void => {
    afterEach((): void => window.localStorage.clear());

    it('строка-ссылка глубины ноль рисует шаблон действия', (): void => {
        expect(qaAll(row(LINK), 'row-action').length).toBe(1);
    });

    it('SC-UKV-1723 — строка папки и строки её пунктов действия не несут', (): void => {
        const fixture: ComponentFixture<SubItemActionHostComponent> = row(FOLDER);

        expect(qaAll(fixture, 'side-menu-sub-item').length).toBe(2);
        expect(qaAll(fixture, 'row-action').length).toBe(0);
    });

    it('SC-UKV-1722 — ручка из шаблона переставляет строки избранного стрелкой', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = favoritesMenu();
        expect(favoriteNames(fixture)).toEqual(['Все отчёты', 'Продажи']);

        handleButtons(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        expect(favoriteNames(fixture)).toEqual(['Продажи', 'Все отчёты']);
    });

    it('SC-UKV-1734 — фокус едет за ручкой переставленной строки', async (): Promise<void> => {
        const fixture: ComponentFixture<RtSideMenuComponent> = favoritesMenu();
        handleButtons(fixture)[1].focus();

        handleButtons(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        const first: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rt-side-menu-favorites__row') as HTMLElement;
        expect(first.textContent).toContain('Продажи');
        expect(first.contains(document.activeElement)).toBe(true);
        expect(document.activeElement).toBe(handleButtons(fixture)[0]);
    });
});
