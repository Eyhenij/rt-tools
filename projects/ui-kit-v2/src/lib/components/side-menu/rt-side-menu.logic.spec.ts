import {
    clampSideMenuWidth,
    filterSideMenuItems,
    splitSideMenuTitle,
    stepSideMenuHighlight,
    sideMenuIdsToExpand,
    sideMenuWidthByKey,
    RT_SIDE_MENU_WIDTH_MAX,
    RT_SIDE_MENU_WIDTH_MIN,
    walkSideMenuItems,
} from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

const ITEMS: ReadonlyArray<IRtSideMenu.Item> = [
    { id: 'rates', name: 'Курсы валют', link: '/rates' },
    { id: 'taxes', name: 'Налоги', link: '/taxes' },
    { id: 'divider' },
];

describe('filterSideMenuItems', (): void => {
    it('пустой запрос показывает подменю целиком', (): void => {
        expect(filterSideMenuItems(ITEMS, '').length).toBe(ITEMS.length);
    });

    it('запрос из одних пробелов считается пустым', (): void => {
        // Иначе набранный и стёртый запрос оставляет подменю пустым: пробел глазами не виден.
        expect(filterSideMenuItems(ITEMS, '   ').length).toBe(ITEMS.length);
    });

    it('отбор идёт по подстроке подписи без учёта регистра', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(ITEMS, 'курс');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('rates');
    });

    it('пункт без подписи в отбор не попадает', (): void => {
        // Разделителю нечем совпасть, и в отобранном списке он выглядел бы пустой строкой.
        expect(filterSideMenuItems(ITEMS, 'а').every((item: IRtSideMenu.Item): boolean => item.id !== 'divider')).toBe(true);
    });

    it('совпадений нет — возвращается пустой список, а не исходный', (): void => {
        expect(filterSideMenuItems(ITEMS, 'такого пункта нет').length).toBe(0);
    });

    it('исходный набор отбор не правит', (): void => {
        filterSideMenuItems(ITEMS, 'курс');

        expect(ITEMS.length).toBe(3);
    });
});

/**
 * Набор с папками: потребитель кладёт то, что человек ищет по имени, внутрь `submenu`, и вложенность
 * бывает глубже одного уровня.
 */
const NESTED: ReadonlyArray<IRtSideMenu.Item> = [
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
const MATCHING_FOLDER: ReadonlyArray<IRtSideMenu.Item> = [
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

describe('filterSideMenuItems — спуск внутрь папок', (): void => {
    it('SC-UKV-406 — совпал пункт внутри папки: папка остаётся, и в ней только совпавшее', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, 'круговая');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu?.length).toBe(1);
        expect(found[0].submenu?.[0].id).toBe('pie');
    });

    it('вложенность глубже одного уровня считается тем же правилом', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, '2024');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu?.length).toBe(1);
        expect(found[0].submenu?.[0].id).toBe('past');
        expect(found[0].submenu?.[0].submenu?.[0].id).toBe('y2024');
    });

    it('папка без единого совпадения внутри в отбор не попадает', (): void => {
        // Иначе пустая папка остаётся на экране заголовком без содержимого.
        expect(filterSideMenuItems(NESTED, 'такого пункта нет').length).toBe(0);
    });

    it('совпала подпись самой папки: в ней остаются только совпавшие дети', (): void => {
        // Иначе одно совпадение по имени папки вытаскивает на экран весь её состав, и человек
        // читает как найденное то, в чём запроса нет.
        const found: IRtSideMenu.Item[] = filterSideMenuItems(MATCHING_FOLDER, 'отчёт');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('reports');
        expect(found[0].submenu?.map((item: IRtSideMenu.Item): string => String(item.id))).toEqual(['weekly', 'monthly']);
    });

    it('SC-UKV-407 — совпала подпись папки, а внутри никто: папка стоит одной строкой', (): void => {
        // Её искали по имени, и она должна найтись; детей, в которых запроса нет, при ней не будет.
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, 'сохранён');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('saved');
        expect(found[0].submenu).toEqual([]);
    });

    it('совпавший пункт без детей остаётся пунктом, а не пустой папкой', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, 'создание');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('create');
        expect(found[0].submenu).toBeUndefined();
    });

    it('верхний уровень отбирается по-прежнему', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, 'сводка');

        expect(found.length).toBe(1);
        expect(found[0].id).toBe('dashboard');
    });

    it('пустой запрос отдаёт набор целиком, с нетронутыми папками', (): void => {
        const found: IRtSideMenu.Item[] = filterSideMenuItems(NESTED, '');

        expect(found.length).toBe(3);
        expect(found[2].submenu?.length).toBe(3);
    });

    it('набор потребителя отбор не правит', (): void => {
        // Правка `submenu` на месте вернула бы урезанное меню на стёртый запрос.
        filterSideMenuItems(NESTED, 'круговая');

        expect(NESTED[2].submenu?.length).toBe(3);
        expect(NESTED[2].submenu?.[2].submenu?.length).toBe(1);
    });
});

describe('sideMenuIdsToExpand', (): void => {
    it('папка, пережившая отбор, названа раскрытой', (): void => {
        expect(sideMenuIdsToExpand(filterSideMenuItems(NESTED, 'круговая'))).toEqual(['saved']);
    });

    it('раскрытыми названы все папки по дороге к совпавшему пункту', (): void => {
        expect(sideMenuIdsToExpand(filterSideMenuItems(NESTED, '2024'))).toEqual(['saved', 'past']);
    });

    it('в списке без папок раскрывать нечего', (): void => {
        // Утверждение об отсутствии идёт в паре с положительным: без него оно зелено и на пустом
        // отборе, где искать нечего вовсе.
        expect(filterSideMenuItems(ITEMS, 'курс').length).toBe(1);
        expect(sideMenuIdsToExpand(filterSideMenuItems(ITEMS, 'курс'))).toEqual([]);
    });
});

