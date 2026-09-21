import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BreakpointService } from '@rt-tools/core';

import { RtuiSideMenuFavoritesComponent } from '../favorites/rtui-side-menu-favorites.component';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';
import { IRtuiFavoritesConfig, provideRtuiFavorites, RtuiFavoritesService } from '../favorites/rtui-favorites.service';
import { ISideMenu } from '../side-menu.types';
import {
    BreakpointServiceStub,
    hoverFirstItem,
    HostComponent,
    installFontsStub,
    ISetup,
    leavePanel,
    menu,
    NESTED_ITEMS,
    setup,
    typeInSearch,
} from './side-menu.harness';

const STAR: string = '[qa-dataid="side-menu-favorite-star"]';
const BLOCK: string = '[qa-dataid="side-menu-favorites"]';
const BLOCK_TITLE: string = '[qa-dataid="side-menu-favorites-title"]';
const BLOCK_ROW: string = '[qa-dataid="side-menu-favorite-row"]';

/** Три раздела полосы с подменю: избранное собирается из всех, а открыт может быть любой. */
const SECTIONS: ISideMenu.Item[] = [
    { id: 'cargo', name: 'Груз', icon: 'inventory', submenu: [{ id: 'a', name: 'Предложения', link: '/a' }] },
    { id: 'trees', name: 'Деревья', icon: 'park', submenu: [{ id: 'c', name: 'Приглашения', link: '/c' }] },
    { id: 'misc', name: 'Прочее', icon: 'more', submenu: [{ id: 'x', name: 'Настройки', link: '/x' }] },
];

beforeAll(installFontsStub);

function withFavorites(
    ids: ISideMenu.FavoriteId[],
    options: { active?: Array<string | number>; narrow?: boolean; items?: ISideMenu.Item[]; config?: IRtuiFavoritesConfig } = {}
): ISetup & { favorites: RtuiFavoritesService } {
    const result: ISetup = setup('hover', options.active ?? [], options.narrow ?? false, options.items ?? NESTED_ITEMS, [
        provideRtuiFavorites(options.config),
    ]);
    const favorites: RtuiFavoritesService = TestBed.inject(RtuiFavoritesService);

    favorites.set(ids);
    result.fixture.detectChanges();

    return { ...result, favorites };
}

function hoverItem(fixture: ComponentFixture<HostComponent>, index: number): void {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rtui-side-menu-item'));

    items[index].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
}

function listRow(fixture: ComponentFixture<HostComponent>, id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`.rtui-sub-side-menu-content__list [id="${id}"]`) as HTMLElement;
}

function blockRowIds(fixture: ComponentFixture<HostComponent>): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll(BLOCK_ROW)).map((row: Element): string => row.getAttribute('data-id') ?? '');
}

function block(fixture: ComponentFixture<HostComponent>): RtuiSideMenuFavoritesComponent {
    return fixture.debugElement.query(By.directive(RtuiSideMenuFavoritesComponent)).componentInstance as RtuiSideMenuFavoritesComponent;
}

function drop(fixture: ComponentFixture<HostComponent>, previousIndex: number, currentIndex: number, over: boolean = true): void {
    block(fixture).onDrop({ previousIndex, currentIndex, isPointerOverContainer: over } as CdkDragDrop<ISideMenu.Item[]>);
    fixture.detectChanges();
}

