import { ComponentFixture } from '@angular/core/testing';

import { normalizeFavoriteActionsReserve, normalizeFavoritesCount } from '../side-menu.logic';
import { DEFAULT_MENU_ID } from '../settings/side-menu-settings.logic';
import { ISideMenu } from '../side-menu.types';
import { HostComponent, installFontsStub, ISetup, NESTED_ITEMS, setup } from './side-menu.harness';
import { BLOCK, BLOCK_TITLE, blockRowIds, hoverItem, listRow, SECTIONS, STAR, withFavorites } from './side-menu-favorites.harness';

/*
 * Сворачивание блока избранного, флаг, снимающий звезду с пункта, и место под скрытые кнопки строки.
 * Отдельный файл: спек поведения строк и кнопок подошёл к пределу длины.
 */

beforeAll(installFontsStub);

/** Разделы, где у пункта «Отчёты» звезда снята флагом. */
const WITH_DISABLED: ISideMenu.Item[] = SECTIONS.map((section: ISideMenu.Item): ISideMenu.Item =>
    section.id === 'cargo'
        ? {
              ...section,
              submenu: (section.submenu ?? []).map((item: ISideMenu.Item): ISideMenu.Item =>
                  item.id === 'b' ? { ...item, favoriteDisabled: true } : item
              ),
          }
        : section
);

function title(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector(BLOCK_TITLE) as HTMLElement;
}

