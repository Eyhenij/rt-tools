import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToastComponent } from './component/test-toast.component';

export default {
    title: 'Components/Toast',
    component: TestRtToastComponent,
    argTypes: {
        toast: { control: false },
        index: { control: { type: 'number' } },
        totalToasts: { control: { type: 'number' } },
        heights: { control: false },
        expanded: { control: { type: 'boolean' } },
        expandByDefault: { control: { type: 'boolean' } },
        interacting: { control: { type: 'boolean' } },
        position: {
            options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
            control: { type: 'select' },
        },
        visibleToasts: { control: { type: 'number' } },
        duration: { control: { type: 'number' } },
    },
} as Meta<TestRtToastComponent>;

type Story = StoryObj<TestRtToastComponent>;

export const Default: Story = {
    args: {
        toast: { id: 1, severity: 'info', message: 'Сообщение' },
        index: 0,
        totalToasts: 0,
        heights: [],
        expanded: false,
        expandByDefault: false,
        interacting: false,
        position: 'bottom-right',
        visibleToasts: 3,
        duration: 4000,
    },
};
