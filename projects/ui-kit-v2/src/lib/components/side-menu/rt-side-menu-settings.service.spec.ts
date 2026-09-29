import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { ERtStorageKeys } from '../../platform/storage-keys.enum';
import { RT_SIDE_MENU_DEFAULT_ID } from './rt-side-menu-settings.logic';
import { IRtSideMenuSettingsConfig, provideRtSideMenuSettings, RtSideMenuSettingsService } from './rt-side-menu-settings.service';

/** Хранилище в памяти: запись видна тому, кто читает тем же ключом. */
class MemoryStorage implements Storage {
    readonly #values: Map<string, string> = new Map();

    public get length(): number {
        return this.#values.size;
    }

    public clear(): void {
        this.#values.clear();
    }

    public getItem(key: string): string | null {
        return this.#values.get(key) ?? null;
    }

    public key(index: number): string | null {
        return [...this.#values.keys()][index] ?? null;
    }

    public removeItem(key: string): void {
        this.#values.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.#values.set(key, value);
    }
}

/** Хранилище, закрытое настройками браузера: не читает и не пишет. */
class ClosedStorage extends MemoryStorage {
    public override getItem(): string | null {
        throw new Error('closed');
    }

    public override setItem(): void {
        throw new Error('closed');
    }
}

/** Хранилище, которое читает, но не принимает запись: переполнено. */
class FullStorage extends MemoryStorage {
    public override setItem(): void {
        throw new DOMException('full', 'QuotaExceededError');
    }
}

function createService(storage: Storage | null, config?: IRtSideMenuSettingsConfig): RtSideMenuSettingsService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [provideRtSideMenuSettings(config), ...(storage ? [{ provide: LOCAL_STORAGE, useValue: storage }] : [])],
    });

    return TestBed.inject(RtSideMenuSettingsService);
}

const MENU: string = 'app';

function stored(storage: Storage, key: string = ERtStorageKeys.SideMenu): unknown {
    return JSON.parse(storage.getItem(key) ?? 'null');
}

describe('RtSideMenuSettingsService', (): void => {
    it('SC-UKV-409 — режим и ширина переживают новый сервис над тем же хранилищем', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const first: RtSideMenuSettingsService = createService(storage);

        first.setSubMenuMode(MENU, 'pinned');
        first.setSubMenuWidth(MENU, 300);

        const second: RtSideMenuSettingsService = createService(storage);

        expect(second.subMenuMode(MENU)()).toBe('pinned');
        expect(second.subMenuWidth(MENU)()).toBe(300);
    });

    it('ничего не записано — наведение и ширина оформления', (): void => {
        const service: RtSideMenuSettingsService = createService(new MemoryStorage());

        expect(service.subMenuMode(MENU)()).toBe('hover');
        expect(service.subMenuWidth(MENU)()).toBeNull();
    });

    it('ширина пишется приведённой к пределам', (): void => {
        const storage: MemoryStorage = new MemoryStorage();

        createService(storage).setSubMenuWidth(MENU, 5000);

        expect(stored(storage)).toEqual({ [MENU]: { subMenuWidth: 480 } });
    });

    it('свой ключ приложения не смешивается с общим ключом кита', (): void => {
        const storage: MemoryStorage = new MemoryStorage();

        createService(storage, { storageKey: 'my-app' }).setSubMenuMode(MENU, 'pinned');

        expect(stored(storage, 'my-app')).toEqual({ [MENU]: { subMenuMode: 'pinned' } });
        expect(createService(storage).subMenuMode(MENU)()).toBe('hover');
    });

    it('SC-UKV-410 — сломанная запись читается пустой, сломанная ширина не стирает режим', (): void => {
        const storage: MemoryStorage = new MemoryStorage();

        storage.setItem(ERtStorageKeys.SideMenu, '{not json');
        expect(createService(storage).menuIds()).toEqual([]);

        storage.setItem(ERtStorageKeys.SideMenu, JSON.stringify({ [MENU]: { subMenuMode: 'pinned', subMenuWidth: 'пошире' } }));

        const service: RtSideMenuSettingsService = createService(storage);

        expect(service.subMenuMode(MENU)()).toBe('pinned');
        expect(service.subMenuWidth(MENU)()).toBeNull();
    });

    it('закрытое хранилище не бросает, настройки живут в памяти', (): void => {
        const service: RtSideMenuSettingsService = createService(new ClosedStorage());

        expect((): void => service.setSubMenuMode(MENU, 'pinned')).not.toThrow();
        expect(service.subMenuMode(MENU)()).toBe('pinned');
    });

    it('без хранилища настройки живут в памяти', (): void => {
        const service: RtSideMenuSettingsService = createService(null);

        service.setSubMenuWidth(MENU, 200);

        expect(service.subMenuWidth(MENU)()).toBe(200);
    });

    it('полное хранилище не теряет вторую правку: правда держится в памяти', (): void => {
        const service: RtSideMenuSettingsService = createService(new FullStorage());

        service.setSubMenuMode(MENU, 'pinned');
        service.setSubMenuWidth(MENU, 200);

        expect(service.subMenuMode(MENU)()).toBe('pinned');
        expect(service.subMenuWidth(MENU)()).toBe(200);
    });

    it('запись одного меню не трогает соседнее меню и незнакомые поля', (): void => {
        const storage: MemoryStorage = new MemoryStorage();

        storage.setItem(ERtStorageKeys.SideMenu, JSON.stringify({ [MENU]: { theme: 'dark' }, other: { subMenuMode: 'pinned' } }));
        createService(storage).setSubMenuWidth(MENU, 200);

        expect(stored(storage)).toEqual({ [MENU]: { theme: 'dark', subMenuWidth: 200 }, other: { subMenuMode: 'pinned' } });
    });

    it('запись, сделанная другим кодом после подъёма сервиса, не затирается следующей', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtSideMenuSettingsService = createService(storage);

        storage.setItem(ERtStorageKeys.SideMenu, JSON.stringify({ other: { subMenuMode: 'pinned' } }));
        service.setSubMenuWidth(MENU, 200);

        expect(stored(storage)).toEqual({ other: { subMenuMode: 'pinned' }, [MENU]: { subMenuWidth: 200 } });
    });

    it('событие storage другой вкладки обновляет режим и ширину', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtSideMenuSettingsService = createService(storage);

        storage.setItem(ERtStorageKeys.SideMenu, JSON.stringify({ [MENU]: { subMenuMode: 'pinned', subMenuWidth: 250 } }));
        window.dispatchEvent(new StorageEvent('storage', { key: ERtStorageKeys.SideMenu }));

        expect(service.subMenuMode(MENU)()).toBe('pinned');
        expect(service.subMenuWidth(MENU)()).toBe(250);
    });

    it('пустой номер меню читается и пишется как номер по умолчанию', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtSideMenuSettingsService = createService(storage);

        service.setSubMenuMode(' ', 'pinned');

        expect(stored(storage)).toEqual({ [RT_SIDE_MENU_DEFAULT_ID]: { subMenuMode: 'pinned' } });
        expect(service.subMenuMode(RT_SIDE_MENU_DEFAULT_ID)()).toBe('pinned');
    });

    it('настройки меню удаляет только вызов приложения, и только их', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtSideMenuSettingsService = createService(storage);

        service.setSubMenuMode(MENU, 'pinned');
        service.setSubMenuMode('other', 'pinned');
        service.deleteSettings(MENU);

        expect(service.menuIds()).toEqual(['other']);
        expect(stored(storage)).toEqual({ other: { subMenuMode: 'pinned' } });
    });
});
