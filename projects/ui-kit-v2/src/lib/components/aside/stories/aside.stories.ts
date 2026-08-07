import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideComponent } from './component/test-aside.component';

export default {
    title: 'Components/Aside',
    component: TestRtAsideComponent,
    argTypes: {
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        contentLayout: {
            options: ['default', 'tabs'],
            control: { type: 'select' },
        },
        width: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtAsideComponent>;

type Story = StoryObj<TestRtAsideComponent>;

export const Playground: Story = {
    args: {
        size: 'md',
        contentLayout: 'default',
        width: null,
        ariaLabel: null,
    },
};
