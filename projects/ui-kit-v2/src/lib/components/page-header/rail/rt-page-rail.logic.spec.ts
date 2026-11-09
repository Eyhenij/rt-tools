import { toSections, IRtPageHeaderView } from '../rt-page-header.logic';
import { railMenuItems } from './rt-page-rail.logic';

describe('railMenuItems', (): void => {
    it('SC-UKV-1191 — sections keep the order of the list, and panel groups become one nested list', (): void => {
        const sections: ReadonlyArray<IRtPageHeaderView.Section> = toSections([
            { id: 'home', label: 'Главная', icon: 'home', route: '/home' },
            {
                id: 'money',
                label: 'Финансы',
                columns: [
                    {
                        id: 'c',
                        groups: [
                            { id: 'g1', label: 'Счета', items: [{ id: 'a', label: 'Все счета', route: '/a' }] },
                            { id: 'g2', label: 'Акты', items: [{ id: 'b', label: 'Акты сверки', route: '/b' }] },
                        ],
                    },
                ],
            },
        ]);

        expect(railMenuItems(sections)).toEqual([
            { id: 'home', name: 'Главная', icon: 'home', link: '/home' },
            {
                id: 'money',
                name: 'Финансы',
                submenu: [
                    { id: 'a', name: 'Все счета', link: '/a' },
                    { id: 'b', name: 'Акты сверки', link: '/b' },
                ],
            },
        ]);
    });
});