describe('ширина подменю', (): void => {
    it('SC-UKV-411 — ширина уже предела приводится к нижнему пределу', (): void => {
        expect(clampSideMenuWidth(10)).toBe(RT_SIDE_MENU_WIDTH_MIN);
    });

    it('SC-UKV-411 — ширина шире предела приводится к верхнему пределу', (): void => {
        expect(clampSideMenuWidth(5000)).toBe(RT_SIDE_MENU_WIDTH_MAX);
    });

    it('SC-UKV-411 — ширина внутри пределов остаётся своей', (): void => {
        expect(clampSideMenuWidth(RT_SIDE_MENU_WIDTH_MIN + 40)).toBe(RT_SIDE_MENU_WIDTH_MIN + 40);
    });

    it('SC-UKV-411 — стрелка вправо у верхнего предела упирается в него, а не проскакивает', (): void => {
        expect(sideMenuWidthByKey('ArrowRight', 470)).toBe(RT_SIDE_MENU_WIDTH_MAX);
    });

    it('SC-UKV-411 — стрелка влево сужает на шаг, Home и End ведут к пределам', (): void => {
        expect(sideMenuWidthByKey('ArrowLeft', 300)).toBe(284);
        expect(sideMenuWidthByKey('Home', 300)).toBe(RT_SIDE_MENU_WIDTH_MIN);
        expect(sideMenuWidthByKey('End', 300)).toBe(RT_SIDE_MENU_WIDTH_MAX);
    });

    it('SC-UKV-411 — клавиша не о ширине ширины не даёт', (): void => {
        expect(sideMenuWidthByKey('Tab', 300)).toBeNull();
    });
});

describe('отметка совпавшего в подписи', () => {
    it('пустой запрос ничего не отмечает', () => {
        expect(splitSideMenuTitle('Курсы валют', '')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('запрос, которого в подписи нет, ничего не отмечает', () => {
        expect(splitSideMenuTitle('Курсы валют', 'налог')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('отмечено ровно найденное, а не вся подпись', () => {
        expect(splitSideMenuTitle('Курсы валют', 'валют')).toEqual([
            { text: 'Курсы ', matched: false },
            { text: 'валют', matched: true },
        ]);
    });

    it('регистр подписи остаётся тем, каким его написал потребитель', () => {
        expect(splitSideMenuTitle('Press release', 'PRESS')).toEqual([
            { text: 'Press', matched: true },
            { text: ' release', matched: false },
        ]);
    });

    it('отмечены все вхождения, а не первое', () => {
        expect(splitSideMenuTitle('Мега меню', 'ме')).toEqual([
            { text: 'Ме', matched: true },
            { text: 'га ', matched: false },
            { text: 'ме', matched: true },
            { text: 'ню', matched: false },
        ]);
    });

    it('запрос из одних пробелов ничего не отмечает: отбор их тоже не считает запросом', () => {
        expect(splitSideMenuTitle('Курсы валют', '   ')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('пустая подпись отдаёт пустой список: рисовать нечего', () => {
        expect(splitSideMenuTitle('', 'ме')).toEqual([]);
    });
});

describe('walkSideMenuItems', (): void => {
    it('SC-UKV-408 — закрытая папка стоит в списке одной строкой', (): void => {
        expect(walkSideMenuItems(NESTED, []).map((item: IRtSideMenu.Item): string | number => item.id)).toEqual([
            'dashboard',
            'create',
            'saved',
        ]);
    });

    it('раскрытая папка отдаёт свои пункты следом за собой', (): void => {
        expect(walkSideMenuItems(NESTED, ['saved']).map((item: IRtSideMenu.Item): string | number => item.id)).toEqual([
            'dashboard',
            'create',
            'saved',
            'pie',
            'bars',
            'past',
        ]);
    });

    it('вложенная раскрытая папка спускается тем же правилом', (): void => {
        expect(walkSideMenuItems(NESTED, ['saved', 'past']).map((item: IRtSideMenu.Item): string | number => item.id)).toEqual([
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

describe('stepSideMenuHighlight', (): void => {
    const WALK: IRtSideMenu.Item[] = walkSideMenuItems(NESTED, ['saved']);

    it('подсветки нет: стрелка вниз берёт первый пункт, вверх последний', (): void => {
        expect(stepSideMenuHighlight(WALK, null, 1)).toBe('dashboard');
        expect(stepSideMenuHighlight(WALK, null, -1)).toBe('past');
    });

    it('шаг идёт по видимому списку, внутрь раскрытой папки тоже', (): void => {
        expect(stepSideMenuHighlight(WALK, 'saved', 1)).toBe('pie');
        expect(stepSideMenuHighlight(WALK, 'pie', -1)).toBe('saved');
    });

    it('у краёв ходьба останавливается и не заворачивается на другой конец', (): void => {
        expect(stepSideMenuHighlight(WALK, 'dashboard', -1)).toBe('dashboard');
        expect(stepSideMenuHighlight(WALK, 'past', 1)).toBe('past');
    });

    it('в пустом списке подсвечивать нечего', (): void => {
        // Утверждение об отсутствии идёт в паре с положительным: на непустом списке шаг работает.
        expect(stepSideMenuHighlight(WALK, null, 1)).not.toBeNull();
        expect(stepSideMenuHighlight([], null, 1)).toBeNull();
    });

    it('номер, которого в видимом списке нет, читается как отсутствие подсветки', (): void => {
        // Список пересобирается на каждую букву запроса, и прежний пункт из него уходит.
        expect(stepSideMenuHighlight(WALK, 'нет такого пункта', 1)).toBe('dashboard');
    });
});
