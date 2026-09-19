import {
    clampSubMenuWidth,
    filterSubMenuItems,
    readSubMenuMode,
    readSubMenuWidth,
    splitSubMenuTitle,
    stepSubMenuHighlight,
    subMenuIdsToExpand,
    SUB_MENU_MODE_KEY,
    SUB_MENU_WIDTH_KEY,
    SUB_MENU_WIDTH_MAX,
    SUB_MENU_WIDTH_MIN,
    walkSubMenuItems,
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

/**
 * Набор с папками: потребитель кладёт то, что человек ищет по имени, внутрь `submenu`, и вложенность
 * бывает глубже одного уровня.
 */
const NESTED: ReadonlyArray<ISideMenu.Item> = [
    { id: 'dashboard', name: 'Сводка', link: '/dashboard' },
    { id: 'create', name: 'Создание', link: '/create' },
    {
        id: 'saved',
        name: 'Сохранённое',
        submenu: [
            { id: 'pie', name: 'Круговая диаграмма', link: '/saved/pie' },
            { id: 'bars', name: 'Столбцы по месяцам', link: '/saved/bars' },
            {
                id: 'past',
                name: 'Прошлые годы',
                submenu: [{ id: 'y2024', name: 'Итоги 2024', link: '/saved/past/2024' }],
            },
        ],
    },
];

/**
 * Набор, в котором подпись папки совпадает с запросом вместе с частью её детей: на нём видно, что
 * состав папки отбирается тем же правилом, что и всё остальное.
 */
const MATCHING_FOLDER: ReadonlyArray<ISideMenu.Item> = [
    {
        id: 'reports',
        name: 'Отчёты',
        submenu: [
            { id: 'weekly', name: 'Отчёт за неделю', link: '/reports/weekly' },
            { id: 'monthly', name: 'Отчёт за месяц', link: '/reports/monthly' },
            { id: 'guests', name: 'Гости и заезды', link: '/reports/guests' },
        ],
    },
];

describe('filterSubMenuItems — спуск внутрь папок', (): void => {
    it('SC-UK-61 — совпал пункт внутри папки: папка остаётся, и в ней только совпавшее', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, 'круговая');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu?.length).toBe(1);
        expect(found[0].submenu?.[0].id).toBe('pie');
    });

    it('SC-UK-61 — вложенность глубже одного уровня считается тем же правилом', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, '2024');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu?.length).toBe(1);
        expect(found[0].submenu?.[0].id).toBe('past');
        expect(found[0].submenu?.[0].submenu?.[0].id).toBe('y2024');
    });

    it('SC-UK-61 — папка без единого совпадения внутри в отбор не попадает', (): void => {
        // Иначе пустая папка остаётся на экране заголовком без содержимого.
        expect(filterSubMenuItems(NESTED, 'такого пункта нет').length).toBe(0);
    });

    it('SC-UK-62 — совпала подпись самой папки: в ней остаются только совпавшие дети', (): void => {
        // Иначе одно совпадение по имени папки вытаскивает на экран весь её состав, и человек
        // читает как найденное то, в чём запроса нет.
        const found: ISideMenu.Item[] = filterSubMenuItems(MATCHING_FOLDER, 'отчёт');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('reports');
        expect(found[0].submenu?.map((item: ISideMenu.Item): string => String(item.id))).toEqual(['weekly', 'monthly']);
    });

    it('SC-UK-62 — совпала подпись папки, а внутри никто: папка стоит одной строкой', (): void => {
        // Её искали по имени, и она должна найтись; детей, в которых запроса нет, при ней не будет.
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, 'сохранён');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu).toEqual([]);
    });

    it('SC-UK-62 — совпавший пункт без детей остаётся пунктом, а не пустой папкой', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, 'создание');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('create');
        expect(found[0].submenu).toBeUndefined();
    });

    it('SC-UK-61 — верхний уровень отбирается по-прежнему', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, 'сводка');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('dashboard');
    });

    it('SC-UK-25 — пустой запрос отдаёт набор целиком, с нетронутыми папками', (): void => {
        const found: ISideMenu.Item[] = filterSubMenuItems(NESTED, '');

        expect(found.length).toBe(3);
        expect(found[2].submenu?.length).toBe(3);
    });

    it('SC-UK-61 — набор потребителя отбор не правит', (): void => {
        // Правка `submenu` на месте вернула бы урезанное меню на стёртый запрос.
        filterSubMenuItems(NESTED, 'круговая');

        expect(NESTED[2].submenu?.length).toBe(3);
        expect(NESTED[2].submenu?.[2].submenu?.length).toBe(1);
    });
});

