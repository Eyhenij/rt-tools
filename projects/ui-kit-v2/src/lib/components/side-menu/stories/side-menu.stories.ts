import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSideMenuComponent } from './component/test-side-menu.component';

export default {
    title: 'Organisms/Navigation/SideMenu',
    component: TestRtSideMenuComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        items: { control: 'object' },
        activeIds: { control: 'object' },
        mode: { control: 'inline-radio', options: ['hover', 'pinned'] },
        width: { control: { type: 'number', min: 120, max: 480, step: 16 } },
    },
} as Meta<TestRtSideMenuComponent>;

type TStory = StoryObj<TestRtSideMenuComponent>;

export const Playground: TStory = {
    args: { mode: 'pinned', activeIds: ['reports', 'sales'], width: null },
};
