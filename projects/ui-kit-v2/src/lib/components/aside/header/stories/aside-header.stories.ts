import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideHeaderComponent } from './component/test-aside-header.component';

export default {
    title: 'Components/AsideHeader',
    component: TestRtAsideHeaderComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        overline: { control: { type: 'text' } },
        badges: { control: false },
        closable: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtAsideHeaderComponent>;

type Story = StoryObj<TestRtAsideHeaderComponent>;

export const Default: Story = {
    args: {
        title: 'Заголовок',
        overline: null,
        badges: [],
        closable: true,
        loading: false,
    },
};
