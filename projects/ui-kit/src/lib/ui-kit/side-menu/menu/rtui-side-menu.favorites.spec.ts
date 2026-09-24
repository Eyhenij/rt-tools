import { DEFAULT_MENU_ID } from '../settings/side-menu-settings.logic';
import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BreakpointService } from '@rt-tools/core';

import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';
import { IRtuiSideMenuSettingsConfig } from '../settings/rtui-side-menu-settings.service';
import {
    BreakpointServiceStub,
    hoverFirstItem,
    installFontsStub,
    ISetup,
    leavePanel,
    menu,
    NESTED_ITEMS,
    setup,
    typeInSearch,
} from './side-menu.harness';
import {
    block,
    BLOCK,
    BLOCK_ROW,
    BLOCK_TITLE,
    blockRowIds,
    drop,
    enabled,
    HANDLE,
    hoverItem,
    keyboardFocus,
    listRow,
    ON,
    REMOVE,
    STAR,
    tooltip,
    withFavorites,
    SECTIONS,
} from './side-menu-favorites.harness';

beforeAll(installFontsStub);

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
        const { fixture } = withFavorites(['rates'], { items: enabled([NESTED_ITEMS[0]]) });

        hoverFirstItem(fixture);

        const onStar: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(onStar.getAttribute('aria-label')).toBe('Remove from favourites');
        expect(onStar.classList).toContain(ON);
        expect(onStar.querySelector('mat-icon')?.textContent?.trim()).toBe('star');
    });

    it('SC-UK-77 — звезда пункта вне списка полая и зовёт добавить', () => {
        const { fixture } = withFavorites([], { items: enabled([NESTED_ITEMS[0]]) });

        hoverFirstItem(fixture);

        const star: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(star.getAttribute('aria-label')).toBe('Add to favourites');
        expect(star.classList).not.toContain(ON);
        expect(star.querySelector('mat-icon')?.textContent?.trim()).toBe('star_border');
    });

    it('SC-UK-78 — нажатие звезды переключает избранное и никуда не ведёт', () => {
        const { fixture, favorites } = withFavorites([]);
        const emitted: jest.SpyInstance = jest.spyOn(menu(fixture).clickSubMenuAction, 'emit');

        hoverFirstItem(fixture);
        (listRow(fixture, 'rates').querySelector(STAR) as HTMLElement).click();
        fixture.detectChanges();

        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['rates']);
        expect(emitted).not.toHaveBeenCalled();
        expect(menu(fixture).selectedSubMenu()).not.toBeNull();

        const star: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(star.classList).toContain(ON);
        expect(star.querySelector('mat-icon')?.textContent?.trim()).toBe('star');
        expect(star.getAttribute('aria-label')).toBe('Remove from favourites');
    });

    it('SC-UK-94 — строка блока несёт кнопку «убрать», а не звезду, и кнопка убирает пункт', () => {
        const { fixture, favorites } = withFavorites(['rates', 'pie']);
        const emitted: jest.SpyInstance = jest.spyOn(menu(fixture).clickSubMenuAction, 'emit');

        hoverFirstItem(fixture);

        const row: HTMLElement = fixture.nativeElement.querySelector(BLOCK_ROW) as HTMLElement;
        const remove: HTMLElement = row.querySelector(REMOVE) as HTMLElement;

        expect(remove).not.toBeNull();
        expect(row.querySelector(STAR)).toBeNull();
        expect(remove.getAttribute('aria-label')).toBe('Remove from favourites');

        remove.click();
        fixture.detectChanges();

        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['pie']);
        expect(blockRowIds(fixture)).toEqual(['pie']);
        expect(emitted).not.toHaveBeenCalled();
    });

    it('SC-UK-99 — после «убрать» фокус стоит на кнопке соседней строки, а не падает на страницу', () => {
        const { fixture } = withFavorites(['rates', 'pie']);

        hoverFirstItem(fixture);

        const removes: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll(REMOVE));

        removes[0].focus();
        removes[0].click();
        fixture.detectChanges();

        expect(blockRowIds(fixture)).toEqual(['pie']);
        expect(document.activeElement).toBe(removes[1]);
    });

    it('SC-UK-95 — ручка — кнопка с двумя стрелками наружу внутри пункта, после «убрать», и никуда не ведёт', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);

        const handle: HTMLElement = fixture.nativeElement.querySelector(HANDLE) as HTMLElement;

        expect(handle.tagName).toBe('BUTTON');
        expect(handle.getAttribute('aria-label')).toBe('Hold button to drag');
        expect(handle.querySelector('mat-icon')?.textContent?.trim()).toBe('arrows_outward');
        expect(handle.closest('mat-list-item')).not.toBeNull();
        expect(handle.previousElementSibling?.getAttribute('qa-dataid')).toBe('side-menu-favorite-remove');
        expect(fixture.debugElement.query(By.css(HANDLE)).injector.get(CdkDragHandle, null)).not.toBeNull();
        expect(tooltip(fixture, HANDLE).message).toBe('Hold button to drag');

        const emitted: jest.SpyInstance = jest.spyOn(menu(fixture).clickSubMenuAction, 'emit');

        handle.click();
        fixture.detectChanges();

        expect(emitted).not.toHaveBeenCalled();
    });

    it('SC-UK-100 — стрелки на ручке переставляют строку, и фокус едет вместе с ней', async () => {
        const { fixture, favorites } = withFavorites(['rates', 'pie', 'bars']);

        hoverFirstItem(fixture);

        const first: HTMLElement = fixture.nativeElement.querySelector(HANDLE) as HTMLElement;

        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['pie', 'rates', 'bars']);
        expect((document.activeElement as HTMLElement | null)?.closest(BLOCK_ROW)?.getAttribute('data-id')).toBe('rates');

        // Ручка едет со своей строкой: вверх она возвращает строку на место, а с первого места — никуда.
        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        fixture.detectChanges();
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['rates', 'pie', 'bars']);

        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        fixture.detectChanges();
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['rates', 'pie', 'bars']);
    });

    it('SC-UK-80 — номера, которого в меню нет, в блоке нет, а в списке он остаётся', () => {
        const { fixture, favorites } = withFavorites(['rates', 'gone']);

        hoverFirstItem(fixture);

        expect(blockRowIds(fixture)).toEqual(['rates']);
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['rates', 'gone']);
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
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['pie', 'bars', 'rates']);
    });

    it('SC-UK-85 — подписи приходят из настроек провайдера', () => {
        const labels: IRtuiSideMenuSettingsConfig['labels'] = {
            title: 'Избранное',
            add: 'Добавить в избранное',
            remove: 'Убрать из избранного',
            drag: 'Потяните за кнопку',
        };
        const { fixture } = withFavorites(['rates'], { items: enabled([NESTED_ITEMS[0]]), config: { labels }, active: ['refs', 'saved'] });

        hoverFirstItem(fixture);

        expect(
            (fixture.nativeElement.querySelector('.rtui-side-menu-expand-sub-item-header__title') as HTMLElement).textContent?.trim()
        ).toBe('Избранное');
        expect(listRow(fixture, 'rates').querySelector(STAR)?.getAttribute('aria-label')).toBe('Убрать из избранного');
        expect(fixture.nativeElement.querySelector(REMOVE)?.getAttribute('aria-label')).toBe('Убрать из избранного');
        expect(fixture.nativeElement.querySelector(HANDLE)?.getAttribute('aria-label')).toBe('Потяните за кнопку');
        expect(listRow(fixture, 'pie').querySelector(STAR)?.getAttribute('aria-label')).toBe('Добавить в избранное');
        expect(tooltip(fixture, `.rtui-sub-side-menu-content__list [id="pie"] ${STAR}`).message).toBe('Добавить в избранное');
        expect(tooltip(fixture, REMOVE).message).toBe('Убрать из избранного');
        expect(tooltip(fixture, HANDLE).message).toBe('Потяните за кнопку');
    });

    it('SC-UK-121 — без значков в настройках «убрать» рисует корзину, ручка — стрелку на четверть оборота', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);

        const removeIcon: HTMLElement = fixture.nativeElement.querySelector(`${REMOVE} mat-icon`) as HTMLElement;
        const handleIcon: HTMLElement = fixture.nativeElement.querySelector(`${HANDLE} mat-icon`) as HTMLElement;

        expect(removeIcon.textContent?.trim()).toBe('delete');
        expect(removeIcon.style.rotate).toBe('0deg');
        expect(handleIcon.textContent?.trim()).toBe('arrows_outward');
        expect(handleIcon.style.rotate).toBe('90deg');
    });

    it('SC-UK-122 — значок «убрать» из настроек меняет глиф, подсказка остаётся подписью', () => {
        const { fixture } = withFavorites(['rates'], { config: { icons: { remove: { glyph: 'close' } } } });

        hoverFirstItem(fixture);

        expect((fixture.nativeElement.querySelector(`${REMOVE} mat-icon`) as HTMLElement).textContent?.trim()).toBe('close');
        expect(tooltip(fixture, REMOVE).message).toBe('Remove from favourites');
        expect((fixture.nativeElement.querySelector(`${HANDLE} mat-icon`) as HTMLElement).style.rotate).toBe('90deg');
    });

    it('SC-UK-123 — значок ручки из настроек рисуется с заданным поворотом', () => {
        const { fixture } = withFavorites(['rates'], { config: { icons: { drag: { glyph: 'drag_indicator', rotate: 0 } } } });

        hoverFirstItem(fixture);

        const handleIcon: HTMLElement = fixture.nativeElement.querySelector(`${HANDLE} mat-icon`) as HTMLElement;

        expect(handleIcon.textContent?.trim()).toBe('drag_indicator');
        expect(handleIcon.style.rotate).toBe('0deg');
    });

    it('SC-UK-124 — кнопка «убрать» помечена для красного наведения, звезда — нет', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);

        const remove: HTMLElement = fixture.nativeElement.querySelector(REMOVE) as HTMLElement;
        const star: HTMLElement = listRow(fixture, 'rates').querySelector(STAR) as HTMLElement;

        expect(remove.classList).toContain('rtui-side-menu-sub-item-title__favorite--remove');
        expect(star).not.toBeNull();
        expect(star.classList).not.toContain('rtui-side-menu-sub-item-title__favorite--remove');
    });

    it('SC-UK-86 — на узком экране блок стоит под полем поиска, со звёздами и кнопками «убрать»', () => {
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
        expect(blockRowIds(fixture)).toEqual(['rates']);
        expect(search.compareDocumentPosition(favoritesBlock)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(fixture.nativeElement.querySelector(STAR)).not.toBeNull();
        expect(fixture.nativeElement.querySelector(REMOVE)).not.toBeNull();
        expect(tooltip(fixture, STAR).disabled).toBe(true);

        const back: Element | undefined = Array.from(fixture.nativeElement.querySelectorAll('rtui-side-menu-sub-item')).find(
            (node: unknown): boolean => ((node as Element).textContent ?? '').includes('Main Menu')
        ) as Element | undefined;

        expect(back).toBeDefined();
        expect(back?.querySelector(STAR)).toBeNull();
    });

    it('SC-UK-87 — брошенная строка не сдвигает номера, которых в меню нет', () => {
        const { fixture, favorites } = withFavorites(['rates', 'gone', 'pie']);

        hoverFirstItem(fixture);
        drop(fixture, 1, 0);

        expect(blockRowIds(fixture)).toEqual(['pie', 'rates']);
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['pie', 'gone', 'rates']);
    });

    it('SC-UK-88 — доводка в видимую часть целится в строку списка, а не в строку блока', () => {
        const { fixture } = withFavorites(['rates'], { active: ['refs', 'rates'] });

        hoverFirstItem(fixture);

        const carriers: Element[] = Array.from(fixture.nativeElement.querySelectorAll('[id="rates"]'));

        expect(fixture.nativeElement.querySelector(BLOCK_ROW)).not.toBeNull();
        expect(carriers.length).toBe(1);
        expect(carriers[0].closest(BLOCK)).toBeNull();
    });

    it('SC-UK-89 — закрашенная звезда помечена всегда, полая отдана наведению и фокусу', () => {
        const { fixture } = withFavorites(['rates'], { items: enabled([NESTED_ITEMS[0]]), active: ['refs', 'saved'] });

        hoverFirstItem(fixture);

        expect(listRow(fixture, 'rates').querySelector(STAR)?.classList).toContain(ON);
        expect(listRow(fixture, 'pie').querySelector(STAR)?.classList).not.toContain(ON);
    });

    it('SC-UK-90 — фокус на звезде держит подменю, открытое наведением', () => {
        const { fixture } = withFavorites([]);

        hoverFirstItem(fixture);
        keyboardFocus(listRow(fixture, 'rates').querySelector(STAR) as HTMLElement);
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-90 — фокус клавиатуры на кнопке «убрать» держит подменю, открытое наведением', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);
        keyboardFocus(fixture.nativeElement.querySelector(REMOVE) as HTMLElement);
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-98 — фокус от нажатия мышью подменю не держит, брошенная строка отпускает его', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);
        keyboardFocus(listRow(fixture, 'rates').querySelector(STAR) as HTMLElement, false);
        leavePanel(fixture);
        expect(menu(fixture).selectedSubMenu()).toBeNull();

        hoverFirstItem(fixture);
        block(fixture).onDragStart('rates');
        fixture.debugElement
            .query(By.directive(CdkDrag))
            .injector.get(CdkDrag)
            .ended.emit({} as CdkDragEnd);
        leavePanel(fixture);
        expect(menu(fixture).selectedSubMenu()).toBeNull();
    });

    it('SC-UK-90 — строка в руке держит подменю, открытое наведением', () => {
        const { fixture } = withFavorites(['rates']);

        hoverFirstItem(fixture);
        block(fixture).onDragStart('rates');
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).not.toBeNull();
    });

    it('SC-UK-119 — строка в руке пропала вместе с разделом — удержание снимается', () => {
        const { fixture } = withFavorites(['a', 'c'], { items: SECTIONS });

        hoverItem(fixture, 0);
        block(fixture).onDragStart('a');
        hoverItem(fixture, 1);
        leavePanel(fixture);

        expect(menu(fixture).selectedSubMenu()).toBeNull();
    });

    it('SC-UK-120 — строка, брошенная за панелью, закрывает подменю, открытое наведением', () => {
        const { fixture } = withFavorites(['rates']);
        const panel: HTMLElement = fixture.nativeElement.querySelector('mat-drawer') as HTMLElement;
        jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 300, top: 0, bottom: 600 } as DOMRect);
        const dragEnded: (x: number) => void = (x: number): void => {
            block(fixture).onDragStart('rates');
            fixture.debugElement
                .query(By.directive(CdkDrag))
                .injector.get(CdkDrag)
                .ended.emit({ dropPoint: { x, y: 100 } } as CdkDragEnd);
            fixture.detectChanges();
        };

        hoverFirstItem(fixture);
        dragEnded(150);
        expect(menu(fixture).selectedSubMenu()).not.toBeNull();

        dragEnded(450);
        expect(menu(fixture).selectedSubMenu()).toBeNull();
    });

    it('SC-UK-91 — строка, брошенная вне блока, ничего не меняет', () => {
        const { fixture, favorites } = withFavorites(['rates', 'pie']);

        hoverFirstItem(fixture);
        drop(fixture, 0, 1, false);
        drop(fixture, 1, 1);

        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['rates', 'pie']);
    });

    it('SC-UK-92 — строка блока отмечена активной, как и строка списка', () => {
        const { fixture } = withFavorites(['rates'], { active: ['refs', 'rates'] });

        hoverFirstItem(fixture);

        const blockItem: HTMLElement = fixture.nativeElement.querySelector(`${BLOCK_ROW} mat-list-item`) as HTMLElement;

        expect(listRow(fixture, 'rates').classList).toContain('mdc-list-item--activated');
        expect(blockItem.classList).toContain('mdc-list-item--activated');
    });
});