function titleText(fixture: ComponentFixture<HostComponent>): string {
    const text: Element | null = title(fixture).querySelector('.rtui-side-menu-expand-sub-item-header__title');

    return (text?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function toggle(fixture: ComponentFixture<HostComponent>): void {
    title(fixture).click();
    fixture.detectChanges();
}

describe('RtuiSideMenuComponent — сворачивание избранного и флаг звезды', () => {
    it('SC-UK-134 — пункт с флагом favoriteDisabled рисуется без звезды, сосед её сохраняет', () => {
        const { fixture } = withFavorites([], { items: WITH_DISABLED });

        hoverItem(fixture, 0);

        expect(listRow(fixture, 'a').querySelector(STAR)).not.toBeNull();
        expect(listRow(fixture, 'b')).not.toBeNull();
        expect(listRow(fixture, 'b').querySelector(STAR)).toBeNull();
    });

    it('SC-UK-135 — сохранённый номер пункта с флагом в блок не попадает и из списка не уходит', () => {
        const { fixture, favorites } = withFavorites(['a', 'b'], { items: WITH_DISABLED });

        hoverItem(fixture, 0);

        expect(blockRowIds(fixture)).toEqual(['a']);
        expect(favorites.ids(DEFAULT_MENU_ID)()).toEqual(['a', 'b']);
    });

    it('SC-UK-136 — заголовок сворачивает блок: строк нет, число в заголовке, заголовок остаётся', () => {
        const { fixture } = withFavorites(['a', 'b'], { items: SECTIONS });

        hoverItem(fixture, 0);
        const list: HTMLElement = fixture.nativeElement.querySelector(BLOCK) as HTMLElement;

        expect(title(fixture).getAttribute('aria-expanded')).toBe('true');
        expect(document.getElementById(title(fixture).getAttribute('aria-controls') ?? '')?.contains(list)).toBe(true);
        expect(titleText(fixture)).toBe('Favourites');

        toggle(fixture);

        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();
        expect(blockRowIds(fixture)).toEqual([]);
        expect(title(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(titleText(fixture)).toBe('Favourites (2)');

        toggle(fixture);

        expect(blockRowIds(fixture)).toEqual(['a', 'b']);
        expect(title(fixture).getAttribute('aria-expanded')).toBe('true');
    });

    it('SC-UK-137 — Enter сворачивает блок, Space разворачивает; заголовок — кнопка в порядке Tab', () => {
        const { fixture } = withFavorites(['a'], { items: SECTIONS });

        hoverItem(fixture, 0);

        expect(title(fixture).getAttribute('role')).toBe('button');
        expect(title(fixture).tabIndex).toBe(0);

        title(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        fixture.detectChanges();

        expect(title(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(blockRowIds(fixture)).toEqual([]);

        title(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', keyCode: 32, bubbles: true }));
        fixture.detectChanges();

        expect(title(fixture).getAttribute('aria-expanded')).toBe('true');
        expect(blockRowIds(fixture)).toEqual(['a']);
    });

    it('SC-UK-138 — свёрнут блок одного раздела, блок соседнего развёрнут', () => {
        const { fixture, favorites } = withFavorites(['a', 'c'], { items: SECTIONS });

        hoverItem(fixture, 0);
        toggle(fixture);

        expect(favorites.settings(DEFAULT_MENU_ID)().favoritesCollapsed).toEqual(['cargo']);

        hoverItem(fixture, 1);

        expect(blockRowIds(fixture)).toEqual(['c']);
        expect(title(fixture).getAttribute('aria-expanded')).toBe('true');

        hoverItem(fixture, 0);

        expect(blockRowIds(fixture)).toEqual([]);
        expect(title(fixture).getAttribute('aria-expanded')).toBe('false');
    });

    it('SC-UK-139 — имя заголовка называет следующее нажатие подписью из настроек', () => {
        const { fixture } = withFavorites(['a'], { items: SECTIONS, config: { labels: { expand: 'Развернуть', collapse: 'Свернуть' } } });

        hoverItem(fixture, 0);

        expect(title(fixture).getAttribute('aria-label')).toBe('Свернуть');

        toggle(fixture);

        expect(title(fixture).getAttribute('aria-label')).toBe('Развернуть');
    });

    it('SC-UK-139 — без подписей в настройках заголовок зовётся по-английски', () => {
        const { fixture } = withFavorites(['a'], { items: SECTIONS });

        hoverItem(fixture, 0);

        expect(title(fixture).getAttribute('aria-label')).toBe('Collapse favourites');

        toggle(fixture);

        expect(title(fixture).getAttribute('aria-label')).toBe('Expand favourites');
    });

    it('SC-UK-140 — без входа меню отдаёт ширину скрытых кнопок, вход always её держит', () => {
        const { fixture, host }: ISetup = setup('hover', [], false, NESTED_ITEMS);
        const menuHost: HTMLElement = fixture.nativeElement.querySelector('rtui-side-menu') as HTMLElement;
        const mark: string = 'rtui-side-menu--favorite-actions-none';

        expect(menuHost.classList).toContain('rtui-side-menu');
        expect(menuHost.classList).toContain(mark);

        host.reserve.set('always');
        fixture.detectChanges();

        expect(menuHost.classList).not.toContain(mark);

        host.reserve.set('none');
        fixture.detectChanges();

        expect(menuHost.classList).toContain(mark);
    });

    it('SC-UK-141 — число строк в заголовке: у свёрнутого блока по умолчанию, всегда или никогда по входу', () => {
        const { fixture, host } = withFavorites(['a', 'b'], { items: SECTIONS });

        hoverItem(fixture, 0);

        expect(titleText(fixture)).toBe('Favourites');

        host.count.set('always');
        fixture.detectChanges();

        expect(titleText(fixture)).toBe('Favourites (2)');

        toggle(fixture);

        expect(titleText(fixture)).toBe('Favourites (2)');

        host.count.set('never');
        fixture.detectChanges();

        expect(titleText(fixture)).toBe('Favourites');

        host.count.set(undefined);
        fixture.detectChanges();

        expect(titleText(fixture)).toBe('Favourites (2)');
    });

    it('SC-UK-141 — незнакомое значение и пустой атрибут читаются как collapsed', () => {
        expect(normalizeFavoritesCount('always')).toBe('always');
        expect(normalizeFavoritesCount('never')).toBe('never');
        expect(normalizeFavoritesCount('')).toBe('collapsed');
        expect(normalizeFavoritesCount(undefined)).toBe('collapsed');
        expect(normalizeFavoritesCount('sometimes')).toBe('collapsed');
    });

    it('SC-UK-140 — незнакомое значение и пустой атрибут читаются как none', () => {
        expect(normalizeFavoriteActionsReserve('always')).toBe('always');
        expect(normalizeFavoriteActionsReserve('')).toBe('none');
        expect(normalizeFavoriteActionsReserve(undefined)).toBe('none');
        expect(normalizeFavoriteActionsReserve('reserve')).toBe('none');
    });
});
