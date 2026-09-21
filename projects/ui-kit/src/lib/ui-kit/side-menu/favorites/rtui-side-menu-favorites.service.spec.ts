import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@rt-tools/core';
import { SIDE_MENU_SETTINGS_KEY } from './favorites.logic';
import {
    IRtuiSideMenuFavoritesConfig,
    provideRtuiSideMenuFavorites,
    RtuiSideMenuFavoritesService,
} from './rtui-side-menu-favorites.service';

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

class ClosedStorage extends MemoryStorage {
    public override getItem(): string | null {
        throw new Error('closed');
    }

    public override setItem(): void {
        throw new Error('closed');
    }
}

function createService(storage: Storage | null, config?: IRtuiSideMenuFavoritesConfig): RtuiSideMenuFavoritesService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [provideRtuiSideMenuFavorites(config), ...(storage ? [{ provide: LOCAL_STORAGE, useValue: storage }] : [])],
    });

    return TestBed.inject(RtuiSideMenuFavoritesService);
}

const MENU: string = 'main';

function stored(storage: Storage): unknown {
    return JSON.parse(storage.getItem(SIDE_MENU_SETTINGS_KEY) ?? 'null');
}

describe('RtuiSideMenuFavoritesService', (): void => {
    it('SC-UK-69 — список переживает новый сервис над тем же хранилищем и ключом', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const first: RtuiSideMenuFavoritesService = createService(storage, { storageKey: 'app' });
        first.add(MENU, 'a');
        first.add(MENU, 'b');

        expect(createService(storage, { storageKey: 'app' }).ids(MENU)()).toEqual(['a', 'b']);
        expect(createService(storage).ids(MENU)()).toEqual([]);
    });

    it('SC-UK-70 — сломанная запись читается пустой, закрытое хранилище не бросает', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{not json');

        expect(createService(storage).ids(MENU)()).toEqual([]);

        storage.setItem(SIDE_MENU_SETTINGS_KEY, '["a", "b"]');
        expect(createService(storage).ids(MENU)()).toEqual([]);
        expect(createService(storage).menuIds()).toEqual([]);

        const closed: RtuiSideMenuFavoritesService = createService(new ClosedStorage());
        expect(closed.ids(MENU)()).toEqual([]);
        expect((): void => closed.add(MENU, 'a')).not.toThrow();
        expect(closed.ids(MENU)()).toEqual(['a']);
    });

    it('SC-UK-70 — без хранилища список живёт в памяти', (): void => {
        const service: RtuiSideMenuFavoritesService = createService(null);
        service.add(MENU, 'a');

        expect(service.ids(MENU)()).toEqual(['a']);
    });

    it('SC-UK-71 — чужие значения и повторы отбрасываются при чтении, сломанное меню не стирает соседнее', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(
            SIDE_MENU_SETTINGS_KEY,
            '{"main": {"favorites": ["a", 1, null, {"x": 1}, "a"]}, "broken": 7, "empty": {"favorites": 3}}'
        );
        const service: RtuiSideMenuFavoritesService = createService(storage);

        expect(service.ids(MENU)()).toEqual(['a', 1]);
        expect(service.ids('empty')()).toEqual([]);
        expect(service.menuIds()).toEqual(['main', 'empty']);
    });

    it('SC-UK-72 — добавление, удаление и переключение правят список и хранилище вместе', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuFavoritesService = createService(storage);

        service.add(MENU, 'a');
        service.add(MENU, 'a');
        expect(service.ids(MENU)()).toEqual(['a']);
        expect(stored(storage)).toEqual({ main: { favorites: ['a'] } });

        service.toggle(MENU, 'b');
        expect(service.has(MENU, 'b')).toBe(true);
        expect(stored(storage)).toEqual({ main: { favorites: ['a', 'b'] } });

        service.remove(MENU, 'a');
        expect(service.ids(MENU)()).toEqual(['b']);
        expect(stored(storage)).toEqual({ main: { favorites: ['b'] } });

        service.toggle(MENU, 'b');
        expect(service.ids(MENU)()).toEqual([]);
        expect(stored(storage)).toEqual({ main: { favorites: [] } });
    });

    it('SC-UK-73 — перенос ставит запись на новое место и пишет его в хранилище', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuFavoritesService = createService(storage);
        service.set(MENU, ['a', 'b', 'c']);
        service.move(MENU, 0, 2);

        expect(service.ids(MENU)()).toEqual(['b', 'c', 'a']);
        expect(stored(storage)).toEqual({ main: { favorites: ['b', 'c', 'a'] } });
    });

    it('SC-UK-74 — замена и очистка меняют список целиком', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuFavoritesService = createService(storage);
        service.set(MENU, ['a', 'b']);
        service.set(MENU, ['c', 'c', 'd']);

        expect(service.ids(MENU)()).toEqual(['c', 'd']);
        expect(stored(storage)).toEqual({ main: { favorites: ['c', 'd'] } });

        service.clear(MENU);
        expect(service.ids(MENU)()).toEqual([]);
        expect(stored(storage)).toEqual({ main: { favorites: [] } });
    });

    it('SC-UK-105 — два меню держат свои списки под своими номерами в одном ключе', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuFavoritesService = createService(storage);
        const main: ReturnType<RtuiSideMenuFavoritesService['ids']> = service.ids(MENU);

        service.set(MENU, ['a', 'b']);
        service.set('admin', ['x']);
        service.remove('admin', 'a');
        service.move(MENU, 0, 1);

        expect(main()).toEqual(['b', 'a']);
        expect(service.ids('admin')()).toEqual(['x']);
        expect(stored(storage)).toEqual({ main: { favorites: ['b', 'a'] }, admin: { favorites: ['x'] } });
        expect(createService(storage).ids('admin')()).toEqual(['x']);
    });

    it('SC-UK-106 — приложение видит номера хранимых меню и читает список любого', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"main": {"favorites": ["a"]}}');
        const service: RtuiSideMenuFavoritesService = createService(storage);

        expect(service.menuIds()).toEqual(['main']);
        expect(service.ids(MENU)).toBe(service.ids(MENU));

        service.add('admin', 'x');
        expect(service.menuIds()).toEqual(['main', 'admin']);
        expect(service.ids('absent')()).toEqual([]);
    });

    it('SC-UK-85 — подписи настроек заменяют английские, пустая подпись равна отсутствию', (): void => {
        const service: RtuiSideMenuFavoritesService = createService(null, { labels: { title: 'Избранное', add: '  ' } });

        expect(service.labels).toEqual({
            title: 'Избранное',
            add: 'Add to favourites',
            remove: 'Remove from favourites',
            drag: 'Hold button to drag',
        });
    });
});
