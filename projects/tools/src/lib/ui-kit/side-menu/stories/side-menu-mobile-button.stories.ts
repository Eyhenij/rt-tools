import { Meta, StoryObj } from '@storybook/angular';

import { RtuiSideMenuMobileButtonComponent } from '../menu-mobile-button/rtui-side-menu-mobile-button.component';

const meta: Meta<RtuiSideMenuMobileButtonComponent> = {
    title: 'Components/RtuiSideMenuMobileButton',
    component: RtuiSideMenuMobileButtonComponent,
    decorators: [],
};

export default meta;

type Story = StoryObj<RtuiSideMenuMobileButtonComponent>;

export const Button: Story = {
    args: {
        isVisible: true,
    },
};
