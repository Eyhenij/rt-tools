import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMenuComponent } from './component/test-menu.component';

export default {
    title: 'Components/Menu',
    component: TestRtMenuComponent,
    argTypes: {
        icon: { control: false },
        ariaLabel: { control: { type: 'text' } },
        align: {
            options: ['start', 'end'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMenuComponent>;

type Story = StoryObj<TestRtMenuComponent>;

export const Default: Story = {
    args: {
        icon: 'ellipsis-h',
        ariaLabel: '',
        align: 'end',
        disabled: false,
    },
};
