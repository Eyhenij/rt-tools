import { filterSubMenuItems } from './side-menu.logic';
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
