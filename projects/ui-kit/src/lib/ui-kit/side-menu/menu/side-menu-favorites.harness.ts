import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { RtuiSideMenuFavoritesComponent } from '../favorites/rtui-side-menu-favorites.component';
import {
    IRtuiSideMenuFavoritesConfig,
    provideRtuiSideMenuFavorites,
    RtuiSideMenuFavoritesService,
} from '../favorites/rtui-side-menu-favorites.service';
import { ISideMenu } from '../side-menu.types';
import { HostComponent, ISetup, NESTED_ITEMS, setup } from './side-menu.harness';

/*
 * Обвязка спеков избранного: адреса узлов, разделы с флагом и без, подъём меню с сервисом.
 * Спеков два — поведение строк и кнопок и выбор раздела, — и обвязка у них общая.
 */

export const STAR: string = '[qa-dataid="side-menu-favorite-star"]';
export const BLOCK: string = '[qa-dataid="side-menu-favorites"]';
export const BLOCK_TITLE: string = '[qa-dataid="side-menu-favorites-title"]';
export const BLOCK_ROW: string = '[qa-dataid="side-menu-favorite-row"]';
export const REMOVE: string = '[qa-dataid="side-menu-favorite-remove"]';
export const HANDLE: string = '[qa-dataid="side-menu-favorite-handle"]';
export const ON: string = 'rtui-side-menu-sub-item-title__favorite--on';
export const ALWAYS: string = 'rtui-side-menu-sub-item-title__favorite--always';

/** Три раздела полосы с подменю: избранное включено у двух первых, у третьего оно выключено. */
export const SECTIONS: ISideMenu.Item[] = [
    {
        id: 'cargo',
        name: 'Груз',
        icon: 'inventory',
        favorites: true,
        submenu: [
            { id: 'a', name: 'Предложения', link: '/a' },
            { id: 'b', name: 'Отчёты', link: '/b' },
        ],
    },
    { id: 'trees', name: 'Деревья', icon: 'park', favorites: true, submenu: [{ id: 'c', name: 'Приглашения', link: '/c' }] },
    { id: 'misc', name: 'Прочее', icon: 'more', submenu: [{ id: 'x', name: 'Настройки', link: '/x' }] },
];

/** Пункты полосы с включённым избранным: без флага раздел звёзд и блока не показывает. */
export function enabled(items: ISideMenu.Item[]): ISideMenu.Item[] {
    return items.map((item: ISideMenu.Item): ISideMenu.Item => (item.submenu ? { ...item, favorites: true } : item));
}

export function withFavorites(
    ids: ISideMenu.FavoriteId[],
    options: {
        active?: Array<string | number>;
        narrow?: boolean;
        items?: ISideMenu.Item[];
        config?: IRtuiSideMenuFavoritesConfig;
        mode?: ISideMenu.SubMenuMode;
    } = {}
): ISetup & { favorites: RtuiSideMenuFavoritesService } {
    const result: ISetup = setup(
        options.mode ?? 'hover',
        options.active ?? [],
        options.narrow ?? false,
        options.items ?? enabled(NESTED_ITEMS),
        [provideRtuiSideMenuFavorites(options.config)]
    );
    const favorites: RtuiSideMenuFavoritesService = TestBed.inject(RtuiSideMenuFavoritesService);

    favorites.set(ids);
    result.fixture.detectChanges();

    return { ...result, favorites };
}

export function hoverItem(fixture: ComponentFixture<HostComponent>, index: number): void {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rtui-side-menu-item'));

    items[index].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
}

export function listRow(fixture: ComponentFixture<HostComponent>, id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`.rtui-sub-side-menu-content__list [id="${id}"]`) as HTMLElement;
}

export function blockRowIds(fixture: ComponentFixture<HostComponent>): string[] {
    return Array.from<Element>(fixture.nativeElement.querySelectorAll(BLOCK_ROW)).map(
        (row: Element): string => row.getAttribute('data-id') ?? ''
    );
}

export function block(fixture: ComponentFixture<HostComponent>): RtuiSideMenuFavoritesComponent {
    return fixture.debugElement.query(By.directive(RtuiSideMenuFavoritesComponent)).componentInstance as RtuiSideMenuFavoritesComponent;
}

/** Бросок строки через сам список CDK: так проверяется и привязка события в разметке блока. */
export function drop(fixture: ComponentFixture<HostComponent>, previousIndex: number, currentIndex: number, over: boolean = true): void {
    const list: CdkDropList = fixture.debugElement.query(By.directive(CdkDropList)).injector.get(CdkDropList);

    list.dropped.emit({ previousIndex, currentIndex, isPointerOverContainer: over } as CdkDragDrop<ISideMenu.Item[]>);
    fixture.detectChanges();
}

/** Фокус с клавиатуры: движок тестов не ведёт `:focus-visible`, и ответ ему подменяется. */
export function keyboardFocus(target: HTMLElement, keyboard: boolean = true): void {
    const matches: jest.SpyInstance = jest
        .spyOn(target, 'matches')
        .mockImplementation((selector: string): boolean => (selector === ':focus-visible' ? keyboard : false));

    target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    matches.mockRestore();
}

export function tooltip(fixture: ComponentFixture<HostComponent>, selector: string): MatTooltip {
    return fixture.debugElement.query(By.css(selector)).injector.get(MatTooltip);
}
