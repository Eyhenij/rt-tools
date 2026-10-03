import { sideMenuIconName, unpairedSideMenuIcons } from './rt-side-menu-icon.logic';
import { IRtSideMenu } from './rt-side-menu.model';

describe('rt-side-menu — значок пункта', (): void => {
    it('SC-UKV-531 — имя кита рисуется как есть', (): void => {
        expect(sideMenuIconName('folder')).toBe('folder');
        expect(sideMenuIconName('cog')).toBe('cog');
    });

    it('SC-UKV-531 — имя Material первого кита рисуется своей парой из перечня кита', (): void => {
        expect(sideMenuIconName('settings')).toBe('cog');
        expect(sideMenuIconName('arrow_forward')).toBe('arrow-right');
        expect(sideMenuIconName('add')).toBe('ico-plus');
        expect(sideMenuIconName('home')).toBe('home');
        expect(sideMenuIconName('insert_chart')).toBe('chart-bar');
    });

    it('SC-UKV-531 — имя, которого кит не рисует, и пустое имя значка не дают', (): void => {
        expect(sideMenuIconName('rocket_launch')).toBeNull();
        expect(sideMenuIconName('')).toBeNull();
        expect(sideMenuIconName(undefined)).toBeNull();
    });
});

describe('rt-side-menu — о каких значках предупредить', (): void => {
    const items: IRtSideMenu.Item[] = [
        { id: 1, icon: 'settings', name: 'Настройки' },
        {
            id: 2,
            icon: 'rocket_launch',
            name: 'Запуски',
            submenu: [
                { id: 21, icon: 'stadia_controller', name: 'Игры', link: '/a', iconButton: { icon: 'qr_code_scanner' } },
                { id: 22, icon: 'rocket_launch', name: 'Повтор', link: '/b', iconButton: { icon: 'arrow_forward' } },
            ],
        },
    ];

    it('SC-UKV-533 — без своего шаблона называются имена пунктов и кнопок без значка, каждое один раз, на любой глубине', (): void => {
        expect(unpairedSideMenuIcons(items, false)).toEqual(['rocket_launch', 'stadia_controller', 'qr_code_scanner']);
    });

    it('SC-UKV-533 — свой шаблон закрывает и пункты, и кнопку строки', (): void => {
        expect(unpairedSideMenuIcons(items, false)).toContain('qr_code_scanner');
        expect(unpairedSideMenuIcons(items, true)).toEqual([]);
    });

    it('SC-UKV-533 — меню, где кит рисует всё, предупреждать не о чем', (): void => {
        expect(unpairedSideMenuIcons([{ id: 1, icon: 'cog', iconButton: { icon: 'add' } }], false)).toEqual([]);
    });
});