describe('RtuiSideMenuComponent — избранное', () => {
    it('SC-UK-75 — без сервиса в подменю нет ни звёзд, ни блока', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);

        hoverFirstItem(fixture);

        expect(listRow(fixture, 'rates')).not.toBeNull();
        expect(fixture.nativeElement.querySelector(STAR)).toBeNull();
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();
    });

    it('SC-UK-76 — звезда стоит у пунктов со ссылкой и не стоит у папки', () => {
        const { fixture } = withFavorites([], { active: ['refs', 'saved'] });

        hoverFirstItem(fixture);

        expect(listRow(fixture, 'rates').querySelector(STAR)).not.toBeNull();
        expect(listRow(fixture, 'pie').querySelector(STAR)).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.rtui-side-menu-expand-sub-item-header')).not.toBeNull();
        expect(fixture.nativeElement.querySelector(`.rtui-side-menu-expand-sub-item-header ${STAR}`)).toBeNull();
    });

    it('SC-UK-77 — звезда показывает состояние и называет следующее нажатие', () => {
        const { fixture } = withFavorites(['rates'], { items: [NESTED_ITEMS[0]] });

        hoverFirstItem(fixture);

        const onStar: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(onStar.getAttribute('aria-pressed')).toBe('true');
        expect(onStar.getAttribute('aria-label')).toBe('Remove from favourites');
        expect(onStar.classList).toContain('rtui-side-menu-sub-item-title__star--on');
    });

    it('SC-UK-77 — звезда пункта вне списка не нажата, контурная и зовёт добавить', () => {
        const { fixture } = withFavorites([], { items: [NESTED_ITEMS[0]] });

        hoverFirstItem(fixture);

        const star: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(star.getAttribute('aria-pressed')).toBe('false');
        expect(star.getAttribute('aria-label')).toBe('Add to favourites');
        expect(star.classList).not.toContain('rtui-side-menu-sub-item-title__star--on');
    });

    it('SC-UK-78 — нажатие звезды переключает избранное и никуда не ведёт', () => {
        const { fixture, favorites } = withFavorites([]);
        const emitted: jest.SpyInstance = jest.spyOn(menu(fixture).clickSubMenuAction, 'emit');

        hoverFirstItem(fixture);
        (listRow(fixture, 'rates').querySelector(`${STAR} button`) as HTMLElement).click();
        fixture.detectChanges();

        expect(favorites.ids()).toEqual(['rates']);
        expect(emitted).not.toHaveBeenCalled();
        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-79 — блок показывает избранное в порядке списка из любого раздела', () => {
        const { fixture } = withFavorites(['c', 'a'], { items: SECTIONS });

        hoverItem(fixture, 2);

        expect(listRow(fixture, 'x')).not.toBeNull();
        expect(blockRowIds(fixture)).toEqual(['c', 'a']);
    });

    it('SC-UK-80 — номера, которого в меню нет, в блоке нет, а в списке он остаётся', () => {
        const { fixture, favorites } = withFavorites(['rates', 'gone']);

        hoverFirstItem(fixture);

        expect(blockRowIds(fixture)).toEqual(['rates']);
        expect(favorites.ids()).toEqual(['rates', 'gone']);
    });

    it('SC-UK-81 — блоку нечего показать — он места не занимает', () => {
        const { fixture } = withFavorites(['gone']);

        hoverFirstItem(fixture);

        expect(listRow(fixture, 'rates')).not.toBeNull();
        expect(fixture.nativeElement.querySelector(BLOCK_TITLE)).toBeNull();
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();
    });

    it('SC-UK-82 — запрос в поиске прячет блок, пустой запрос возвращает', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);
        expect(blockRowIds(fixture)).toEqual(['rates']);

        typeInSearch(fixture, 'Кур');
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();

        typeInSearch(fixture, '');
        expect(blockRowIds(fixture)).toEqual(['rates']);
    });

    it('SC-UK-83 — строка блока открывает свой пункт так же, как строка списка', () => {
        const { fixture } = withFavorites(['rates']);
        const emitted: jest.SpyInstance = jest.spyOn(menu(fixture).clickSubMenuAction, 'emit');

        hoverFirstItem(fixture);
        (fixture.nativeElement.querySelector(`${BLOCK_ROW} mat-list-item`) as HTMLElement).click();
        fixture.detectChanges();

        expect(emitted).toHaveBeenCalledWith(expect.objectContaining({ item: expect.objectContaining({ id: 'rates' }) }));
        expect(menu(fixture).selectedSubMenu()).toBeNull();
    });

    it('SC-UK-84 — брошенная за ручку строка встаёт на новое место', () => {
        const { fixture, favorites } = withFavorites(['rates', 'pie', 'bars']);

        hoverFirstItem(fixture);
        drop(fixture, 0, 2);

        expect(blockRowIds(fixture)).toEqual(['pie', 'bars', 'rates']);
        expect(favorites.ids()).toEqual(['pie', 'bars', 'rates']);
    });

    it('SC-UK-85 — подписи приходят из настроек провайдера', () => {
        const labels: IRtuiFavoritesConfig['labels'] = { title: 'Избранное', add: 'Добавить в избранное', remove: 'Убрать из избранного' };
        const { fixture } = withFavorites(['rates'], { items: [NESTED_ITEMS[0]], config: { labels } });

        hoverFirstItem(fixture);

        expect((fixture.nativeElement.querySelector('.rtui-side-menu-favorites__title-text') as HTMLElement).textContent?.trim()).toBe(
            'Избранное'
        );
        expect(listRow(fixture, 'rates').querySelector(STAR)?.getAttribute('aria-label')).toBe('Убрать из избранного');
        expect(fixture.nativeElement.querySelector(`.rtui-sub-side-menu-content__list ${STAR}[aria-pressed="false"]`)).toBeNull();
    });

    it('SC-UK-86 — на узком экране блок стоит под полем поиска, звёзды видны без наведения', () => {
        // Подпункт меряет экран своим экземпляром службы, и узкий экран ему подменяется отдельно.
        const narrow: BreakpointServiceStub = new BreakpointServiceStub();
        narrow.narrow.set(true);
        TestBed.overrideComponent(RtuiSideMenuSubItemComponent, { add: { providers: [{ provide: BreakpointService, useValue: narrow }] } });

        const { fixture } = withFavorites(['rates'], { narrow: true });

        (fixture.nativeElement.querySelector('.rtui-mobile-side-menu-item') as HTMLElement).click();
        fixture.detectChanges();

        const search: HTMLElement = fixture.nativeElement.querySelector('[qa-dataid="side-menu-search"]') as HTMLElement;
        const favoritesBlock: HTMLElement = fixture.nativeElement.querySelector(BLOCK) as HTMLElement;

        expect(favoritesBlock).not.toBeNull();
        expect(search.compareDocumentPosition(favoritesBlock)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(fixture.nativeElement.querySelector(`${STAR}.rtui-side-menu-sub-item-title__star--always`)).not.toBeNull();
    });

    it('SC-UK-87 — брошенная строка не сдвигает номера, которых в меню нет', () => {
        const { fixture, favorites } = withFavorites(['rates', 'gone', 'pie']);

        hoverFirstItem(fixture);
        drop(fixture, 1, 0);

        expect(blockRowIds(fixture)).toEqual(['pie', 'rates']);
        expect(favorites.ids()).toEqual(['pie', 'gone', 'rates']);
    });

    it('SC-UK-88 — доводка в видимую часть целится в строку списка, а не в строку блока', () => {
        const { fixture } = withFavorites(['rates'], { active: ['refs', 'rates'] });

        hoverFirstItem(fixture);

        const carriers: Element[] = Array.from(fixture.nativeElement.querySelectorAll('[id="rates"]'));

        expect(fixture.nativeElement.querySelector(BLOCK_ROW)).not.toBeNull();
        expect(carriers.length).toBe(1);
        expect(carriers[0].closest(BLOCK)).toBeNull();
    });

    it('SC-UK-89 — закрашенная звезда помечена всегда, контурная отдана наведению и фокусу', () => {
        const { fixture } = withFavorites(['rates'], { items: [NESTED_ITEMS[0]], active: ['refs', 'saved'] });

        hoverFirstItem(fixture);

        expect(listRow(fixture, 'rates').querySelector(STAR)?.classList).toContain('rtui-side-menu-sub-item-title__star--on');
        expect(listRow(fixture, 'pie').querySelector(STAR)?.classList).not.toContain('rtui-side-menu-sub-item-title__star--on');
        expect(listRow(fixture, 'pie').querySelector(STAR)?.classList).not.toContain('rtui-side-menu-sub-item-title__star--always');
    });

    it('SC-UK-90 — фокус на звезде держит подменю, открытое наведением', () => {
        const { fixture } = withFavorites([]);

        hoverFirstItem(fixture);
        (listRow(fixture, 'rates').querySelector(STAR) as HTMLElement).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-90 — строка в руке держит подменю, открытое наведением', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);
        block(fixture).onDragStart();
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-91 — строка, брошенная вне блока, ничего не меняет', () => {
        const { fixture, favorites } = withFavorites(['rates', 'pie']);

        hoverFirstItem(fixture);
        drop(fixture, 0, 1, false);

        expect(favorites.ids()).toEqual(['rates', 'pie']);
    });

    it('SC-UK-92 — строка блока отмечена активной, как и строка списка', () => {
        const { fixture } = withFavorites(['rates'], { active: ['refs', 'rates'] });

        hoverFirstItem(fixture);

        const blockItem: HTMLElement = fixture.nativeElement.querySelector(`${BLOCK_ROW} mat-list-item`) as HTMLElement;

        expect(listRow(fixture, 'rates').classList).toContain('mdc-list-item--activated');
        expect(blockItem.classList).toContain('mdc-list-item--activated');
    });
});
