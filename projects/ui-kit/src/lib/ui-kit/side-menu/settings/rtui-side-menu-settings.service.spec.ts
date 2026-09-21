import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@rt-tools/core';
import { ClosedStorage, FullStorage, MemoryStorage } from './storage.harness';
import { DEFAULT_MENU_ID, SIDE_MENU_SETTINGS_KEY } from './side-menu-settings.logic';
import { IRtuiSideMenuSettingsConfig, provideRtuiSideMenuSettings, RtuiSideMenuSettingsService } from './rtui-side-menu-settings.service';

function createService(storage: Storage | null, config?: IRtuiSideMenuSettingsConfig): RtuiSideMenuSettingsService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [provideRtuiSideMenuSettings(config), ...(storage ? [{ provide: LOCAL_STORAGE, useValue: storage }] : [])],
    });

    return TestBed.inject(RtuiSideMenuSettingsService);
}

const MENU: string = 'main';

function stored(storage: Storage): unknown {
    return JSON.parse(storage.getItem(SIDE_MENU_SETTINGS_KEY) ?? 'null');
}

describe('RtuiSideMenuSettingsService', (): void => {
    it('SC-UK-69 — список переживает новый сервис над тем же хранилищем и ключом', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const first: RtuiSideMenuSettingsService = createService(storage, { storageKey: 'app' });
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

        const closed: RtuiSideMenuSettingsService = createService(new ClosedStorage());
        expect(closed.ids(MENU)()).toEqual([]);
        expect((): void => closed.add(MENU, 'a')).not.toThrow();
        expect(closed.ids(MENU)()).toEqual(['a']);
    });

    it('SC-UK-70 — без хранилища список живёт в памяти', (): void => {
        const service: RtuiSideMenuSettingsService = createService(null);
        service.add(MENU, 'a');

        expect(service.ids(MENU)()).toEqual(['a']);
    });

    it('SC-UK-71 — чужие значения и повторы отбрасываются при чтении, сломанное меню не стирает соседнее', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(
            SIDE_MENU_SETTINGS_KEY,
            '{"main": {"favorites": ["a", 1, null, {"x": 1}, "a"]}, "broken": 7, "empty": {"favorites": 3}}'
        );
        const service: RtuiSideMenuSettingsService = createService(storage);

        expect(service.ids(MENU)()).toEqual(['a', 1]);
        expect(service.ids('empty')()).toEqual([]);
        expect(service.menuIds()).toEqual(['main', 'empty']);
    });

    it('SC-UK-72 — добавление, удаление и переключение правят список и хранилище вместе', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);

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
        const service: RtuiSideMenuSettingsService = createService(storage);
        service.set(MENU, ['a', 'b', 'c']);
        service.move(MENU, 0, 2);

        expect(service.ids(MENU)()).toEqual(['b', 'c', 'a']);
        expect(stored(storage)).toEqual({ main: { favorites: ['b', 'c', 'a'] } });
    });

    it('SC-UK-74 — замена и очистка меняют список целиком', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);
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
        const service: RtuiSideMenuSettingsService = createService(storage);
        const main: ReturnType<RtuiSideMenuSettingsService['ids']> = service.ids(MENU);

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
        const service: RtuiSideMenuSettingsService = createService(storage);

        expect(service.menuIds()).toEqual(['main']);
        expect(service.ids(MENU)).toBe(service.ids(MENU));

        service.add('admin', 'x');
        expect(service.menuIds()).toEqual(['main', 'admin']);
        expect(service.ids('absent')()).toEqual([]);
    });

    it('SC-UK-108 — запись избранного не трогает моду, ширину и незнакомые поля того же меню', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"subMenuMode": "pinned", "subMenuWidth": 320, "theme": "dark"}}');
        const service: RtuiSideMenuSettingsService = createService(storage);

        service.add('user-a', 'r1');

        expect(service.subMenuMode('user-a')()).toBe('pinned');
        expect(service.subMenuWidth('user-a')()).toBe(320);
        expect(stored(storage)).toEqual({ 'user-a': { subMenuMode: 'pinned', subMenuWidth: 320, theme: 'dark', favorites: ['r1'] } });
    });

    it('SC-UK-109 — запись любого поля одного меню не меняет запись другого', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-b": {"favorites": ["r2"], "subMenuMode": "hover", "broken": [1]}, "odd": 5}');
        const service: RtuiSideMenuSettingsService = createService(storage);

        service.add('user-a', 'r1');
        service.setSubMenuMode('user-a', 'pinned');
        service.setSubMenuWidth('user-a', 1000);

        expect(stored(storage)).toEqual({
            'user-b': { favorites: ['r2'], subMenuMode: 'hover', broken: [1] },
            odd: 5,
            'user-a': { favorites: ['r1'], subMenuMode: 'pinned', subMenuWidth: 480 },
        });
        expect(service.subMenuWidth('user-a')()).toBe(480);
    });

    it('SC-UK-110 — запись, сделанная другим кодом после подъёма сервиса, не затирается следующей', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);
        service.add('user-a', 'r1');

        const outside: Record<string, unknown> = JSON.parse(storage.getItem(SIDE_MENU_SETTINGS_KEY) ?? '{}');
        storage.setItem(SIDE_MENU_SETTINGS_KEY, JSON.stringify({ ...outside, 'user-b': { favorites: ['r2'] } }));

        service.setSubMenuMode('user-a', 'pinned');

        expect(stored(storage)).toEqual({ 'user-a': { favorites: ['r1'], subMenuMode: 'pinned' }, 'user-b': { favorites: ['r2'] } });
        expect(service.ids('user-b')()).toEqual(['r2']);
    });

    it('SC-UK-111 — событие storage другой вкладки обновляет список, моду и ширину', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);

        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"favorites": ["r1"], "subMenuMode": "pinned", "subMenuWidth": 300}}');
        expect(service.ids('user-a')()).toEqual([]);

        window.dispatchEvent(new StorageEvent('storage', { key: 'another-key' }));
        expect(service.ids('user-a')()).toEqual([]);

        window.dispatchEvent(new StorageEvent('storage', { key: SIDE_MENU_SETTINGS_KEY }));
        expect(service.ids('user-a')()).toEqual(['r1']);
        expect(service.subMenuMode('user-a')()).toBe('pinned');
        expect(service.subMenuWidth('user-a')()).toBe(300);
    });

    it('SC-UK-112 — недопустимые мода и ширина читаются как отсутствие, соседние поля остаются', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        storage.setItem(SIDE_MENU_SETTINGS_KEY, '{"user-a": {"favorites": ["r1"], "subMenuMode": "sideways", "subMenuWidth": "wide"}}');
        const service: RtuiSideMenuSettingsService = createService(storage);

        expect(service.subMenuMode('user-a')()).toBe('hover');
        expect(service.subMenuWidth('user-a')()).toBeNull();
        expect(service.ids('user-a')()).toEqual(['r1']);
        expect(service.settings('user-a')()).toEqual({ favorites: ['r1'] });
    });

    it('SC-UK-114 — закрытое или полное хранилище не роняет запись, настройки живут в памяти', (): void => {
        for (const storage of [new ClosedStorage(), new FullStorage()]) {
            const service: RtuiSideMenuSettingsService = createService(storage);

            expect((): void => service.setSubMenuMode('user-a', 'pinned')).not.toThrow();
            expect((): void => service.setSubMenuWidth('user-a', 250)).not.toThrow();
            expect((): void => service.add('user-a', 'r1')).not.toThrow();

            expect(service.subMenuMode('user-a')()).toBe('pinned');
            expect(service.subMenuWidth('user-a')()).toBe(250);
            expect(service.ids('user-a')()).toEqual(['r1']);
        }
    });

    it('SC-UK-117 — пустой номер меню читается и пишется как номер по умолчанию', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);

        service.add('', 'r1');
        service.setSubMenuMode('  ', 'pinned');

        expect(stored(storage)).toEqual({ [DEFAULT_MENU_ID]: { favorites: ['r1'], subMenuMode: 'pinned' } });
        expect(service.ids(DEFAULT_MENU_ID)()).toEqual(['r1']);
        expect(service.ids('')).toBe(service.ids(DEFAULT_MENU_ID));
    });

    it('SC-UK-118 — перенос по видимым номерам оставляет скрытые на местах и не затирает чужую запись', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);
        service.set('user-a', ['a', 'x', 'b', 'c']);
        storage.setItem(SIDE_MENU_SETTINGS_KEY, JSON.stringify({ 'user-a': { favorites: ['a', 'x', 'b', 'c', 'd'] } }));

        service.moveVisible('user-a', ['a', 'b', 'c'], 0, 2);

        expect(service.ids('user-a')()).toEqual(['b', 'x', 'c', 'a', 'd']);

        service.moveVisible('user-a', ['b', 'gone', 'c'], 0, 2);

        expect(service.ids('user-a')()).toEqual(['c', 'x', 'b', 'a', 'd']);
    });

    it('SC-UK-116 — настройки меню удаляет только вызов приложения, и только их', (): void => {
        const storage: MemoryStorage = new MemoryStorage();
        const service: RtuiSideMenuSettingsService = createService(storage);
        service.add('user-a', 'r1');
        service.add('user-b', 'r2');

        service.deleteSettings('user-a');

        expect(stored(storage)).toEqual({ 'user-b': { favorites: ['r2'] } });
        expect(service.menuIds()).toEqual(['user-b']);
    });

    it('SC-UK-85 — подписи настроек заменяют английские, пустая подпись равна отсутствию', (): void => {
        const service: RtuiSideMenuSettingsService = createService(null, { labels: { title: 'Избранное', add: '  ' } });

        expect(service.labels).toEqual({
            title: 'Избранное',
            add: 'Add to favourites',
            remove: 'Remove from favourites',
            drag: 'Hold button to drag',
        });
    });
});
