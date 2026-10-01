import { sideMenuIconName, unpairedSideMenuIcons } from './rt-side-menu-icon.logic';
import { IRtSideMenu } from './rt-side-menu.model';

describe('rt-side-menu — значок пункта', (): void => {
    it('SC-UKV-480 — имя кита рисуется как есть', (): void => {
        expect(sideMenuIconName('folder')).toBe('folder');
        expect(sideMenuIconName('cog')).toBe('cog');
    });

    it('SC-UKV-480 — имя Material первого кита рисуется своей парой из перечня кита', (): void => {
        expect(sideMenuIconName('settings')).toBe('cog');
        expect(sideMenuIconName('arrow_forward')).toBe('arrow-right');
        expect(sideMenuIconName('add')).toBe('ico-plus');
    });

    it('SC-UKV-480 — имя, которого кит не рисует, и пустое имя значка не дают', (): void => {
        expect(sideMenuIconName('fork_spoon')).toBeNull();
        expect(sideMenuIconName('')).toBeNull();
        expect(sideMenuIconName(undefined)).toBeNull();
    });
});

describe('rt-side-menu — о каких значках предупредить', (): void => {
    const items: IRtSideMenu.Item[] = [
        { id: 1, icon: 'settings', name: 'Настройки' },
        {
            id: 2,
            icon: 'fork_spoon',
            name: 'Еда',
            submenu: [
                { id: 21, icon: 'troubleshoot', name: 'Прогноз', link: '/a', iconButton: { icon: 'zoom_in' } },
                { id: 22, icon: 'fork_spoon', name: 'Повтор', link: '/b', iconButton: { icon: 'arrow_forward' } },
            ],
        },
    ];

    it('SC-UKV-482 — без своего шаблона называются имена пунктов и кнопок без значка, каждое один раз, на любой глубине', (): void => {
        expect(unpairedSideMenuIcons(items, false)).toEqual(['fork_spoon', 'troubleshoot', 'zoom_in']);
    });

    it('SC-UKV-482 — свой шаблон закрывает пункты, но не кнопку строки', (): void => {
        expect(unpairedSideMenuIcons(items, true)).toEqual(['zoom_in']);
    });

    it('SC-UKV-482 — меню, где кит рисует всё, предупреждать не о чем', (): void => {
        expect(unpairedSideMenuIcons([{ id: 1, icon: 'cog', iconButton: { icon: 'add' } }], false)).toEqual([]);
    });
});
