import {
    clampSubMenuWidth,
    filterSubMenuItems,
    readSubMenuMode,
    readSubMenuWidth,
    SUB_MENU_MODE_KEY,
    SUB_MENU_WIDTH_KEY,
    SUB_MENU_WIDTH_MAX,
    SUB_MENU_WIDTH_MIN,
    writeSubMenuMode,
    writeSubMenuWidth,
} from './side-menu.logic';
import { ISideMenu } from './side-menu.types';

const ITEMS: ReadonlyArray<ISideMenu.Item> = [
    { id: 'rates', name: 'Курсы валют', link: '/rates' },
    { id: 'taxes', name: 'Налоги', link: '/taxes' },
    { id: 'divider' },
];

describe('filterSubMenuItems', (): void => {
    it('SC-UK-25 — пустой запрос показывает подменю целиком', (): void => {
        expect(filterSubMenuItems(ITEMS, '').length).toBe(ITEMS.length);
    });

    it('SC-UK-25 — запрос из одних пробелов считается пустым', (): void => {
        // Иначе набранный и стёртый запрос оставляет подменю пустым: пробел глазами не виден.
        expect(filterSubMenuItems(ITEMS, '   ').length).toBe(ITEMS.length);
    });

    it('SC-UK-26 — отбор идёт по подстроке подписи без учёта регистра', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(ITEMS, 'курс');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('rates');
    });

    it('SC-UK-27 — пункт без подписи в отбор не попадает', (): void => {
        // Разделителю нечем совпасть, и в отобранном списке он выглядел бы пустой строкой.
        expect(filterSubMenuItems(ITEMS, 'а').every((item: ISideMenu.Item): boolean => item.id !== 'divider')).toBe(true);
    });

    it('совпадений нет — возвращается пустой список, а не исходный', (): void => {
        expect(filterSubMenuItems(ITEMS, 'такого пункта нет').length).toBe(0);
    });

    it('исходный набор отбор не правит', (): void => {
        filterSubMenuItems(ITEMS, 'курс');

        expect(ITEMS.length).toBe(3);
    });
});

describe('чтение и запись моды подменю', () => {
    function storageDouble(initial: Record<string, string> = {}): Storage {
        const data: Record<string, string> = { ...initial };

        return {
            getItem: (key: string): string | null => data[key] ?? null,
            setItem: (key: string, value: string): void => {
                data[key] = value;
            },
            removeItem: (key: string): void => {
                delete data[key];
            },
            clear: (): void => undefined,
            key: (): string | null => null,
            length: 0,
        };
    }

    it('SC-UK-32 — хранилища нет — мода прежняя, наведение', () => {
        expect(readSubMenuMode(null)).toBe('hover');
    });

    it('SC-UK-32 — хранилище пусто — мода прежняя, наведение', () => {
        expect(readSubMenuMode(storageDouble())).toBe('hover');
    });

    it('SC-UK-32 — записанная мода читается обратно', () => {
        const storage: Storage = storageDouble();

        writeSubMenuMode(storage, 'pinned');

        expect(readSubMenuMode(storage)).toBe('pinned');
    });

    it('SC-UK-32 — чужое значение в ключе модой не считается', () => {
        expect(readSubMenuMode(storageDouble({ [SUB_MENU_MODE_KEY]: 'что-то своё' }))).toBe('hover');
    });

    it('SC-UK-32 — отказ хранилища работу не останавливает', () => {
        const broken: Storage = {
            getItem: (): string | null => {
                throw new Error('хранилище закрыто настройками браузера');
            },
            setItem: (): void => {
                throw new Error('хранилище закрыто настройками браузера');
            },
        } as unknown as Storage;

        expect(readSubMenuMode(broken)).toBe('hover');
        expect(() => writeSubMenuMode(broken, 'pinned')).not.toThrow();
    });
});

describe('ширина закреплённого подменю', () => {
    function widthStorage(initial: Record<string, string> = {}): Storage {
        const data: Record<string, string> = { ...initial };

        return {
            getItem: (key: string): string | null => data[key] ?? null,
            setItem: (key: string, value: string): void => {
                data[key] = value;
            },
            removeItem: (key: string): void => {
                delete data[key];
            },
            clear: (): void => undefined,
            key: (): string | null => null,
            length: 0,
        };
    }

    it('SC-UK-33 — ширина уже предела приводится к нижнему пределу', () => {
        expect(clampSubMenuWidth(10)).toBe(SUB_MENU_WIDTH_MIN);
    });

    it('SC-UK-33 — ширина шире предела приводится к верхнему пределу', () => {
        expect(clampSubMenuWidth(5000)).toBe(SUB_MENU_WIDTH_MAX);
    });

    it('SC-UK-33 — ширина внутри пределов остаётся своей', () => {
        expect(clampSubMenuWidth(SUB_MENU_WIDTH_MIN + 40)).toBe(SUB_MENU_WIDTH_MIN + 40);
    });

    it('SC-UK-34 — хранилища нет — ширины нет, ставит её оформление', () => {
        expect(readSubMenuWidth(null)).toBeNull();
    });

    it('SC-UK-34 — хранилище пусто — ширины нет', () => {
        expect(readSubMenuWidth(widthStorage())).toBeNull();
    });

    it('SC-UK-34 — записанная ширина читается обратно', () => {
        const storage: Storage = widthStorage();

        writeSubMenuWidth(storage, SUB_MENU_WIDTH_MIN + 40);

        expect(readSubMenuWidth(storage)).toBe(SUB_MENU_WIDTH_MIN + 40);
    });

    it('SC-UK-34 — записанная ширина приводится к пределам, а не пишется как есть', () => {
        const storage: Storage = widthStorage();

        writeSubMenuWidth(storage, 5000);

        expect(readSubMenuWidth(storage)).toBe(SUB_MENU_WIDTH_MAX);
    });

    it('SC-UK-34 — нечисловое значение в ключе шириной не считается', () => {
        expect(readSubMenuWidth(widthStorage({ [SUB_MENU_WIDTH_KEY]: 'пошире' }))).toBeNull();
    });

    it('SC-UK-34 — отказ хранилища работу не останавливает', () => {
        const broken: Storage = {
            getItem: (): string | null => {
                throw new Error('хранилище закрыто настройками браузера');
            },
            setItem: (): void => {
                throw new Error('хранилище закрыто настройками браузера');
            },
        } as unknown as Storage;

        expect(readSubMenuWidth(broken)).toBeNull();
        expect(() => writeSubMenuWidth(broken, 300)).not.toThrow();
    });
});
