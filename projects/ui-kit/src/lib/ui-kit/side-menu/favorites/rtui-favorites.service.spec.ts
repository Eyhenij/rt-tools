import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@rt-tools/core';
import { FAVORITES_KEY } from './favorites.logic';
import { IRtuiFavoritesConfig, provideRtuiFavorites, RtuiFavoritesService } from './rtui-favorites.service';

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

function createService(storage: Storage | null, config?: IRtuiFavoritesConfig): RtuiFavoritesService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [provideRtuiFavorites(config), ...(storage ? [{ provide: LOCAL_STORAGE, useValue: storage }] : [])],
    });

    return TestBed.inject(RtuiFavoritesService);
}

function stored(storage: Storage): unknown {
    return JSON.parse(storage.getItem(FAVORITES_KEY) ?? 'null');
}

describe('RtuiFavoritesService', (): void => {
    it('SC-UK-69 — список переживает новый сервис над тем же хранилищем и ключом', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const first: RtuiFavoritesService = createService(storage, { storageKey: 'app' });
        first.add('a');
        first.add('b');

        expect(createService(storage, { storageKey: 'app' }).ids()).toEqual(['a', 'b']);
        expect(createService(storage).ids()).toEqual([]);
    });

    it('SC-UK-70 — сломанная запись читается пустым списком, закрытое хранилище не бросает', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(FAVORITES_KEY, '{not json');

        expect(createService(storage).ids()).toEqual([]);

        storage.setItem(FAVORITES_KEY, '{"a": 1}');
        expect(createService(storage).ids()).toEqual([]);

        const closed: RtuiFavoritesService = createService(new ClosedStorage());
        expect(closed.ids()).toEqual([]);
        expect((): void => closed.add('a')).not.toThrow();
        expect(closed.ids()).toEqual(['a']);
    });

    it('SC-UK-70 — без хранилища список живёт в памяти', (): void => {
        const service: RtuiFavoritesService = createService(null);
        service.add('a');

        expect(service.ids()).toEqual(['a']);
    });

    it('SC-UK-71 — чужие значения и повторы отбрасываются при чтении', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(FAVORITES_KEY, '["a", 1, null, {"x": 1}, "a"]');

        expect(createService(storage).ids()).toEqual(['a', 1]);
    });

    it('SC-UK-72 — добавление, удаление и переключение правят список и хранилище вместе', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiFavoritesService = createService(storage);

        service.add('a');
        service.add('a');
        expect(service.ids()).toEqual(['a']);
        expect(stored(storage)).toEqual(['a']);

        service.toggle('b');
        expect(service.has('b')).toBe(true);
        expect(stored(storage)).toEqual(['a', 'b']);

        service.remove('a');
        expect(service.ids()).toEqual(['b']);
        expect(stored(storage)).toEqual(['b']);

        service.toggle('b');
        expect(service.ids()).toEqual([]);
        expect(stored(storage)).toEqual([]);
    });

    it('SC-UK-73 — перенос ставит запись на новое место и пишет его в хранилище', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiFavoritesService = createService(storage);
        service.set(['a', 'b', 'c']);
        service.move(0, 2);

        expect(service.ids()).toEqual(['b', 'c', 'a']);
        expect(stored(storage)).toEqual(['b', 'c', 'a']);
    });

    it('SC-UK-74 — замена и очистка меняют список целиком', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiFavoritesService = createService(storage);
        service.set(['a', 'b']);
        service.set(['c', 'c', 'd']);

        expect(service.ids()).toEqual(['c', 'd']);
        expect(stored(storage)).toEqual(['c', 'd']);

        service.clear();
        expect(service.ids()).toEqual([]);
        expect(stored(storage)).toEqual([]);
    });

    it('SC-UK-85 — подписи настроек заменяют английские, пустая подпись равна отсутствию', (): void => {
        const service: RtuiFavoritesService = createService(null, { labels: { title: 'Избранное', add: '  ' } });

        expect(service.labels).toEqual({
            title: 'Избранное',
            add: 'Add to favourites',
            remove: 'Remove from favourites',
            drag: 'Hold button to drag',
        });
    });
});
