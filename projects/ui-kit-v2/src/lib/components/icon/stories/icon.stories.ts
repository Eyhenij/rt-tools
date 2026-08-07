import { Meta, StoryObj } from '@storybook/angular';

import { TestRtIconComponent } from './component/test-icon.component';

export default {
    title: 'Components/Icon',
    component: TestRtIconComponent,
    argTypes: {
        name: { control: false },
        size: {
            options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
            control: { type: 'select' },
        },
        color: {
            options: ['current', 'muted', 'info', 'success', 'warning', 'danger', 'inverse'],
            control: { type: 'select' },
        },
        rotate: { control: { type: 'number' } },
    },
} as Meta<TestRtIconComponent>;

type Story = StoryObj<TestRtIconComponent>;

export const Playground: Story = {
    args: {
        name: 'alarm-clock',
        size: 'md',
        color: 'current',
        rotate: null,
    },
};
