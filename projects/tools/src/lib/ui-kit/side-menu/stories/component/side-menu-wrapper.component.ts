import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { ISideMenu } from '../../../../util';
import { RtuiSideMenuComponent, RtuiSideMenuFooterDirective, RtuiSideMenuHeaderDirective } from '../../menu/rtui-side-menu.component';

export const MENU_ITEMS: Readonly<ISideMenu.Item[]> = Object.freeze([
    {
        id: 1,
        icon: 'layers',
        name: 'Content',
        iconButton: { icon: 'arrow_forward' },
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
    { id: 12, icon: 'settings', name: 'Settings', link: '/settings' },
    { id: 13, icon: 'group', name: 'Users', link: '/users' },
    { id: 14, icon: 'perm_media', name: 'Media', link: '/media' },
    { id: 15, icon: 'link', name: 'Links', link: '/links' },
    { id: 16, icon: 'alt_route', name: 'Redirects', link: '/redirects' },
    { id: 17, icon: 'person_add', name: 'Add user', link: '/add-manager' },
    { id: 18, icon: 'tag', name: 'Tags', link: '/tags' },
    {
        id: 19,
        icon: 'category',
        name: 'Collections',
        iconButton: { icon: 'arrow_forward' },
        submenu: [
            { id: 20, name: 'Products', link: '/collections/products' },
            { id: 21, name: 'Specifications', link: '/collections/specifications' },
            { id: 22, name: 'Brands', link: '/collections/brands' },
            { id: 23, name: 'Coupons', link: '/collections/coupons' },
        ],
    },
    {
        id: 24,
        icon: 'question_mark',
        name: 'Test long name',
        iconButton: { icon: 'arrow_forward' },
        submenu: [
            { id: 25, icon: 'info', name: 'Link1', link: '/test/1' },
            {
                id: 26,
                icon: 'folder',
                name: 'Level 1',
                submenu: [
                    { id: 27, name: 'Item 1', link: '/test/level1/1', iconButton: { icon: 'add', data: 'data' } },
                    { id: 28, name: 'Item 2', link: '/test/level1/2', iconButton: { icon: 'edit', data: 'data' } },
                    {
                        id: 29,
                        icon: 'folder',
                        name: 'Level 2',
                        submenu: [
                            {
                                id: 30,
                                name: 'Item 1',
                                link: '/test/level1/level2/1',
                                iconButton: { icon: 'add', data: 'data' },
                            },
                            { id: 31, name: 'Item 2', link: '/test/level1/level2/2' },
                            {
                                id: 32,
                                icon: 'info',
                                name: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                                link: '/test/level1/level2/3',
                                iconButton: { icon: 'add', data: 'data' },
                            },
                            {
                                id: 33,
                                icon: 'folder',
                                name: 'Level 3',
                                submenu: [
                                    {
                                        id: 34,
                                        name: 'Item 1',
                                        link: '/test/level1/level2/level3/1',
                                        iconButton: { icon: 'add', data: 'data' },
                                    },
                                    { id: 35, name: 'Item 2', link: '/test/level1/level2/level3/2' },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 36,
                name: 'Link 2 Lorem Ipsum is simply dummy text of the printing and typesetting',
                link: '/test/2',
            },
        ],
    },
]);

@Component({
    standalone: true,
    selector: 'side-menu-wrapper',
    templateUrl: './side-menu-wrapper.component.html',
    styleUrls: ['./side-menu-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatButton,
        MatIcon,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiSideMenuHeaderDirective,
        RtuiSideMenuFooterDirective,

        // components
        RtuiSideMenuComponent,
        RtuiSideMenuFooterDirective,
        RtuiSideMenuHeaderDirective,
        RtuiSideMenuComponent,
    ],
    providers: [],
})
export class SideMenuWrapperComponent {
    public menuItems: typeof MENU_ITEMS = [...MENU_ITEMS];
    public activeMenuIds: Array<number | string> = [];
    public isMobile: boolean = false;
    public isSubMenuXScrollEnabled: boolean = true;

    public closeMobileMenu(): void {
        console.log('CloseMobileMenuAction');
    }

    public logout(): void {
        console.log('LogOutAction');
    }
}
