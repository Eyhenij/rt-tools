import { IRtSideMenu } from '../../rt-side-menu.model';

/** Длинное имя пункта: им показывают, как меню переносит текст. */
const LONG_ITEM_NAME: string = 'Item 2 Lorem Ipsum is simply dummy text of the printing and typesetting industry';

/**
 * Пункты меню витрины — те же, что в истории бокового меню первого кита: те же разделы, подписи,
 * вложенность и длинные подписи, чтобы два кадра сравнивались строка в строку. Значки Material
 * заменены значками кита по `rt-icon-material-map.ts`, а где пары там нет — ближайшими по рисунку.
 * Стрелку у раздела с подменю второй кит рисует сам, поэтому кнопки со стрелкой у разделов нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
export const SIDE_MENU_STORY_ITEMS: readonly IRtSideMenu.Item[] = [
    {
        id: 1,
        icon: 'clone',
        name: 'Content',
        submenu: [
            { id: 2, name: 'News', link: '/content/news' },
            { id: 3, name: 'Learn', link: '/content/learn' },
            { id: 4, name: 'Review', link: '/content/review' },
            { id: 5, name: 'Press release', link: '/content/press-release' },
            { id: 6, name: 'L1', link: '/content/l1' },
            { id: 7, name: 'L2', link: '/content/l2' },
            { id: 8, name: 'L3', link: '/content/l3' },
            { id: 9, name: 'Sidebar', link: '/content/sidebar' },
            { id: 10, name: 'Mega Menu', link: '/content/mega-menu' },
            { id: 11, name: 'Home page', link: '/content/home-page' },
        ],
    },
    { id: 12, icon: 'cog', name: 'Settings', link: '/settings' },
    { id: 13, icon: 'users', name: 'Users', link: '/users' },
    { id: 14, icon: 'images', name: 'Media', link: '/media' },
    { id: 15, icon: 'link', name: 'Links', link: '/links' },
    { id: 16, icon: 'directions', name: 'Redirects', link: '/redirects' },
    { id: 17, icon: 'user-plus', name: 'Add user', link: '/add-manager' },
    { id: 18, icon: 'hashtag', name: 'Tags', link: '/tags' },
    {
        id: 19,
        icon: 'th-large',
        name: 'Collections',
        submenu: [
            { id: 20, name: 'Products', link: '/collections/products' },
            { id: 21, name: 'Specifications', link: '/collections/specifications' },
            { id: 22, name: 'Brands', link: '/collections/brands' },
            { id: 23, name: 'Coupons', link: '/collections/coupons' },
        ],
    },
    {
        id: 24,
        icon: 'question-circle',
        name: 'Test long name',
        submenu: [
            { id: 25, icon: 'info-circle', name: 'Link1', link: '/test/1' },
            {
                id: 26,
                icon: 'folder',
                name: 'Level 1 Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                submenu: [
                    { id: 27, name: 'Item 1', link: '/test/level1/1', iconButton: { icon: 'ico-plus', data: 'data' } },
                    { id: 28, name: LONG_ITEM_NAME, link: '/test/level1/2', iconButton: { icon: 'pencil', data: 'data' } },
                    {
                        id: 29,
                        icon: 'folder',
                        name: 'Level 2',
                        submenu: [
                            {
                                id: 30,
                                name: 'Item 1 Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                                link: '/test/level1/level2/1',
                                iconButton: { icon: 'ico-plus', data: 'data' },
                            },
                            { id: 31, name: LONG_ITEM_NAME, link: '/test/level1/level2/2' },
                            {
                                id: 32,
                                icon: 'info-circle',
                                name: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                                link: '/test/level1/level2/3',
                                iconButton: { icon: 'ico-plus', data: 'data' },
                            },
                            {
                                id: 33,
                                icon: 'folder',
                                name: 'Level 3 Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                                submenu: [
                                    {
                                        id: 34,
                                        name: 'Item 1',
                                        link: '/test/level1/level2/level3/1',
                                        iconButton: { icon: 'ico-plus', data: 'data' },
                                    },
                                    { id: 35, name: LONG_ITEM_NAME, link: '/test/level1/level2/level3/2' },
                                ],
                            },
                        ],
                    },
                ],
            },
            { id: 36, name: 'Link 2 Lorem Ipsum is simply dummy text of the printing and typesetting', link: '/test/2' },
        ],
    },
];

/** Путь до самого глубокого пункта: так первый кит показывает активное меню. */
export const SIDE_MENU_STORY_DEEP_ACTIVE: ReadonlyArray<string | number> = [24, 26, 29, 33, 35];
