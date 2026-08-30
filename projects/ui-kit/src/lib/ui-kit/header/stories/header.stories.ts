import { Meta, StoryObj } from '@storybook/angular';

import { TestHeaderComponent } from './component/test-header.component';

export default {
    title: 'Components/Header',
    component: TestHeaderComponent,
} as Meta<TestHeaderComponent>;

type TStory = StoryObj<TestHeaderComponent>;

export const Header: TStory = {
    args: {
        isMobile: false,
        isTabs: false,
        title: 'Header Title Example',
        content: 'Content example',
    },
};