describe('subMenuIdsToExpand', (): void => {
    it('SC-UK-63 — папка, пережившая отбор, названа раскрытой', (): void => {
        expect(subMenuIdsToExpand(filterSubMenuItems(NESTED, 'круговая'))).toEqual(['saved']);
    });

    it('SC-UK-63 — раскрытыми названы все папки по дороге к совпавшему пункту', (): void => {
        expect(subMenuIdsToExpand(filterSubMenuItems(NESTED, '2024'))).toEqual(['saved', 'past']);
    });

    it('SC-UK-63 — в списке без папок раскрывать нечего', (): void => {
        // Утверждение об отсутствии идёт в паре с положительным: без него оно зелено и на пустом
        // отборе, где искать нечего вовсе.
        expect(filterSubMenuItems(ITEMS, 'курс').length).toBe(1);
        expect(subMenuIdsToExpand(filterSubMenuItems(ITEMS, 'курс'))).toEqual([]);
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

describe('SC-UK-36 — отметка совпавшего в подписи', () => {
    it('пустой запрос ничего не отмечает', () => {
        expect(splitSubMenuTitle('Курсы валют', '')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('запрос, которого в подписи нет, ничего не отмечает', () => {
        expect(splitSubMenuTitle('Курсы валют', 'налог')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('отмечено ровно найденное, а не вся подпись', () => {
        expect(splitSubMenuTitle('Курсы валют', 'валют')).toEqual([
            { text: 'Курсы ', matched: false },
            { text: 'валют', matched: true },
        ]);
    });

    it('регистр подписи остаётся тем, каким его написал потребитель', () => {
        expect(splitSubMenuTitle('Press release', 'PRESS')).toEqual([
            { text: 'Press', matched: true },
            { text: ' release', matched: false },
        ]);
    });

    it('отмечены все вхождения, а не первое', () => {
        expect(splitSubMenuTitle('Мега меню', 'ме')).toEqual([
            { text: 'Ме', matched: true },
            { text: 'га ', matched: false },
            { text: 'ме', matched: true },
            { text: 'ню', matched: false },
        ]);
    });

    it('запрос из одних пробелов ничего не отмечает: отбор их тоже не считает запросом', () => {
        expect(splitSubMenuTitle('Курсы валют', '   ')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('пустая подпись отдаёт пустой список: рисовать нечего', () => {
        expect(splitSubMenuTitle('', 'ме')).toEqual([]);
    });
});

describe('walkSubMenuItems', (): void => {
    it('SC-UK-64 — закрытая папка стоит в списке одной строкой', (): void => {
        expect(walkSubMenuItems(NESTED, []).map((item: ISideMenu.Item): string | number => item.id)).toEqual([
            'dashboard',
            'create',
            'saved',
        ]);
    });

    it('SC-UK-64 — раскрытая папка отдаёт свои пункты следом за собой', (): void => {
        expect(walkSubMenuItems(NESTED, ['saved']).map((item: ISideMenu.Item): string | number => item.id)).toEqual([
            'dashboard',
            'create',
            'saved',
            'pie',
            'bars',
            'past',
        ]);
    });

    it('SC-UK-64 — вложенная раскрытая папка спускается тем же правилом', (): void => {
        expect(walkSubMenuItems(NESTED, ['saved', 'past']).map((item: ISideMenu.Item): string | number => item.id)).toEqual([
            'dashboard',
            'create',
            'saved',
            'pie',
            'bars',
            'past',
            'y2024',
        ]);
    });
});

describe('stepSubMenuHighlight', (): void => {
    const WALK: ISideMenu.Item[] = walkSubMenuItems(NESTED, ['saved']);

    it('SC-UK-64 — подсветки нет: стрелка вниз берёт первый пункт, вверх последний', (): void => {
        expect(stepSubMenuHighlight(WALK, null, 1)).toBe('dashboard');
        expect(stepSubMenuHighlight(WALK, null, -1)).toBe('past');
    });

    it('SC-UK-64 — шаг идёт по видимому списку, внутрь раскрытой папки тоже', (): void => {
        expect(stepSubMenuHighlight(WALK, 'saved', 1)).toBe('pie');
        expect(stepSubMenuHighlight(WALK, 'pie', -1)).toBe('saved');
    });

    it('SC-UK-64 — у краёв ходьба останавливается и не заворачивается на другой конец', (): void => {
        expect(stepSubMenuHighlight(WALK, 'dashboard', -1)).toBe('dashboard');
        expect(stepSubMenuHighlight(WALK, 'past', 1)).toBe('past');
    });

    it('SC-UK-64 — в пустом списке подсвечивать нечего', (): void => {
        // Утверждение об отсутствии идёт в паре с положительным: на непустом списке шаг работает.
        expect(stepSubMenuHighlight(WALK, null, 1)).not.toBeNull();
        expect(stepSubMenuHighlight([], null, 1)).toBeNull();
    });

    it('SC-UK-64 — номер, которого в видимом списке нет, читается как отсутствие подсветки', (): void => {
        // Список пересобирается на каждую букву запроса, и прежний пункт из него уходит.
        expect(stepSubMenuHighlight(WALK, 'нет такого пункта', 1)).toBe('dashboard');
    });
});
