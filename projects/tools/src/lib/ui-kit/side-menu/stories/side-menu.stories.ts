import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

export default {
    title: 'Components/SideMenu',
    component: TestSideMenuWrapperComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestSideMenuWrapperComponent>;

type Story = StoryObj<TestSideMenuWrapperComponent>;

export const Default: Story = {
    args: {
        isMobile: false,
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const Mobile: Story = {
    args: {
        isMobile: true,
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const DefaultActiveMenu: Story = {
    args: {
        isMobile: false,
        activeMenuIds: [24, 26, 29, 33, 35],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const MobileActiveMenu: Story = {
    args: {
        isMobile: true,
        activeMenuIds: [24, 26, 29, 33, 35],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};
