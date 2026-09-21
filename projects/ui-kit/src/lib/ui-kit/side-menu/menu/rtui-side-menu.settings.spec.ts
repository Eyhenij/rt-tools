import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@rt-tools/core';
import { provideRtuiSideMenuSettings, RtuiSideMenuSettingsService } from '../settings/rtui-side-menu-settings.service';
import { DEFAULT_MENU_ID, SIDE_MENU_SETTINGS_KEY } from '../settings/side-menu-settings.logic';
import { MemoryStorage } from '../settings/storage.harness';
import { HostComponent, installFontsStub, ISetup, pin, setup } from './side-menu.harness';

beforeAll(installFontsStub);

// Закреплённое подменю доводит активный пункт до видимой части, а движок тестов прокрутки не знает.
beforeAll((): void => {
    Element.prototype.scrollIntoView = jest.fn();
});

/** Меню без моды и ширины от приложения: обе берутся из настроек под номером меню. */
function withSettings(storage: MemoryStorage, menuId: string): ISetup & { settings: RtuiSideMenuSettingsService } {
    const result: ISetup = setup('hover', ['refs', 'rates'], false, undefined, [
        provideRtuiSideMenuSettings(),
        { provide: LOCAL_STORAGE, useValue: storage },
    ]);

    result.host.menuId.set(menuId);
    result.host.mode.set(undefined);
    result.host.width.set(undefined);
    result.fixture.detectChanges();

    return { ...result, settings: TestBed.inject(RtuiSideMenuSettingsService) };
}

function isPinned(fixture: ComponentFixture<HostComponent>): boolean {
    return (fixture.nativeElement as HTMLElement).querySelector('rtui-side-menu')?.classList.contains('rtui-side-menu--pinned') ?? false;
}

function pressPin(fixture: ComponentFixture<HostComponent>): void {
    (pin(fixture).querySelector('button') ?? pin(fixture)).click();
    fixture.detectChanges();
}

function stored(storage: Storage): unknown {
    return JSON.parse(storage.getItem(SIDE_MENU_SETTINGS_KEY) ?? 'null');
}

describe('RtuiSideMenuComponent — настройки меню', () => {
    it('SC-UK-115 — меню берёт моду из своих настроек и пишет туда выбор человека', () => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"subMenuMode": "pinned", "subMenuWidth": 300, "favorites": ["rates"]}}');
        const { fixture } = withSettings(storage, 'user-a');

        expect(isPinned(fixture)).toBe(true);
        expect((fixture.nativeElement as HTMLElement).querySelector('rtui-side-menu')?.getAttribute('style')).toContain('300px');

        pressPin(fixture);

        expect(isPinned(fixture)).toBe(false);
        expect(stored(storage)).toEqual({ 'user-a': { subMenuMode: 'hover', subMenuWidth: 300, favorites: ['rates'] } });
    });

    it('SC-UK-115 — натянутая ширина уходит в настройки своего меню', () => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"subMenuMode": "pinned", "subMenuWidth": 300}}');
        const { fixture } = withSettings(storage, 'user-a');
        const handle: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="side-menu-resize"]') as HTMLElement;

        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 50 }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 50 }));
        fixture.detectChanges();

        expect(stored(storage)).toEqual({ 'user-a': { subMenuMode: 'pinned', subMenuWidth: 350 } });
    });

    it('SC-UK-115 — мода от приложения важнее сохранённой и сохранённую не трогает', () => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"subMenuMode": "pinned"}}');
        const { fixture, host } = withSettings(storage, 'user-a');

        host.mode.set('hover');
        fixture.detectChanges();

        expect(isPinned(fixture)).toBe(false);
        expect(stored(storage)).toEqual({ 'user-a': { subMenuMode: 'pinned' } });
    });

    it('SC-UK-113 — смена номера меню показывает настройки нового номера, старые остаются', () => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"subMenuMode": "pinned"}, "user-b": {"subMenuMode": "hover"}}');
        const { fixture, host } = withSettings(storage, 'user-a');

        expect(isPinned(fixture)).toBe(true);

        host.menuId.set('user-b');
        fixture.detectChanges();

        expect(isPinned(fixture)).toBe(false);
        expect(stored(storage)).toEqual({ 'user-a': { subMenuMode: 'pinned' }, 'user-b': { subMenuMode: 'hover' } });
    });

    it('SC-UK-117 — меню с пустым номером берёт и пишет настройки номера по умолчанию', () => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, `{"${DEFAULT_MENU_ID}": {"subMenuMode": "pinned"}}`);
        const { fixture } = withSettings(storage, '');

        expect(isPinned(fixture)).toBe(true);

        pressPin(fixture);

        expect(stored(storage)).toEqual({ [DEFAULT_MENU_ID]: { subMenuMode: 'hover' } });
    });
});
